/* jshint esversion: 6 */

import {
    ParamGui,
    SVG,
    BooleanButton
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

SVG.makeGui(gui);
SVG.init();

// parameters for drawing
const arrow = {};
// colors
arrow.lineColor = '#000000';
arrow.lineWidth = 2;
arrow.fillColor = '#999999';

arrow.tip = 25;
arrow.length = 50;
arrow.width = 10;

gui.add({
    type: 'number',
    params: arrow,
    property: 'tip',
    min: 0,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: arrow,
    property: 'length',
    min: 0,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: arrow,
    property: 'width',
    min: 0,
    onChange: function() {
        draw();
    }
});

const colorController = {
    type: 'color',
    params: arrow,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: arrow,
    min: 0.1,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 'lineColor',
    labelText: 'line'
});

gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'fillColor'
});


function draw() {
    SVG.begin();
    SVG.createGroup({
        //       transform: 'scale(1 -1)',
        fill: arrow.fillColor,
        stroke: arrow.lineColor,
        'stroke-width': arrow.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    SVG.createPolygon([0, arrow.tip, arrow.tip, 0, 0, -arrow.tip, 0, -arrow.width, -arrow.length, -arrow.width, -arrow.length, arrow.width, 0, arrow.width]);
    SVG.terminate();
}

SVG.draw = draw;
draw();