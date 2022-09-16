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
const rosette = {};
// colors
rosette.lineColor = '#000000';
rosette.lineWidth = 2;

rosette.n = 8;
rosette.itemax = 10;

rosette.tileColor = '#000000';
rosette.tileWidth = 4;

rosette.size = 100;


gui.add({
    type: 'number',
    params: rosette,
    property: 'size',
    min: 0,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: rosette,
    property: 'n',
    step: 1,
    min: 3,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: rosette,
    property: 'itemax',
    step: 1,
    min: 0,
    onChange: function() {
        draw();
    }
});


const colorController = {
    type: 'color',
    params: rosette,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: rosette,
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
    property: 'tileColor',
    labelText: 'tile'
});

gui.add(widthController, {
    property: 'tileWidth'
});

// corners-coordinates
const px = [];
const py = [];

function addCorners() {
    const x = [];
    x.length = rosette.n + 1;
    px.push(x);
    const y = [];
    y.length = rosette.n + 1;
    py.push(y);
}


function draw() {
    SVG.begin();
    SVG.createGroup({
        fill: 'none',
        stroke: rosette.lineColor,
        'stroke-width': rosette.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        transform: 'scale(1 -1)'
    });
    px.length = 0;
    py.length = 0;
    const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;

    addCorners();
    let x = px[px.length - 1];
    let y = py[py.length - 1];
    x.fill(0);
    y.fill(0);

    addCorners();
    x = px[px.length - 1];
    y = py[py.length - 1];

    for (let i = 0; i <= n; i++) {
        x[i] = rosette.size * Math.cos(angle * i);
        y[i] = rosette.size * Math.sin(angle * i);
        SVG.create('path', {
            d: 'M 0 0 L ' + x[i] + ' ' + y[i]
        });
        let r2 = 0;
        for (var ite = 0; ite < rosette.itemax; ite++) {
            addCorners();
            x = px[px.length - 1];
            y = py[py.length - 1];
            const xLast = px[px.length - 2];
            const yLast = py[py.length - 2];
            const xLast2 = px[px.length - 3];
            const yLast2 = py[py.length - 3];
            for (let i = 0; i < n; i++) {
                x[i] = xLast[i] + xLast[i + 1] - xLast2[i + 1];
                y[i] = yLast[i] + yLast[i + 1] - yLast2[i + 1];
            }
            r2 = xLast[0] * xLast[0] + yLast[0] * yLast[0];
            if (x[0] * x[0] + y[0] * y[0] < 0.9 * (xLast[0] * xLast[0] + yLast[0] * yLast[0])) {
                break;
            }
            x[n] = x[0];
            y[n] = y[0];
            for (let i = 0; i < n; i++) {
                output.makePath(xLast[i], yLast[i], x[i], y[i], xLast[i + 1], yLast[i + 1]);
                canvasContext.stroke();
            }
        }
    }
    SVG.create('circle', {
        cx: 0,
        cy: 0,
        r: Math.sqrt(r2),
        stroke: 'blue'
    });
    SVG.terminate();
}

SVG.draw = draw;
draw();