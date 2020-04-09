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

output.makeCanvasSizeButtons(gui, {
    label: 'small',
    width: 100,
    height: 100
},{width:200,height:150},{width:500});

gui.addParagraph('light');

//ParamGui.logConversion=true

const light = {};

light.center = 0.5;
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



ambient.green = 0;
ambient.blue = 255;
amb.updateDisplay();


gui.addParagraph('attenuation');
const atten={};
atten.min = 0.1;
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


        //r1=0.995
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

output.draw = draw;

draw();