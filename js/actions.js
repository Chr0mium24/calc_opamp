// js/actions.js
import { state } from './state.js';
import { Node, Resistor, VoltageSource, Ground, OpAmp } from './components.js';

// --- HELPER FUNCTIONS that modify state ---
function createNodeForTerminal(terminal) {
    const nodeId = `node_${state.nextNodeId++}`;
    const node = new Node(nodeId);
    node.addTerminal(terminal);
    state.nodes.set(nodeId, node);
    return node;
}

export function mergeNodes(nodeA, nodeB) {
    if (nodeA === nodeB) return;
    const nodeToKeep = nodeA.isGround ? nodeA : (nodeB.isGround ? nodeB : nodeA);
    const nodeToMerge = nodeToKeep === nodeA ? nodeB : nodeA;
    Array.from(nodeToMerge.terminals).forEach(t => nodeToKeep.addTerminal(t));
    state.nodes.delete(nodeToMerge.id);
}

// --- USER ACTIONS ---
export function setPlacingComponent(type) {
    state.placingComponentType = type;
    document.querySelectorAll('#toolbar button').forEach(b => {
        b.classList.remove('active');
    });
    if (type) {
        const button = document.getElementById(`btn-${type}`);
        if (button) {
            button.classList.add('active');
        }
    }
}

export function addNewComponent(type, x, y) {
    const prefixMap = { resistor: 'R', voltage: 'V', ground: 'G', opamp: 'E' };
    const prefix = prefixMap[type];
    const id = `${prefix}${state.nextComponentId[prefix]++}`;
    
    let newComp;
    switch (type) {
        case 'resistor': newComp = new Resistor(x, y, id); break;
        case 'voltage': newComp = new VoltageSource(x, y, id); break;
        case 'ground': newComp = new Ground(x, y, id); break;
        case 'opamp': newComp = new OpAmp(x, y, id); break;
    }

    if (newComp) {
        newComp.terminals.forEach(t => {
            const node = createNodeForTerminal(t);
            if (newComp.type === 'ground') {
                node.isGround = true;
            }
        });
        state.components.push(newComp);
    }
    setPlacingComponent(null);
}

export function deleteHoveredItem() {
    if (state.hoveredComponent) {
        const comp = state.hoveredComponent;
        comp.destroy();
        state.components = state.components.filter(c => c.id !== comp.id);
        state.hoveredComponent = null;
    } else if (state.hoveredWire) {
        const wire = state.hoveredWire;
        // Break the connection by giving one terminal a new node
        wire.terminalA.node.removeTerminal(wire.terminalA);
        createNodeForTerminal(wire.terminalA);
        state.hoveredWire = null;
    }
}

export function rotateHoveredComponent() {
    if (state.hoveredComponent) {
        state.hoveredComponent.rotation = (state.hoveredComponent.rotation + 90) % 360;
    }
}

export function getNodePosition(node) {
    if (!node || node.terminals.size === 0) return { avgX: 0, avgY: 0 };
    const totalX = Array.from(node.terminals).reduce((sum, t) => sum + t.pos.x, 0);
    const totalY = Array.from(node.terminals).reduce((sum, t) => sum + t.pos.y, 0);
    const avgX = totalX / node.terminals.size;
    const avgY = totalY / node.terminals.size;
    return { avgX, avgY };
}