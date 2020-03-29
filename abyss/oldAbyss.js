/* jshint esversion: 6 */
import {
    ParamGui,
    InstantHelp,
    output
}
from "../libgui/modules.js";

export const abyss = {};

const gui = new ParamGui({
    closed: false
}, {
    name: "abyss controls"
});

output.createCanvas(gui);
const canvas = output.canvas;
const canvasContext = canvas.getContext("2d");

gui.addParagraph('light');

ParamGui.logConversion=true

abyss.lightCenter = 0.5;
abyss.lightScale = 1;
abyss.ambient = 0.1;

const smallNumber = {
    type: "number",
    params: abyss,
    min: 0,
    max: 2,
    step: 0.01,
    onChange: draw
};

gui.add(smallNumber, {
    property: 'lightCenter'
});
gui.add(smallNumber, {
    property: 'lightScale'
});
gui.add(smallNumber, {
    property: 'ambient'
});



abyss.red = 1;
abyss.blue = 1;
abyss.green = 1;

gui.add({
    type: 'number',
    params: abyss,
    property: 'red',
    min: 0,
    max: 1,
    step: 0.01,
    onChange: draw
});

gui.add({
    type: 'number',
    params: abyss,
    property: 'green',
    min: 0,
    max: 1,
    step: 0.01,
    onChange: draw
});

gui.add({
    type: 'number',
    params: abyss,
    property: 'blue',
    min: 0,
    max: 1,
    step: 0.01,
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
        let light = abyss.ambient + (1 - abyss.ambient) * Math.exp(-(x - abyss.lightCenter) * (x - abyss.lightCenter) * abyss.lightScale * abyss.lightScale);

        let red = light * abyss.red;
        let green = light * abyss.green;
        let blue = light * abyss.blue;


        //r1=0.995
        for (var j = 0; j < height; j++) {

            pixels[index] = Math.max(0, Math.min(255, Math.floor(255.9 * red)));
            pixels[index + 1] = Math.max(0, Math.min(255, Math.floor(255.9 * green)));
            pixels[index + 2] = Math.max(0, Math.min(255, Math.floor(255.9 * blue)));
            pixels[index + 3] = 255;

            index += 4 * width;
        }

    }
    canvasContext.putImageData(imageData, 0, 0);

}

output.draw = draw;

draw();