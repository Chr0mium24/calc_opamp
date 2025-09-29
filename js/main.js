// js/main.js
import { createDOM } from './dom.js';
import { setupEventListeners } from './events.js';
import { render } from './renderer.js';

// 1. 创建应用的所有 DOM 元素
const domElements = createDOM();

// 2. 绑定所有事件监听器
setupEventListeners(domElements);

// 3. 执行首次渲染
render(domElements.svg);
