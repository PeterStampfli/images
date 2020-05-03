/* jshint esversion: 6 */


import {
    ParamGui,
    output,
    animation
}
from "../libgui/modules.js";
const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
    closed: false
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');
canvas.style.backgroundColor = 'lightBlue';

const imageSelector = gui.add({
    type: 'image',
    labelText: "input",
    options: {
        sample: "../libgui/examples/haeckel/haeckel_01.png"
    },
    initialValue: 'sample',
    onChange: draw
});

const inputImage = document.createElement("img");
inputImage.style.display = 'none';

document.body.appendChild(inputImage);

function luma(red, green, blue) {
    return 0.3 * red + 0.59 * green + 0.11 * blue;
}

const nStates = 9;

function draw() {
    console.log(imageSelector.getValue());
    console.log(inputImage.src);
    let selectedImage = imageSelector.getValue();
    selectedImage = selectedImage.split('/');
    selectedImage = selectedImage[selectedImage.length - 1];
    console.log(selectedImage);
    let loadedImage = inputImage.src;
    loadedImage = loadedImage.split('/');
    loadedImage = loadedImage[loadedImage.length - 1];
    console.log(loadedImage);

    inputImage.onload = function() {
        var i;
        const canvasWidthToHeight = output.canvas.width / output.canvas.height;
        const imageWidthToHeight = inputImage.width / inputImage.height;
        // fitting the input image to fill the canvas, and loading it
        if (canvasWidthToHeight > imageWidthToHeight) {
            //  image covers canvas if image width extended to canvas width
            const zoom = output.canvas.width / inputImage.width;
            canvasContext.drawImage(inputImage, 0, 0.5 * (inputImage.height - output.canvas.height / zoom), inputImage.width, output.canvas.height / zoom, 0, 0, output.canvas.width, output.canvas.height);
        } else {
            //  image covers canvas if image width extended to canvas width
            const zoom = output.canvas.height / inputImage.height;
            canvasContext.drawImage(inputImage, 0.5 * (inputImage.width - output.canvas.width / zoom), 0, output.canvas.width / zoom, inputImage.height, 0, 0, output.canvas.width, output.canvas.height);
        }
        const imageData = canvasContext.getImageData(0, 0, output.canvas.width, output.canvas.height);
        const pixels = imageData.data;

        // get maximum luma and prepare table
        const table = [];
        table.length = pixels.length / 4;
        const length = pixels.length;
        let maxLuma = 0;
        let index = 0;
        for (i = 0; i < length; i += 4) {
            let l = luma(pixels[i], pixels[i + 1], pixels[i + 2]);
            maxLuma = Math.max(maxLuma, l);
            table[index] = l;
            index += 1;
        }



    };

    if (loadedImage !== selectedImage) {
        console.log('loading');
        inputImage.src = imageSelector.getValue();
    } else {
        inputImage.onload();
    }
}
draw();
output.draw = draw;