/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton,
    guiUtils
}
from "../libgui/modules.js";

import {
    Polygon
} from "./bwpolygon.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});

output.addCoordinateTransform();
output.addCursorposition();
output.setInitialCoordinates(0, 0, 2.5);
output.addGrid();

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'fill',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'stroke',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'vertices',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: Polygon,
    property: 'lineColor',
    labelText: 'line',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'lineWidth',
    min: 0.1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'vertexSize',
    onChange: function() {
        draw();
    }
});

const generationsController = gui.add({
    type: 'number',
    params: Polygon,
    property: 'generations',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'centerWeight',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'subdivApproach',
    labelText: 'method',
    options: [
        'graphEuclidean', 'modular 3', 'modular 4'
    ],
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'initial',
    options: [
        'triangles', 'double triangles', 'quadrangles', 'pseudo quadrangles'
    ],
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'subdiv',
    options: [
        '4 ...', '5 ...', '6 ...', '7 ...', '8 ...', '4 5 ...'
    ],
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'initialAddVertices',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'additionalVertices',
    onChange: function() {
        draw();
    }
});

// for simple things
// draw routine creates structure too

function draw() {
    // initialize output canvas
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(Polygon.lineWidth);
    Polygon.noAlert = true;

    //  create structure

    switch (Polygon.subdiv) {
        case '4 ...':
            Polygon.subdivisions = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
            break;
        case '5 ...':
            Polygon.subdivisions = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
            break;
        case '6 ...':
            Polygon.subdivisions = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
            break;
        case '7 ...':
            Polygon.subdivisions = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];
            break;
        case '8 ...':
            Polygon.subdivisions = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
            break;
        case '4 5 ...':
            Polygon.subdivisions = [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
            break;
    }
    if (Polygon.generations > Polygon.subdivisions.length) {
        generationsController.setValueOnly(Polygon.subdivisions.length);
    }

    const basisPolygon = Polygon.createRegular(Polygon.subdivisions[0]);
    if (Polygon.generations === 0) {
        basisPolygon.draw();
    } else {
        switch (Polygon.initial) {
            case 'triangles':
                basisPolygon.initialTriangles();
                break;
            case 'double triangles':
                basisPolygon.initialDoubleTriangles();
                break;
            case 'quadrangles':
                basisPolygon.initialQuadrangles();
                break;
            case 'pseudo quadrangles':
                basisPolygon.initialPseudoQuadrangles();
                break;
        }
    }
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');