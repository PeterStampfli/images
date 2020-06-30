/* jshint esversion: 6 */


import {
    ParamGui,
    output,
    animation,
    guiUtils
}
from "../libgui/modules.js";
const gui = new ParamGui({
    closed: false
});

output.drawCanvasChanged = function() {};
output.createCanvas(gui, {
    name: 'canvas control',
    closed: false
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');
canvas.style.backgroundColor = 'lightBlue';

const ps = {};
ps.gridColor = '#ffff00';
ps.horizontal = 10;
ps.vertical = 10;
ps.lineWidth = 1;

const imageSelector = gui.add({
    type: 'image',
    labelText: "input",
    onChange: draw,
});

gui.add({
    type: 'color',
    params: ps,
    property: 'gridColor',
    onChange: draw
});

gui.add({
    type: 'number',
    params: ps,
    property: 'lineWidth',
    min: 1,
    onChange: draw
});

gui.add({
    type: 'number',
    params: ps,
    property: 'horizontal',
    min: 1,
    step: 1,
    onChange: draw
});

gui.add({
    type: 'number',
    params: ps,
    property: 'vertical',
    min: 1,
    step: 1,
    onChange: draw
});

function draw() {
    imageSelector.useImage(function(inputImage) {
        var i;
        output.setCanvasWidthToHeight(inputImage.width / inputImage.height);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        if (guiUtils.isDefined(inputImage)) {
            canvasContext.drawImage(inputImage, 0, 0, canvas.width, canvas.height);
        }
        canvasContext.strokeStyle = ps.gridColor;
        canvasContext.lineWidth = ps.lineWidth;
        for (i = 1; i < ps.horizontal; i++) {
            const x = i * canvas.width / ps.horizontal;
            canvasContext.beginPath();
            canvasContext.moveTo(x, 0);
            canvasContext.lineTo(x, canvas.height);
            canvasContext.stroke();
        }
        for (i = 1; i < ps.vertical; i++) {
            const y = i * canvas.height / ps.vertical;
            canvasContext.beginPath();
            canvasContext.moveTo(0, y);
            canvasContext.lineTo(canvas.width, y);
            canvasContext.stroke();
        }
    });
}

draw();
output.drawCanvasChanged = draw;