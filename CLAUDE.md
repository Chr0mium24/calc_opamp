# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based circuit visual editor that allows users to design electronic circuits and perform analysis using Python's Lcapy library. The application is built with vanilla JavaScript ES6 modules and uses Pyodide to run Python circuit analysis in the browser.

## Architecture

The application follows a modular ES6 architecture with clear separation of concerns:

### Core Modules

- **`js/main.js`** - Entry point that orchestrates DOM creation, event setup, and initial rendering
- **`js/state.js`** - Central state management with global application state including components, nodes, wires, and analysis results
- **`js/dom.js`** - DOM element creation and management using Tailwind CSS classes
- **`js/events.js`** - Event handling for user interactions (mouse events, keyboard shortcuts)
- **`js/renderer.js`** - SVG rendering engine for drawing circuit components and wires
- **`js/components.js`** - Component class definitions (Resistor, VoltageSource, OpAmp, Ground) with Terminal and Node classes
- **`js/actions.js`** - Circuit manipulation functions (adding/removing components, wires, rotation)
- **`js/netlist.js`** - SPICE netlist generation for circuit analysis
- **`js/pyodide_handler.js`** - Python/Lcapy integration using Pyodide for circuit analysis

### State Management

The application uses a centralized state object (`state.js`) that manages:
- Circuit components and their properties
- Node connectivity via Map data structure
- Wire connections between terminals
- Pyodide runtime and analysis results
- UI state (placing mode, dragging, editing)

### Component System

Circuit components are implemented as ES6 classes with inheritance:
- Base `Component` class with common properties (position, rotation, value)
- Specialized classes: `Resistor`, `VoltageSource`, `OpAmp`, `Ground`
- `Terminal` class handles connection points with rotation calculations
- `Node` class manages electrical connectivity between terminals

### Analysis Engine

The application integrates Python's Lcapy library via Pyodide:
- Generates SPICE netlists from visual circuit
- Runs symbolic circuit analysis in browser
- Handles voltage and current calculations for components and nodes
- Displays results with mathematical expressions

## Development Workflow

### Running the Application

This is a client-side application that runs directly in the browser:

```bash
# Serve locally (recommended)
python -m http.server 8000
# or
npx serve .
# or any static file server
```

Open `http://localhost:8000` to use the circuit editor.

### Key File Dependencies

- **index.html** - Uses Pyodide CDN and Tailwind CSS CDN
- **style.css** - Custom CSS for circuit-specific styling
- All JavaScript files use ES6 modules with explicit imports

### Testing Circuit Analysis

The Python analysis depends on:
- Pyodide runtime (loaded via CDN)
- Lcapy library (installed via micropip)
- SymPy for symbolic mathematics
- NumPy, SciPy, matplotlib, networkx

### Debugging

- Check browser console for Pyodide loading status
- Python analysis errors are logged with the failed Python code
- State object is globally accessible for debugging: `window.state` (if exposed)

## Code Conventions

- Use ES6 modules with explicit imports/exports
- Camel case for JavaScript variables and functions
- Component classes use PascalCase
- SVG elements created with `document.createElementNS(ns, tagName)`
- Tailwind CSS classes for styling
- Chinese comments in some files (original language)
- No build process - direct browser execution

## Circuit Component Types

Supported components and their netlist representations:
- **Resistor** (R): `R1 node1 node2 value`
- **Voltage Source** (V): `V1 positive_node negative_node value`
- **OpAmp** (E): `E1 output 0 opamp positive_input negative_input gain`
- **Ground** (G): Special node with ID 0, not included in netlist

Node numbering: Ground = 0, other nodes numbered sequentially starting from 1.