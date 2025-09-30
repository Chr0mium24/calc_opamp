// js/components.js
import { state } from './state.js';

// --- DATA STRUCTURES (CLASSES) ---
export class Node {
    constructor(id) { this.id = id; this.terminals = new Set(); this.isGround = false; }
    addTerminal(terminal) { this.terminals.add(terminal); terminal.node = this; }
    removeTerminal(terminal) { this.terminals.delete(terminal); }
}

export class Terminal {
    constructor(component, type, dx, dy) {
        this.component = component; this.type = type;
        this.node = null; this.dx = dx; this.dy = dy;
    }
    get pos() {
        const angle = (this.component.rotation * Math.PI) / 180;
        const cosA = Math.cos(angle); const sinA = Math.sin(angle);
        const newDx = this.dx * cosA - this.dy * sinA;
        const newDy = this.dx * sinA + this.dy * cosA;
        return { x: this.component.x + newDx, y: this.component.y + newDy };
    }
}

class Component {
    constructor(type, x, y, id) {
        this.id = id;
        this.type = type; this.name = this.id; this.x = x; this.y = y;
        this.value = this.getDefaultValue(type); this.rotation = 0; this.terminals = [];
    }
    getDefaultValue(type) {
        return { resistor: '1k', voltage: '1', opamp: 'inf' }[type] || '';
    }
    destroy() {
        this.terminals.forEach(t => {
            if (t.node) {
                t.node.removeTerminal(t);
                if (t.node.terminals.size === 0) { state.nodes.delete(t.node.id); }
            }
        });
    }
}

export class Resistor extends Component {
    constructor(x, y, id) {
        super('resistor', x, y, id);
        this.terminals.push(new Terminal(this, 't1', -30, 0));
        this.terminals.push(new Terminal(this, 't2', 30, 0));
    }
}

export class VoltageSource extends Component {
    constructor(x, y, id) {
        super('voltage', x, y, id);
        this.terminals.push(new Terminal(this, 'p', 0, -25));
        this.terminals.push(new Terminal(this, 'n', 0, 25));
    }
}
        
export class Ground extends Component {
    constructor(x, y, id) {
        super('ground', x, y, id);
        this.name = ''; this.value = '';
        this.terminals.push(new Terminal(this, 'gnd', 0, 0));
    }
}

export class OpAmp extends Component {
    constructor(x, y, id) {
        super('opamp', x, y, id);
        this.terminals.push(new Terminal(this, 'in_n', -25, -15));
        this.terminals.push(new Terminal(this, 'in_p', -25, 15));
        this.terminals.push(new Terminal(this, 'out', 35, 0));
    }
}
