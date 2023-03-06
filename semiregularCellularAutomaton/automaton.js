/* jshint esversion: 6 */

import {
    main
} from "./main.js";

export const automaton={};

// the mechanics
automaton.cells = [];


// about drawing

automaton.cellLineColor = '#00bb00';
automaton.drawCellLines = true;
automaton.cellFill = true;

automaton.neighborLineColor = '#ff0000';
automaton.drawNeighborLines = true;

automaton.neighbor2LineColor = '#ff9900';
automaton.drawNeighbor2Lines = true;

const color = [];
const colorControllers = [];
color.push('#ffffff');
color.push('#88ff88');
color.push('#ffff00');
color.push('#ff8800');
color.push('#ff4444');
color.push('#ff00ff');
color.push('#4444ff');
color.push('#00aaaa');


automaton.createGui=function(gui){


    gui.add({
        type: 'color',
        params: automaton,
        property: 'neighborLineColor',
        labelText: 'neighbor line',
        onChange: main.draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawNeighborLines',
        labelText: '',
        onChange: main.draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'neighbor2LineColor',
        labelText: '2nd nbr line',
        onChange: main.draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawNeighbor2Lines',
        labelText: '',
        onChange: main.draw
    });

    gui.add({
        type: 'color',
        params: automaton,
        property: 'cellLineColor',
        labelText: 'cell line',
        onChange: main.draw
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'drawCellLines',
        labelText: '',
        onChange: main.draw
    });

    gui.add({
        type: 'boolean',
        params: automaton,
        property: 'cellFill',
        labelText: 'cell fill',
        onChange: main.draw
    });

        gui.addParagraph("colors for states");
    for (let i = 0; i < color.length; i++) {
        colorControllers.push(gui.add({
            type: 'color',
            params: color,
            property: i,
            onChange: main.draw
        }));
    }

};

// setting up the automaton

automaton.clear = function() {
    automaton.cells.length = 0;
};
