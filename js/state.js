export const state = {
    components: [],
    nodes: new Map(),
    wires: [],
    nextComponentId: { R: 1, V: 1, E: 1, G: 1 },
    nextNodeId: 1,
    placingComponentType: null,
    isDrawingWire: false,
    wireStartTerminal: null,
    draggedComponent: null,
    hoveredComponent: null,
    hoveredWire: null,
    editingComponent: null,

    // --- 新增状态 ---
    pyodide: null,          // Pyodide 实例
    isPyodideLoading: false, // Pyodide 是否正在加载
    isAnalyzing: false,     // Lcapy 是否正在分析
    analysisResults: null,  // 存储分析结果的 Map
    selectedItemId: null,   // 选中的元件或节点的 ID (例如 'R1' 或 'node-1')
};