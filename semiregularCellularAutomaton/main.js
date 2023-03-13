/* jshint esversion: 6 */

import {
    SVG,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

import {
    squareLattice
} from "./squareLattice.js";

import {
    rhombusLattice
} from "./rhombusLattice.js";

import {
    triangleLattice
} from "./triangleLattice.js";

import {
    octagonSquareLattice
} from "./octagonSquareLattice.js";

import {
    hexagonTriangleLattice
} from "./hexagonTriangleLattice.js";

import {
    manyHexagonsTriangleLattice
} from "./manyHexagonsTriangleLattice.js";

import {
    dodecagonTriangleLattice
} from "./dodecagonTriangleLattice.js";

import {
    dodecagonHexagonSquareLattice
} from "./dodecagonHexagonSquareLattice.js";

import {
    hexagonTriangleSquareLattice
} from "./hexagonTriangleSquareLattice.js";

import {
    triangleSquareLattice
} from "./triangleSquareLattice.js";

import {
    hexagonLattice
} from "./hexagonLattice.js";

import {
    automaton
} from "./automaton.js";

export const main = {};

main.scale = 200;
main.lineWidth = 8;
main.tileLineColor = '#0000FF';
main.drawTileLines = false;
main.lattice = squareLattice;

const svgSize = 2000;

main.setup = function() {
    // gui and svg
    const gui = new ParamGui({
        name: 'semiregular automaton',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;

    SVG.makeGui(gui);
    SVG.init();
    SVG.setMinViewWidthHeight(svgSize, svgSize);
    BooleanButton.greenRedBackground();

    gui.add({
        type: 'number',
        params: main,
        property: 'lineWidth',
        labelText: 'line width',
        min: 0,
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'tileLineColor',
        labelText: 'tile line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawTileLines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'neighborLineColor',
        labelText: 'neighbor line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawNeighborLines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'neighbor2LineColor',
        labelText: '2nd nbr line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawNeighbor2Lines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'cellLineColor',
        labelText: 'cell line',
        onChange: draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawCellLines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'boolean',
        params: automaton,
        property: 'cellFill',
        labelText: 'cell fill',
        onChange: draw
    });

    gui.add({
        type: 'selection',
        params: main,
        property: 'lattice',
        options: {
            square: squareLattice,
            hexagon: hexagonLattice,
            triangle: triangleLattice,
            octagonSquare: octagonSquareLattice,
            hexagonTriangle: hexagonTriangleLattice,
            dodecagonTriangle: dodecagonTriangleLattice,
            hexagonTriangleSquare: hexagonTriangleSquareLattice,
            dodecagonHexagonSquareLattice: dodecagonHexagonSquareLattice,
            manyHexagonsTriangle: manyHexagonsTriangleLattice,
            triangleSquare: triangleSquareLattice,
            rhombus: rhombusLattice
        },
        onChange: function() {
            create();
            draw();
        }
    })

    const nStatesController = gui.add({
        type: 'number',
        params: automaton,
        property: 'nStates',
        min: 2,
        step: 1,
        onChange: function() {
            create();
            draw();
        }
    })
    const initialController = nStatesController.add({
        type: 'number',
        params: automaton,
        property: 'initial',
        min: 1,
        step: 1,
        onChange: function() {
            if (automaton.initial >= automaton.nStates) {
                initialController.setValueOnly(automaton.nStates - 1);
            }
            create();
            draw();
        }
    });

    gui.add({
        type: 'button',
        buttonText: 'reset',
        onChange: function() {
            automaton.reset(1);
            draw();
        }
    }).add({
        type: 'button',
        buttonText: 'step',
        onChange: function() {
            automaton.advance();
            draw();
        }
    });

    gui.addParagraph("colors for states");
    const color = automaton.color;
    for (let i = 0; i < color.length; i++) {
        automaton.colorControllers.push(gui.add({
            type: 'color',
            params: color,
            property: i,
            onChange: draw
        }));
    }

    create();
    SVG.draw = draw;
    draw();
};

var lattice;

function create() {
    main.scale = main.lattice.scale;
    console.log(main.scale);
    main.lattice.createCells();
    reset();
}

function reset() {
    automaton.updateColorControllers();
    automaton.initialize();
}
main.reset = reset;

function draw() {
    SVG.begin();
    SVG.groupAttributes = {
        transform: 'scale(1 -1)',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': main.lineWidth
    };
    automaton.draw();
    if (main.drawTileLines) {
        lattice.draw();
    }
    SVG.terminate();
}