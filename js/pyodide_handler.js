//pyodide_handler.js
import { state } from './state.js';

// Python 模板代码保持不变
const PYTHON_TEMPLATE = `
import sys
import io
import json
from lcapy import Circuit
from sympy import sympify, symbols, limit, oo, SympifyError

# Helper function to simplify expressions with 'inf'
def simplify_inf_expression(expr_string):
    temp_var = symbols('x')
    if not isinstance(expr_string, str):
        expr_string = str(expr_string)
    if "inf" not in expr_string:
        try:
            return sympify(expr_string)
        except SympifyError:
            return expr_string # Return as string if cannot be simplified
    
    processed_string = expr_string.replace('inf', str(temp_var))
    try:
        expression = sympify(processed_string, locals={'oo': oo})
        simplified_result = limit(expression, temp_var, oo)
        return simplified_result
    except SympifyError:
        return expr_string # Return as string on error

# Redirect stdout to capture any errors
sys.stdout = io.StringIO()

results = {}
try:
    cct = Circuit("""
{NETLIST}
""")
    
    # Analyze components
    for name in {COMPONENTS}:
        try:
            v = simplify_inf_expression(cct[name].v)
            i = simplify_inf_expression(cct[name].i)
            results[name] = {'v': str(v), 'i': str(i)}
        except Exception as e:
            results[name] = {'error': str(e)}

    # Analyze nodes
    for node_num in {NODES}:
        try:
            # Here, node_num will be a string ('1', '0', etc.) which is what Lcapy expects
            v = simplify_inf_expression(cct[node_num].v)
            # The key will be 'node-1', 'node-0', etc.
            results[f'node-{node_num}'] = {'v': str(v)}
        except Exception as e:
            results[f'node-{node_num}'] = {'error': str(e)}

except Exception as e:
    results['error'] = str(e)

# Return results as a JSON string
print(json.dumps(results))
`;

/**
 * 初始化 Pyodide 并安装 Lcapy。
 * (此函数保持不变)
 */
export async function initPyodide(statusCallback) {
    if (state.pyodide) return state.pyodide;

    state.isPyodideLoading = true;
    statusCallback("Loading Pyodide runtime...");
    state.pyodide = await loadPyodide();

    statusCallback("Loading core dependencies (numpy, scipy...)...");
    await state.pyodide.loadPackage(["numpy", "scipy", "sympy", "matplotlib", "networkx"]);
    
    statusCallback("Loading micropip...");
    await state.pyodide.loadPackage("micropip");
    
    statusCallback("Installing lcapy...");
    await state.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('lcapy', deps=False)
    `);
    
    statusCallback("Lcapy installed successfully!");
    state.isPyodideLoading = false;
    return state.pyodide;
}

/**
 * 运行 Lcapy 分析。
 * (此函数已更新)
 */
export async function runAnalysis(netlist, nodeMap) {
    if (!state.pyodide) {
        throw new Error("Pyodide is not initialized.");
    }
    state.isAnalyzing = true;

    const componentNames = state.components
        .filter(c => c.type !== 'ground')
        .map(c => `'${c.name}'`);

    // --- FIX START ---
    // 将节点编号转换为字符串列表，以确保 Python 使用字符串进行查询。
    // 例如，生成 [''0'', ''1'', ''2''] 而不是 [0, 1, 2]。
    const nodeNumbersAsStrings = Array.from(nodeMap.values()).map(num => `'${String(num)}'`);
    
    const pythonCode = PYTHON_TEMPLATE
        .replace('{NETLIST}', netlist)
        .replace('{COMPONENTS}', `[${componentNames.join(', ')}]`)
        .replace('{NODES}', `[${nodeNumbersAsStrings.join(', ')}]`); // 使用字符串列表
    // --- FIX END ---
        
    try {
        await state.pyodide.runPythonAsync('import sys, io; sys.stdout = io.StringIO()');
        await state.pyodide.runPythonAsync(pythonCode);
        const stdout = await state.pyodide.runPythonAsync("sys.stdout.getvalue()");
        
        const results = JSON.parse(stdout);
        if (results.error) {
            throw new Error(`Lcapy analysis failed: ${results.error}`);
        }

        state.analysisResults = new Map(Object.entries(results));

    } catch (e) {
        console.error("Python execution error:", e);
        // 在控制台打印失败的 Python 代码，方便调试
        console.log("Failed Python code for debugging:\n", pythonCode);
        alert("An error occurred during circuit analysis. Check the console for details.");
        state.analysisResults = null;
    } finally {
        state.isAnalyzing = false;
    }
}