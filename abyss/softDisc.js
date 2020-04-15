/* jshint esversion: 6 */
import {
    ParamGui,
    InstantHelp,
    output
}
from "../libgui/modules.js";

export const softDisc = {};

const abyss = {};

const gui = new ParamGui({
    closed: false
}, {
    name: "softDisc controls"
});

output.createCanvas(gui);
const canvas = output.canvas;
const canvasContext = canvas.getContext("2d");
output.canvas.style.backgroundColor = 'black';
output.setCanvasWidthToHeight(1);

output.makeCanvasSizeButtons(gui, {
    label: 'small',
    width: 100,
    height: 100
}, {
    width: 200,
    height: 150
}, {
    width: 500
});

gui.addParagraph('light');

//ParamGui.logConversion=true

const light = {};

light.radius = 0.25;
light.scale = 1;

const smallNumber = {
    type: "number",
    params: light,
    min: 0,
    max: 2,
    step: 0.01,
    onChange: draw
};

gui.add(smallNumber, {
    property: 'radius'
});
gui.add(smallNumber, {
    property: 'scale',
    max: 10
});


light.red = 200;
light.green = 255;
light.blue = 100;

gui.add({
    type: 'color',
    labelText: 'sunColor',
    colorObject: light,
    onChange: draw
});

function draw() {
    const height = canvas.height;
    const width = canvas.width;
    const imageData = canvasContext.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    for (var i = 0; i < width; i++) {
        let index = 4 * i;
        // reduced units, independent of canvas dimensions
        // x,y=0...1
        // color components = 0...1
        let x = i / width;
        for (var j = 0; j < height; j++) {

            let y = j / width;
            // calculate alpha
            const radius2 = (x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5);
            let alpha = 255;
            if (radius2 > light.radius * light.radius) {
                const r = Math.sqrt(radius2);
                alpha = (r - light.radius) / light.scale;
                alpha = 255 * Math.exp(-alpha * alpha);
            }
            pixels[index] = Math.max(0, Math.min(255, Math.floor(light.red)));
            pixels[index + 1] = Math.max(0, Math.min(255, Math.floor(light.green)));
            pixels[index + 2] = Math.max(0, Math.min(255, Math.floor(light.blue)));
            pixels[index + 3] = alpha;
            index += 4 * width;
        }
    }
    canvasContext.putImageData(imageData, 0, 0);
}

output.draw = draw;

draw();