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
} from "./polygon.js";

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

gui.add({
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
    property: 'symmetry',
    min: 3,
    step: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'initial',
    options: [
        'triangles', 'quadrangles', 'pseudo quadrangles'
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

    //  create structure

    const basisPolygon = Polygon.createRegular(Polygon.symmetry);
    switch (Polygon.initial) {
        case 'triangles':
            basisPolygon.initialTriangles();
            break;
        case 'quadrangles':
            basisPolygon.initialQuadrangles();
            break;
        case 'pseudo quadrangles':
            basisPolygon.initialPseudoQuadrangles();
            break;
    }
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');