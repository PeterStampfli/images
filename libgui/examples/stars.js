/* jshint esversion: 6 */

import {
    CoordinateTransform,
    ParamGui,
    output
} from "../modules.js";

// basic setup: the canvas and its transform
const gui = new ParamGui({
    name: 'Kochflakes',
    closed: false
});
const help = gui.addFolder('help', {
    closed: false
});
help.addParagraph('You can <strong>zoom the image,</strong> with the mouse wheel if the mouse is on the image.');
help.addParagraph('You can <strong>move the image</strong> with a mouse drag.');
help.addParagraph('You can <strong>change numbers</strong> by choosing a digit with the mouse and turning the mouse wheel.');
help.addParagraph('Alternatively, you can use the <strong>"image controls"</strong> part of the gui.');
help.addParagraph('Click on the black triangles to open/close parts of the gui.');
help.addParagraph('You can use this gui and other code for your own projects. It is at: <strong>https://github.com/PeterStampfli/paramGui</strong>');
help.addParagraph('Send bug reports and other comments to: <strong>pestampf@gmail.com</strong>');
const canvasGui = gui.addFolder({
    name: 'image controls',
    closed: true
});
output.drawCanvasChanged = function() {};
// an output canvas and some test image
output.createCanvas(canvasGui);
const canvas = output.canvas;
const canvasContext = output.canvasContext;
canvasGui.addTitle('coordinate transform');
output.setCanvasWidthToHeight();
output.addCoordinateTransform(canvasGui, false);
output.coordinateTransform.setStepShift(0.1);
output.coordinateTransform.setStepScale(0.01);
output.setInitialCoordinates(0, 0, 100);

// parameters
const koch = {};

// basic
koch.corners = 5;
koch.winding = 2;
koch.radius = 45;
koch.generations = 0;

// modification
koch.outer = 0.333;
koch.inner = 0.333;
koch.angle = 0;
koch.side = 'outside';
koch.rin = koch.radius;

//style
koch.lineWidth = 1;
koch.background = '#eeeeaaff';
koch.linecolor = '#000066ff';

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
    max: Math.floor(koch.corners / 2),
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
    onChange: function() {
        draw();
    },
});

gui.addTitle('number of iterations');
gui.add({
    type: 'number',
    params: koch,
    property: 'generations',
    step: 1,
    min: 0,
    max: 8,
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
const angleControl = outerControl.add({
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
    max: 1,
    onChange: function() {
        draw();
    },
});
innerControl.add({
    type: 'selection',
    params: koch,
    property: 'side',
    options: ['outside', 'inside', 'both', 'in-out', 'out-in'],
    onChange: function() {
        draw();
    },
});

function setLengths() {
    const gamma = 2 * Math.PI / koch.corners * koch.winding;
    const length = 0.5 / (1 + Math.cos(gamma / 2));
    outerControl.setValueOnly(length);
    angleControl.setValueOnly(0);
    innerControl.setMin(0.5 - length);
    innerControl.setValueOnly(length);
    //
    const alpha = 0.5 * (Math.PI - gamma);
    const beta = Math.PI / koch.corners;
    koch.rin = koch.radius * Math.sin(alpha) / (Math.sin(alpha) * Math.cos(beta) + Math.sin(beta) * Math.cos(alpha));

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
        const oddGeneration = (koch.generations - generation) & 1;
        generation -= 1;
        if ((koch.side === 'outside') || (koch.side === 'both') || (!oddGeneration && (koch.side === 'out-in')) || (oddGeneration && (koch.side === 'in-out'))) {
            const topx = 0.5 * (aax + bbx) + height * perpx;
            const topy = 0.5 * (aay + bby) + height * perpy;
            line(generation, ax, ay, aax, aay);
            line(generation, aax, aay, topx, topy);
            line(generation, topx, topy, bbx, bby);
            line(generation, bbx, bby, bx, by);
        }
        if ((koch.side === 'inside') || (koch.side === 'both') || (oddGeneration && (koch.side === 'out-in')) || (!oddGeneration && (koch.side === 'in-out'))) {
            const topx = 0.5 * (aax + bbx) - height * perpx;
            const topy = 0.5 * (aay + bby) - height * perpy;
            line(generation, ax, ay, aax, aay);
            line(generation, aax, aay, topx, topy);
            line(generation, topx, topy, bbx, bby);
            line(generation, bbx, bby, bx, by);
        }
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
    // setting up the canvas
    output.setLineWidth(koch.lineWidth);
    output.fillCanvas(koch.background);
    canvasContext.strokeStyle = koch.linecolor;
    // general parameters
    const gamma = 2 * Math.PI / koch.corners;
    outerCosAngle = koch.outer * Math.cos(Math.PI / 180 * koch.angle);
    outerSinAngle = koch.outer * Math.sin(Math.PI / 180 * koch.angle);
    const gapHalf = 0.5 - outerCosAngle;
    height = Math.sqrt(Math.max(0, koch.inner * koch.inner - gapHalf * gapHalf));
    for (var i = 0; i < koch.corners; i++) {
        let angle = i * gamma;
        const ax = koch.radius * Math.cos(angle);
        const ay = koch.radius * Math.sin(angle);
        angle += gamma / 2;
        const bx = koch.rin * Math.cos(angle);
        const by = koch.rin * Math.sin(angle);
        line(koch.generations, ax, ay, bx, by);
                angle += gamma / 2;
        const cx = koch.radius * Math.cos(angle);
        const cy = koch.radius * Math.sin(angle);
        line(koch.generations, bx, by,cx,cy);

    }

}

output.drawCanvasChanged = draw;
draw();