// js/renderer.js
import { state } from './state.js';
import { getNetlistNodeMap } from './netlist.js';

const ns = 'http://www.w3.org/2000/svg';

function drawComponentBody(group, comp) {
    if (comp.type !== 'ground') {
        const nameLabel = document.createElementNS(ns, 'text');
        nameLabel.setAttribute('x', 0);
        nameLabel.setAttribute('y', -35);
        nameLabel.textContent = comp.name;
        nameLabel.setAttribute('text-anchor', 'middle');
        nameLabel.setAttribute('class', 'component-label text-sm font-mono fill-current text-gray-800 pointer-events-none');
        group.appendChild(nameLabel);

        const valueLabel = document.createElementNS(ns, 'text');
        valueLabel.setAttribute('x', 0);
        valueLabel.setAttribute('y', 40);
        valueLabel.textContent = comp.value;
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('class', 'component-label text-sm font-mono fill-current text-gray-600 pointer-events-none');
        group.appendChild(valueLabel);
    }

    let body;
    switch(comp.type) {
        case 'resistor':
            // ... (此部分代码无变化, 为简洁省略)
            body = document.createElementNS(ns, 'rect');
            body.setAttribute('x', -25); body.setAttribute('y', -10);
            body.setAttribute('width', 50); body.setAttribute('height', 20);
            body.setAttribute('rx', 5);
            body.setAttribute('class', 'fill-blue-200 stroke-blue-800 stroke-2');
            group.appendChild(body);
            const r_line1 = document.createElementNS(ns, 'line');
            r_line1.setAttribute('x1', -30); r_line1.setAttribute('y1', 0);
            r_line1.setAttribute('x2', -25); r_line1.setAttribute('y2', 0);
            r_line1.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(r_line1);
            const r_line2 = document.createElementNS(ns, 'line');
            r_line2.setAttribute('x1', 25); r_line2.setAttribute('y1', 0);
            r_line2.setAttribute('x2', 30); r_line2.setAttribute('y2', 0);
            r_line2.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(r_line2);
            break;

        case 'voltage':
            body = document.createElementNS(ns, 'circle');
            body.setAttribute('cx', 0); body.setAttribute('cy', 0);
            body.setAttribute('r', 20);
            body.setAttribute('class', 'fill-green-200 stroke-green-800 stroke-2');
            group.appendChild(body);
            
            // ✅ FIX: 为 +/- 符号添加 text-anchor 和 dominant-baseline 以实现精确定位
            const plus = document.createElementNS(ns, 'text');
            plus.setAttribute('x', 0);
            plus.setAttribute('y', -9); // 调整 Y 坐标
            plus.textContent = '+';
            plus.setAttribute('text-anchor', 'middle');
            plus.setAttribute('dominant-baseline', 'middle');
            plus.setAttribute('class', 'text-2xl font-semibold fill-current text-gray-800 pointer-events-none');
            group.appendChild(plus);

            const minus = document.createElementNS(ns, 'text');
            minus.setAttribute('x', 0);
            minus.setAttribute('y', 11); // 调整 Y 坐标
            minus.textContent = '−'; // 使用正确的减号字符
            minus.setAttribute('text-anchor', 'middle');
            minus.setAttribute('dominant-baseline', 'middle');
            minus.setAttribute('class', 'text-2xl font-semibold fill-current text-gray-800 pointer-events-none');
            group.appendChild(minus);

            const v_line1 = document.createElementNS(ns, 'line');
            v_line1.setAttribute('x1', 0); v_line1.setAttribute('y1', -25);
            v_line1.setAttribute('x2', 0); v_line1.setAttribute('y2', -20);
            v_line1.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(v_line1);
            const v_line2 = document.createElementNS(ns, 'line');
            v_line2.setAttribute('x1', 0); v_line2.setAttribute('y1', 20);
            v_line2.setAttribute('x2', 0); v_line2.setAttribute('y2', 25);
            v_line2.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(v_line2);
            break;

        case 'ground':
            // ✅ FIX: 重新绘制接地符号，使其位于连接点(0,0)下方
            const vert_line = document.createElementNS(ns, 'line');
            vert_line.setAttribute('x1', 0); vert_line.setAttribute('y1', 0); // 从连接点开始
            vert_line.setAttribute('x2', 0);  vert_line.setAttribute('y2', 5); // 往下引出
            vert_line.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(vert_line);

            const gnd_line1 = document.createElementNS(ns, 'line');
            gnd_line1.setAttribute('x1', -15); gnd_line1.setAttribute('y1', 5);
            gnd_line1.setAttribute('x2', 15);  gnd_line1.setAttribute('y2', 5);
            gnd_line1.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(gnd_line1);

            const gnd_line2 = document.createElementNS(ns, 'line');
            gnd_line2.setAttribute('x1', -10); gnd_line2.setAttribute('y1', 10);
            gnd_line2.setAttribute('x2', 10);  gnd_line2.setAttribute('y2', 10);
            gnd_line2.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(gnd_line2);
            
            const gnd_line3 = document.createElementNS(ns, 'line');
            gnd_line3.setAttribute('x1', -5); gnd_line3.setAttribute('y1', 15);
            gnd_line3.setAttribute('x2', 5);  gnd_line3.setAttribute('y2', 15);
            gnd_line3.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(gnd_line3);
            break;
            
        case 'opamp':
             // ... (此部分代码无变化, 为简洁省略)
            body = document.createElementNS(ns, 'path');
            body.setAttribute('d', 'M -25 -25 L 30 0 L -25 25 Z');
            body.setAttribute('class', 'fill-yellow-200 stroke-yellow-800 stroke-2');
            group.appendChild(body);
            const op_plus = document.createElementNS(ns, 'text');
            op_plus.setAttribute('x', -18); op_plus.setAttribute('y', 17);
            op_plus.textContent = '+';
            op_plus.setAttribute('class', 'font-bold fill-current text-gray-800');
            group.appendChild(op_plus);
            const op_minus = document.createElementNS(ns, 'text');
            op_minus.setAttribute('x', -18); op_minus.setAttribute('y', -10);
            op_minus.textContent = '−';
            op_minus.setAttribute('class', 'font-bold fill-current text-gray-800');
            group.appendChild(op_minus);
            const op_line_in_n = document.createElementNS(ns, 'line');
            op_line_in_n.setAttribute('x1', -30); op_line_in_n.setAttribute('y1', -15);
            op_line_in_n.setAttribute('x2', -25); op_line_in_n.setAttribute('y2', -15);
            op_line_in_n.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(op_line_in_n);
            const op_line_in_p = document.createElementNS(ns, 'line');
            op_line_in_p.setAttribute('x1', -30); op_line_in_p.setAttribute('y1', 15);
            op_line_in_p.setAttribute('x2', -25); op_line_in_p.setAttribute('y2', 15);
            op_line_in_p.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(op_line_in_p);
            const op_line_out = document.createElementNS(ns, 'line');
            op_line_out.setAttribute('x1', 30); op_line_out.setAttribute('y1', 0);
            op_line_out.setAttribute('x2', 35); op_line_out.setAttribute('y2', 0);
            op_line_out.setAttribute('class', 'stroke-black stroke-2');
            group.appendChild(op_line_out);
            break;
    }
}

