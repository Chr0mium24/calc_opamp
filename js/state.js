// js/state.js
export const state = {
    components: [],
    nodes: new Map(), // Maps node ID to Node object
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
};
