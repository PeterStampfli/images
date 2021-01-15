/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
output.addCursorposition();
output.setInitialCoordinates(0, -100, 210);
output.addGrid();

// parameters for drawing
const tiling = {};
tiling.squareColor = '#00ff00';
tiling.rhombColor = '#ff0000';
tiling.triangleColor = '#ffff00';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;

const colorController = {
    type: 'color',
    params: tiling,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: tiling,
    min: 0.1,
    onChange: function() {
        draw();
    }
};

const squareColorController = gui.add(colorController, {
    property: 'squareColor',
    labelText: 'square'
});

const triangleColorController = gui.add(colorController, {
    property: 'triangleColor',
    labelText: 'triangle'
});

const rhombColorController = gui.add(colorController, {
    property: 'rhombColor',
    labelText: 'rhomb'
});

gui.add(widthController, {
    property: 'borderWidth',
    labelText: 'width'
});

gui.add(colorController, {
    property: 'borderColor',
    labelText: 'color'
});


function draw() {
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.correctYAxis();
    output.setLineWidth(tiling.borderWidth);
    canvasContext.strokeStyle = tiling.borderColor;
    const s = 50;
    const rt3 = Math.sqrt(3);
    const rt32 = rt3 / 2;
    const delta=70;

    let x = 0;
    //=================================
    canvasContext.fillStyle = tiling.triangleColor;
    output.makePath(x, (1 + rt3) * s, x + s / 2, (1 + rt32) * s, x - s / 2, (1 + rt32) * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    output.makePath(x, 0, x + s / 2, rt32 * s, x - s / 2, rt32 * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = tiling.squareColor;
    output.makePath(x + s / 2, (1 + rt32) * s, x - s / 2, (1 + rt32) * s, x - s / 2, rt32 * s, x + s / 2, rt32 * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();

    x = delta;
    //=========================================================
    canvasContext.fillStyle = tiling.triangleColor;
    output.makePath(x, (1 + rt3) * s, x + s / 2, (1 + rt32) * s, x - s / 2, (1 + rt32) * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    output.makePath(x, s, x + s / 2, (1 + rt32) * s, x - s / 2, (1 + rt32) * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();

    canvasContext.fillStyle = tiling.rhombColor;
    output.makePath(x, 0, x + s / 2, rt32 * s, x + s / 2, (1 + rt32) * s, x, s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    output.makePath(x, 0, x - s / 2, rt32 * s, x - s / 2, (1 + rt32) * s, x, s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();

    x = -delta;
    //=========================================================
    canvasContext.fillStyle = tiling.triangleColor;
    output.makePath(x, 0, x + s / 2, rt32 * s, x - s / 2, rt32 * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    output.makePath(x, s * rt3, x + s / 2, rt32 * s, x - s / 2, rt32 * s);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = tiling.rhombColor;
    output.makePath(x, (1 + rt3) * s, x, rt3 * s, x + s / 2, rt32 * s, x + s / 2, s * (1 + rt32));
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    output.makePath(x, (1 + rt3) * s, x, rt3 * s, x - s / 2, rt32 * s, x - s / 2, s * (1 + rt32));
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();

    output.drawGrid();

output.makePath(x,0,0,x,-x,0,0,-x);
output.addCanvasBorderPath();
    canvasContext.fill();

}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();