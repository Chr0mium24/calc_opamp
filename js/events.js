// js/events.js
import { state } from './state.js';
import { render } from './renderer.js';
import * as actions from './actions.js';
import { generateNetlist } from './netlist.js';

export function setupEventListeners(elements) {
    const { svg, modal, modalSaveBtn, modalInputName, modalInputValue, netlistOutput } = elements;

    // --- Toolbar Buttons ---
    // Bug Fix: Pass 'gnd' to match the button's ID 'btn-ground'
    document.getElementById('btn-ground').onclick = () => actions.setPlacingComponent('ground'); 
    document.getElementById('btn-voltage').onclick = () => actions.setPlacingComponent('voltage');
    document.getElementById('btn-resistor').onclick = () => actions.setPlacingComponent('resistor');
    document.getElementById('btn-opamp').onclick = () => actions.setPlacingComponent('opamp');
    document.getElementById('btn-generate').onclick = () => {
        netlistOutput.value = generateNetlist();
    };
    
    // --- SVG Canvas Events ---
    svg.addEventListener('click', (e) => {
        if (state.placingComponentType) {
            const rect = svg.getBoundingClientRect();
            actions.addNewComponent(state.placingComponentType, e.clientX - rect.left, e.clientY - rect.top);
            render(svg);
        }
    });
    
    svg.addEventListener('mousedown', (e) => {
        const target = e.target;
        const group = target.closest('.component-group');
        
        if (target.classList.contains('terminal') && group) {
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
            actions.deleteHoveredItem();
            render(svg);
        } else if (e.key === 'Escape') {
            if (state.isDrawingWire) {
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
