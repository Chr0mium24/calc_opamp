// js/dom.js
export function createDOM() {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = ''; // Clear previous content

    // Main Title
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold mb-4 text-gray-800';
    title.textContent = 'Circuit Visual Editor (V2)';

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    toolbar.className = 'mb-4 bg-white p-2 rounded-lg shadow-md flex items-center gap-2';
    toolbar.innerHTML = `
        <button id="btn-ground">Ground</button>
        <button id="btn-voltage">Voltage Source</button>
        <button id="btn-resistor">Resistor</button>
        <button id="btn-opamp">Op-Amp</button>
        <div class="ml-auto flex gap-2">
            <button id="btn-generate" class="bg-gray-500 text-white hover:bg-gray-600 font-semibold">Generate Netlist</button>
            <button id="btn-analyze" class="bg-blue-600 text-white hover:bg-blue-700 font-bold">Analyze Circuit</button>
        </div>
    `;
    toolbar.querySelectorAll('button').forEach(btn => {
        btn.className = `${btn.className} px-3 py-2 cursor-pointer border border-gray-300 rounded`;
        if (!btn.id.includes('generate')) {
            btn.classList.add('bg-gray-50', 'hover:bg-gray-200');
        }
    });

    // SVG Editor
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.className = 'relative border-2 border-gray-300 bg-white shadow-md';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'canvas';
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '600');
    editorContainer.appendChild(svg);

     // Loading Overlay (新增)
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.className = 'hidden absolute inset-0 bg-black bg-opacity-50 z-10 flex flex-col items-center justify-center pointer-events-none';
    const loadingStatus = document.createElement('div');
    loadingStatus.id = 'loading-status';
    loadingStatus.className = 'text-gray-300 mt-2';
    const loadingTitle = document.createElement('div');
    loadingTitle.className = 'text-white text-2xl font-bold';
    loadingTitle.textContent = 'Loading...';
    loadingOverlay.append(loadingTitle, loadingStatus);

    editorContainer.append(svg, loadingOverlay);

    // Netlist Output Area
    const netlistContainer = document.createElement('div');
    netlistContainer.id = 'netlist-container';
    netlistContainer.className = 'mt-5 w-full';
    netlistContainer.innerHTML = `
        <h3 class="text-xl font-semibold mb-2 text-gray-700">Generated Netlist:</h3>
        <textarea id="netlist-output" readonly class="w-full h-40 font-mono text-sm border border-gray-300 p-2 box-border bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
    `;

    // Modal Dialog
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    // Use 'hidden' class to control visibility
    modal.className = 'hidden fixed z-50 inset-0 bg-black bg-opacity-40 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white p-6 border border-gray-300 w-full max-w-sm rounded-lg shadow-lg">
            <h3 id="modal-title" class="text-2xl mb-4 font-bold text-gray-800">Edit Component</h3>
            <label for="modal-input-name" class="block mt-3 text-left font-bold text-gray-600">Name:</label>
            <input type="text" id="modal-input-name" placeholder="e.g., R1" class="w-full p-2 mt-1 mb-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">
            <label for="modal-input-value" class="block mt-3 text-left font-bold text-gray-600">Value:</label>
            <input type="text" id="modal-input-value" placeholder="e.g., 5k or vi" class="w-full p-2 mt-1 mb-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">
            <button id="modal-save-btn" class="p-2 mt-4 w-full bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold">Save</button>
        </div>
    `;

    // Append all elements to the app container
    appContainer.append(title, toolbar, editorContainer, netlistContainer);
    document.body.appendChild(modal); // Append modal to body to ensure it covers everything

    return {
        svg,
        modal,
        loadingOverlay,  // <-- 确保返回此引用
        loadingStatus,   // <-- 确保返回此引用
        modalTitle: document.getElementById('modal-title'),
        modalInputName: document.getElementById('modal-input-name'),
        modalInputValue: document.getElementById('modal-input-value'),
        modalSaveBtn: document.getElementById('modal-save-btn'),
        netlistOutput: document.getElementById('netlist-output'),
    };
}
