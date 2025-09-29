// js/netlist.js
import { state } from './state.js';

export function getNetlistNodeMap() {
    const nodeMap = new Map();
    let nodeCounter = 1;
    state.nodes.forEach(node => {
        if (node.isGround) {
            nodeMap.set(node, 0);
        }
    });
    state.nodes.forEach(node => {
        if (!nodeMap.has(node)) {
            nodeMap.set(node, nodeCounter++);
        }
    });
    return nodeMap;
}

export function generateNetlist() {
    let netlist = '';
    const nodeMap = getNetlistNodeMap();
    const getNodeNum = (terminal) => nodeMap.get(terminal.node);

    state.components.forEach(comp => {
        if(comp.type === 'ground') return;
        switch (comp.type) {
            case 'resistor':
                netlist += `${comp.name} ${getNodeNum(comp.terminals[0])} ${getNodeNum(comp.terminals[1])} ${comp.value}\n`;
                break;
            case 'voltage':
                netlist += `${comp.name} ${getNodeNum(comp.terminals.find(t=>t.type==='p'))} ${getNodeNum(comp.terminals.find(t=>t.type==='n'))} ${comp.value}\n`;
                break;
            case 'opamp':
                const out = getNodeNum(comp.terminals.find(t=>t.type==='out'));
                const p_in = getNodeNum(comp.terminals.find(t=>t.type==='in_p'));
                const n_in = getNodeNum(comp.terminals.find(t=>t.type==='in_n'));
                netlist += `${comp.name} ${out} 0 opamp ${p_in} ${n_in} ${comp.value}\n`;
                break;
        }
    });
    return netlist;
};
