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
    automaton
} from "./automaton.js";

export const main = {};

main.scale = 500;
main.lineWidth = 8;
main.tileLineColor = '#0000FF';
main.drawTileLines = true;

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
        property: 'scale',
        min: 0,
        onChange: function() {
            create();
            draw();
        }
    });

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

    automaton.createGui(gui);

    create();
    SVG.draw = draw;
    main.draw=draw;
    draw();
};

function create() {
squareLattice.createDualCells();
console.log(automaton.cells);
}

function draw() {
    console.log('drawnd')
    SVG.begin();
    SVG.groupAttributes = {
        transform: 'scale(1 -1)',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': main.lineWidth
    };
    if (main.drawTileLines) {

        squareLattice.draw();
    }

    automaton.draw();

    SVG.terminate();

}