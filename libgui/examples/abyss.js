/* jshint esversion: 6 */
import {
    ParamGui,
    InstantHelp,
    output
}
from "../modules.js";

export const abyss = {};

const gui = new ParamGui({
    closed: false,
    name: "abyss controls"
});


output.createCanvas(gui);
const canvas = output.canvas;
const canvasContext = canvas.getContext("2d");

output.makeCanvasSizeButtons(gui, {
    label: 'HD',
    width: 1920,
    height: 1080
},{
    label: '4K',
    width: 4096,
    height: 2160
},{
    label: '4000 x 3000',
    width: 4000,
    height: 3000
});

gui.addParagraph('light');

const light = {};
light.center = 0.3;
light.scale = 2;

const smallNumber = {
    type: "number",
    params: light,
    min: 0,
    max: 2,
    step: 0.01,
    onChange: draw
};

gui.add(smallNumber, {
    property: 'center'
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

const ambient = {};

const amb = gui.add({
    type: 'color',
    labelText: 'ambient',
    colorObject: ambient,
    onChange: draw,
    initialValue: '#3300ff'
});

gui.addParagraph('attenuation');
const atten={};
atten.min = 1.4;
atten.max = 2;
smallNumber.params = atten;
smallNumber.max = 5;
gui.add(smallNumber, {
    property: 'min'
});
gui.add(smallNumber, {
    property: 'max'
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
        let intensity = Math.exp(-(x - light.center) * (x - light.center) * light.scale * light.scale);
        let a = atten.min + Math.random() * (atten.max - atten.min);
        for (var j = 0; j < height; j++) {
            const totalLight = intensity * Math.exp(-j / height * a);
            let red = totalLight * light.red + ambient.red;
            let green = totalLight * light.green + ambient.green;
            let blue = totalLight * light.blue + ambient.blue;
            pixels[index] = Math.max(0, Math.min(255, Math.floor(red)));
            pixels[index + 1] = Math.max(0, Math.min(255, Math.floor(green)));
            pixels[index + 2] = Math.max(0, Math.min(255, Math.floor(blue)));
            pixels[index + 3] = 255;
            index += 4 * width;
        }
    }
    canvasContext.putImageData(imageData, 0, 0);
}

output.drawCanvasChanged = draw;
output.firstDrawing();