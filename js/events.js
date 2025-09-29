// js/events.js
import { state } from './state.js';
import { render } from './renderer.js';
import * as actions from './actions.js';
import { generateNetlist,getNetlistNodeMap } from './netlist.js';
import { initPyodide, runAnalysis } from './pyodide_handler.js';

export function setupEventListeners(elements) {
    const { svg, modal,loadingOverlay, loadingStatus, modalSaveBtn, modalInputName, modalInputValue, netlistOutput } = elements;

    document.getElementById('btn-ground').onclick = () => actions.setPlacingComponent('ground'); 
    document.getElementById('btn-voltage').onclick = () => actions.setPlacingComponent('voltage');
    document.getElementById('btn-resistor').onclick = () => actions.setPlacingComponent('resistor');
    document.getElementById('btn-opamp').onclick = () => actions.setPlacingComponent('opamp');
    document.getElementById('btn-generate').onclick = () => {
        netlistOutput.value = generateNetlist();
    };


    document.getElementById('btn-analyze-toggle').onclick = async () => {
        if (state.isPyodideLoading || state.isAnalyzing) return;

        // --- 如果当前在分析模式，则切换回编辑模式 ---
        if (state.isInAnalysisMode) {
            state.isInAnalysisMode = false;
            state.analysisResults = null;
            state.selectedItemId = null;
            render(svg);
            return;
        }

        // --- 如果当前在编辑模式，则开始分析 ---
        loadingOverlay.classList.remove('hidden');
        if (!state.pyodide) {
            try {
                await initPyodide((status) => {
                    loadingStatus.textContent = status;
                });
            } catch (e) {
                console.error("Pyodide initialization failed:", e);
                alert("Failed to initialize analysis engine. Check console for details.");
                loadingOverlay.classList.add('hidden');
                return;
            }
        }
        
        loadingStatus.textContent = "Analyzing circuit...";
        const netlist = generateNetlist();
        const nodeMap = getNetlistNodeMap(); // 需要节点映射来查询节点电压
        if (netlist.trim() === '') {
            alert("Circuit is empty. Add some components first.");
            loadingOverlay.classList.add('hidden');
            return;
        }

        await runAnalysis(netlist, nodeMap);

        loadingOverlay.classList.add('hidden');

        // 分析成功后进入分析模式
        if (state.analysisResults) {
            state.isInAnalysisMode = true;
        }

        state.selectedItemId = null; // 清除之前的选择
        render(svg); // 重新渲染以更新显示
    };

    // SVG Canvas 点击事件 (更新)
    svg.addEventListener('click', (e) => {

        const rect = svg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // 在分析模式下，完全禁用放置元件的功能
        if (state.isInAnalysisMode) {
             // 允许在分析模式下进行选择
            if (state.analysisResults) {
                const group = e.target.closest('.component-group');
                if (group) {
                    state.selectedItemId = group.dataset.id;
                } else {
                    // 检查是否点击了节点区域
                    const nodeMap = getNetlistNodeMap();
                    let clickedNode = null;
                    const clickThreshold = 15 * 15; // 15px aoe

                    nodeMap.forEach((netlistNum, node) => {
                        if(node.terminals.size === 0) return;
                        const { avgX, avgY } = actions.getNodePosition(node);
                        const distSq = (clickX - avgX)**2 + (clickY - avgY)**2;
                        if (distSq < clickThreshold) {
                            clickedNode = `node-${netlistNum}`;
                        }
                    });
                    state.selectedItemId = clickedNode;
                }
                render(svg);
            }
            render(svg);
            return; // 提前返回，不执行放置逻辑
        }        
        // 如果正在放置元件
        if (state.placingComponentType) {
            actions.addNewComponent(state.placingComponentType, clickX, clickY);
            render(svg);
            return;
        }
    });
    
    svg.addEventListener('mousedown', (e) => {
        const target = e.target;
        const group = target.closest('.component-group');
        
        if (target.classList.contains('terminal') && group) {

            // 在分析模式下，禁用所有与连线相关的操作
            if (state.isInAnalysisMode) return; 

            const component = state.components.find(c => c.id === group.dataset.id);
            const terminal = component.terminals.find(t => t.dx == target.getAttribute('cx') && t.dy == target.getAttribute('cy'));

            if (!state.isDrawingWire) {
                state.isDrawingWire = true;
                state.wireStartTerminal = terminal;
            } else {
                if (state.wireStartTerminal !== terminal) {
                    actions.mergeNodes(state.wireStartTerminal.node, terminal.node);
                }
                state.isDrawingWire = false;
                state.wireStartTerminal = null;
            }
            render(svg);
        } else if (group) {
            state.draggedComponent = state.components.find(c => c.id === group.dataset.id);
            state.draggedComponent.offsetX = e.clientX - state.draggedComponent.x;
            state.draggedComponent.offsetY = e.clientY - state.draggedComponent.y;
        }
    });

    svg.addEventListener('mousemove', (e) => {
        if (state.draggedComponent) {
            state.draggedComponent.x = e.clientX - state.draggedComponent.offsetX;
            state.draggedComponent.y = e.clientY - state.draggedComponent.offsetY;
            render(svg);
        }
        const target = e.target;
        state.hoveredComponent = target.closest('.component-group') 
            ? state.components.find(c => c.id === target.closest('.component-group').dataset.id) 
            : null;
        state.hoveredWire = target.classList.contains('wire')
            ? state.wires.find(w => w.id === target.dataset.wireId)
            : null;
    });

    svg.addEventListener('mouseup', () => { state.draggedComponent = null; });

    svg.addEventListener('dblclick', (e) => {
        const group = e.target.closest('.component-group');
        if (group) {

            // 在分析模式下，禁用双击编辑功能
            if (state.isInAnalysisMode) return;

            const comp = state.components.find(c => c.id === group.dataset.id);
            if (comp && comp.type !== 'ground') {
                state.editingComponent = comp;
                modal.querySelector('#modal-title').textContent = `Edit ${comp.type}`;
                modalInputName.value = comp.name;
                modalInputValue.value = comp.value;
                modal.classList.remove('hidden'); // Show modal
            }
        }
    });

    // --- Modal Events ---
    modalSaveBtn.addEventListener('click', () => {
        if (state.editingComponent) {
            state.editingComponent.name = modalInputName.value;
            state.editingComponent.value = modalInputValue.value;
            state.editingComponent = null;
            modal.classList.add('hidden'); // Hide modal
            render(svg);
        }
    });
     // Close modal if clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            state.editingComponent = null;
        }
    });


    // --- Keyboard Events ---
    window.addEventListener('keydown', (e) => {
        const targetIsInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (e.key === 'r' && !targetIsInput) {
            actions.rotateHoveredComponent();
            render(svg);
        } else if (e.key === 'x' && !targetIsInput) {
            if (state.isInAnalysisMode) return;
            actions.deleteHoveredItem();
            render(svg);
        } else if (e.key === 'Escape') {
            if (state.selectedItemId) {
                state.selectedItemId = null;
                render(svg);
            } else if (state.isDrawingWire) {
                state.isDrawingWire = false;
                state.wireStartTerminal = null;
                render(svg);
            } else if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                state.editingComponent = null;
            }
        }
    });
}
