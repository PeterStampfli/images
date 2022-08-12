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
output.setInitialCoordinates(0, 0, 10);
output.addGrid();

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

// for simple things
// draw routine creates structure too

function draw() {
    console.log("creating and drawing");
    // initialize output canvas
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(Polygon.lineWidth);

    //  create structure

    console.log(Polygon.createRegular(5));
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');