// render 函数的其余部分保持不变
export function render(svg) {
    svg.innerHTML = '';
    state.wires = [];

    const nodeMap = getNetlistNodeMap();

    const nodesWithConnections = Array.from(state.nodes.values()).filter(n => n.terminals.size > 1);
    nodesWithConnections.forEach(node => {
        const terminals = Array.from(node.terminals);
        for(let i = 0; i < terminals.length; i++) {
            for (let j = i + 1; j < terminals.length; j++) {
                const wire = {
                    id: `${terminals[i].component.id}-${terminals[j].component.id}`,
                    x1: terminals[i].pos.x, y1: terminals[i].pos.y,
                    x2: terminals[j].pos.x, y2: terminals[j].pos.y,
                    terminalA: terminals[i], terminalB: terminals[j],
                };
                state.wires.push(wire);
                const line = document.createElementNS(ns, 'line');
                line.setAttribute('x1', wire.x1); line.setAttribute('y1', wire.y1);
                line.setAttribute('x2', wire.x2); line.setAttribute('y2', wire.y2);
                line.setAttribute('class', 'wire stroke-gray-800 stroke-2 fill-none hover:stroke-red-500 hover:stroke-[3px]');
                line.dataset.wireId = wire.id;
                svg.appendChild(line);
            }
        }
    });

    state.components.forEach(comp => {
        const group = document.createElementNS(ns, 'g');
        group.classList.add('component-group');
        group.dataset.id = comp.id;
        group.setAttribute('transform', `translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`);
        
        drawComponentBody(group, comp); 
        
        comp.terminals.forEach(terminal => {
            const circle = document.createElementNS(ns, 'circle');
            circle.setAttribute('cx', terminal.dx); circle.setAttribute('cy', terminal.dy);
            circle.setAttribute('r', 5);
            circle.setAttribute('class', 'terminal cursor-pointer fill-gray-500 hover:fill-blue-500 hover:stroke-blue-500 hover:stroke-2');
            group.appendChild(circle);
        });
        svg.appendChild(group);
    });
    
    nodeMap.forEach((netlistNum, node) => {
        if(node.terminals.size === 0) return;
        const totalX = Array.from(node.terminals).reduce((sum, t) => sum + t.pos.x, 0);
        const totalY = Array.from(node.terminals).reduce((sum, t) => sum + t.pos.y, 0);
        const avgX = totalX / node.terminals.size;
        const avgY = totalY / node.terminals.size;

        const text = document.createElementNS(ns, 'text');
        text.setAttribute('x', avgX + 8); text.setAttribute('y', avgY - 8);
        text.textContent = netlistNum;
        text.setAttribute('class', 'node-label text-sm font-mono fill-blue-600 pointer-events-none');
        svg.appendChild(text);
    });

    if(state.isDrawingWire && state.wireStartTerminal) {
         const terminalPos = state.wireStartTerminal.pos;
         const highlight = document.createElementNS(ns, 'circle');
         highlight.setAttribute('cx', terminalPos.x);
         highlight.setAttribute('cy', terminalPos.y);
         highlight.setAttribute('r', 8);
         highlight.setAttribute('class', 'fill-none stroke-blue-500 stroke-2 animate-pulse');
         svg.appendChild(highlight);
    }
}