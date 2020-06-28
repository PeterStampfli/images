/* jshint esversion: 6 */

import {
    CoordinateTransform,
    ParamGui,
    output
} from "../libgui/modules.js";

// basic setup: the canvas and its transform
const gui = new ParamGui({
    name: 'Kochflakes',
    closed: false
});
const canvasGui = gui.addFolder({
    name: 'image controls',
    closed: true
});
// an output canvas and some test image
output.createCanvas(canvasGui);
const canvas = output.canvas;
const canvasContext = output.canvasContext;
canvasGui.addTitle('coordinate transform');
output.showCanvasChanged = function() {};
output.setCanvasWidthToHeight();
output.addCoordinateTransform(canvasGui, false);
output.setInitialCoordinates(0, 0, 100);

// parameters
const koch = {};

// basic
koch.corners = 5;
koch.winding = 2;
koch.radius = 45;
koch.generations = 1;

// modification
koch.outer = 0.333;
koch.inner = 0.333;
koch.angle = 0;
koch.side = 'outside';

//style
koch.lineWidth = 1;
koch.background = '#eeeeaa';
koch.linecolor = '#000066';

// controls
gui.addParagraph('You can use the mouse wheel to change numbers.');
// basic geometry
gui.addTitle('basic star polygon {p/q}:');
gui.add({
    type: 'number',
    params: koch,
    property: 'corners',
    step: 1,
    min: 3,
    labelText: 'p (corners)',
    onChange: function(p) {
        windingController.setMax(Math.floor(p / 2));
        setLengths();

        draw();
    },
});
const windingController = gui.add({
    type: 'number',
    params: koch,
    property: 'winding',
    step: 1,
    min: 1,
    max: koch.nCorners - 1,
    labelText: 'q (winding)',
    onChange: function() {
        setLengths();

        draw();
    },
});
gui.add({
    type: 'number',
    params: koch,
    property: 'radius',
    min: 10,
});

gui.addTitle('number of iterations');
gui.add({
    type: 'number',
    params: koch,
    property: 'generations',
    step: 1,
    min: 0,
    max: 7,
    labelText: '',
    onChange: function() {
        draw();
    },
});

gui.addTitle('modification of the iteration structure');
const outerControl = gui.add({
    type: 'number',
    params: koch,
    property: 'outer',
    step: 0.001,
    min: -1,
    max: 1,
    onChange: function(outer) {
        innerControl.setMin(0.5 - outer * Math.cos(Math.PI / 180 * koch.angle));
        draw();
    },
});
outerControl.add({
    type: 'number',
    params: koch,
    property: 'angle',
    step: 0.1,
    min: -90,
    max: 90,
    onChange: function(angle) {
        // lower limit for the outer length
        if (Math.abs(angle) < 60) {
            outerControl.setMin(-0.5 / Math.cos(Math.PI / 180 * angle));
        } else {
            outerControl.setMin(-1);
        }
        innerControl.setMin(Math.abs(0.5 - koch.outer * Math.cos(Math.PI / 180 * angle)));
        draw();
    },
});
const innerControl = gui.add({
    type: 'number',
    params: koch,
    property: 'inner',
    step: 0.001,
    min: 0.333,
    max: 1,
    onChange: function() {
        draw();
    },
});
innerControl.add({
    type: 'selection',
    params: koch,
    property: 'side',
    options: ['outside', 'inside'],
    onChange: function() {
        draw();
    },
});

function setLengths() {
    const gamma = 2 * Math.PI / koch.corners * koch.winding;

    const length = 0.5 / (1 + Math.cos(gamma / 2));
    outerControl.setValueOnly(length);
    innerControl.setValueOnly(length);
}
setLengths();

gui.addTitle('styling');
gui.add({
    type: 'number',
    params: koch,
    property: 'lineWidth',
    min: 1,
    labelText: 'line width',
    onChange: function() {
        draw();
    },
});
gui.add({
    type: 'color',
    params: koch,
    property: 'background',
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'color',
    params: koch,
    property: 'linecolor',
    onChange: function() {
        draw();
    }
});

var outerCosAngle, outerSinAngle, height;

function line(generation, ax, ay, bx, by) {
    if (generation <= 0) {
        canvasContext.beginPath();
        canvasContext.moveTo(ax, ay);
        canvasContext.lineTo(bx, by);
        canvasContext.stroke();
    } else {
        const abx = bx - ax;
        const aby = by - ay;
        const perpx = aby;
        const perpy = -abx;
        const aax = ax + abx * outerCosAngle + perpx * outerSinAngle;
        const aay = ay + aby * outerCosAngle + perpy * outerSinAngle;
        const bbx = bx - abx * outerCosAngle + perpx * outerSinAngle;
        const bby = by - aby * outerCosAngle + perpy * outerSinAngle;
        const topx = 0.5 * (aax + bbx) + height * perpx;
        const topy = 0.5 * (aay + bby) + height * perpy;
        generation -= 1;
        line(generation, ax, ay, aax, aay);
        line(generation, aax, aay, topx, topy);
        line(generation, topx, topy, bbx, bby);
        line(generation, bbx, bby, bx, by);
    }
}

function gcd(p, q) {
    while (q > 0) {
        const r = p % q;
        p = q;
        q = r;
    }
    return p;
}

function draw() {
	console.log('draw');
    // setting up the canvas
    output.updateTransform();
    output.setLineWidth(koch.lineWidth);
    output.clearCanvas();
    canvasContext.strokeStyle = koch.linecolor;
    canvas.style.backgroundColor = koch.background;
    // general parameters
    const gamma = 2 * Math.PI / koch.corners * koch.winding;
    const repeat = gcd(koch.corners, koch.winding);
    const corners = koch.corners / repeat;
    outerCosAngle = koch.outer * Math.cos(Math.PI / 180 * koch.angle);
    outerSinAngle = koch.outer * Math.sin(Math.PI / 180 * koch.angle);
    const gapHalf = 0.5 - outerCosAngle;
    height = Math.sqrt(Math.max(0, koch.inner * koch.inner - gapHalf * gapHalf));
    if (koch.side === 'inside') {
        height = -height;
    }
    for (var r = 0; r < repeat; r++) {
        let angle = r * gamma / repeat;
        for (var i = 0; i < corners; i++) {
            const ax = koch.radius * Math.cos(angle);
            const ay = koch.radius * Math.sin(angle);
            angle += gamma;
            const bx = koch.radius * Math.cos(angle);
            const by = koch.radius * Math.sin(angle);
            line(koch.generations, ax, ay, bx, by);
        }
    }
}

output.showCanvasChanged = draw;
draw();