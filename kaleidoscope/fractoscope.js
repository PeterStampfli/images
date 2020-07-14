/* jshint esversion:6 */

import {
    CoordinateTransform,
    Pixels,
    ParamGui,
    output,
    map,
    guiUtils
} from "../libgui/modules.js";

import {
    Circle
} from './circle.js';
// basic setup
const gui = new ParamGui({
    name: 'test',
    closed: false
});

// an output canvas and some test image
const outputGui = gui.addFolder('output image');
output.createCanvas(outputGui);
output.createPixels();
const canvas = output.canvas;
const canvasContext = output.canvasContext;

const initialSize = 512;

output.setCanvasDimensions(initialSize);


map.setOutputDraw();
const inputGui = gui.addFolder('input image');
inputGui.open();
map.inputImage = '../libgui/testimage.jpg';
map.setupInputImage(inputGui);

map.whatToShowController.setValueOnly('image - low quality');

gui.add({
    type: 'selection',
    initialValue: initialSize,
    options: [256, 512, 1024, 2048, 4096],
    onChange: function(size) {
        output.setCanvasDimensions(size);
        map.drawMapChanged();
    }
});
// centers are rounded down coordinates
// sizes are even 

// copy from higher to lower coordinates
// mirror at center with j -> top+bottom-j
function topDown(centerX, centerY, width, height = width) {
    var i, j, index;
    // limit size
    // lower position: center-size2+1>=0
    // upper position: center+size2<=canvas.width-1
    // (inclusive)   
    const width2 = Math.min(width / 2, centerX + 1, output.canvas.width - 1 - centerX);
    const height2 = Math.min(height / 2, centerY + 1, output.canvas.height - 1 - centerY);
    // the corners
    const left = centerX - width2 + 1;
    const right = centerX + width2;
    const bottom = centerY - height2 + 1;
    const top = centerY + height2;
    const mapWidth = map.width;
    // mirror at up diagonal (i,j) -> (j-bottom+left,i-left+bottom)
    // mirror at down diagonal (i,j) -> (right+bottom-j,right+bottom-i)
    // note that top-bottom=size-1 and left-right=size-1
    for (j = centerY + 1; j <= top; j++) {
        const jHigh = j * mapWidth;
        const jLow = (top + bottom - j) * mapWidth;
        for (i = left; i <= right; i++) {
            const one = iLow + i;
            const two = iHigh + i;
            map.xArray[one] = map.xArray[two];
            map.yArray[one] = map.yArray[two];
            map.sizeArray[one] = 1;
            map.sizeArray[two] = 1;
        }
    }
}

// copy from right to left coordinates
// mirror at center with i -> left+right-i
function rightToLeft(centerX, centerY, width, height = width) {
    var i, j, index;
    const width2 = Math.min(width / 2, centerX + 1, output.canvas.width - 1 - centerX);
    const height2 = Math.min(height / 2, centerY + 1, output.canvas.height - 1 - centerY);
    // the corners
    const left = centerX - width2 + 1;
    const right = centerX + width2;
    const bottom = centerY - height2 + 1;
    const top = centerY + height2;
    const mapWidth = map.width;
    // map left to right with i -> left+right-i
    // mirror at up diagonal (i,j) -> (j-bottom+left,i-left+bottom)
    // mirror at down diagonal (i,j) -> (right+bottom-j,right+bottom-i)
    // note that top-bottom=size-1 and left-right=size-1
    for (j = bottom; j <= top; j++) {
        const jLeft = j * mapWidth;
        const jRight = jLeft + right + left;
        for (i = left; i <= centerX; i++) {
            const one = jLeft + i;
            const two = jRight - i;
            map.xArray[one] = map.xArray[two];
            map.yArray[one] = map.yArray[two];
            map.sizeArray[one] = 1;
            map.sizeArray[two] = 1;
        }
    }
}

// copy from left to right coordinates
// mirror at center with i -> left+right-i
function leftToRight(centerX, centerY, size) {
    var i, j, index;
    const width2 = Math.min(width / 2, centerX + 1, output.canvas.width - 1 - centerX);
    const height2 = Math.min(height / 2, centerY + 1, output.canvas.height - 1 - centerY);
    // the corners
    const left = centerX - width2 + 1;
    const right = centerX + width2;
    const bottom = centerY - height2 + 1;
    const top = centerY + height2;
    const mapWidth = map.width;
    // map left to right with i -> left+right-i
    // mirror at up diagonal (i,j) -> (j-bottom+left,i-left+bottom)
    // mirror at down diagonal (i,j) -> (right+bottom-j,right+bottom-i)
    // note that top-bottom=size-1 and left-right=size-1
    for (j = bottom; j <= top; j++) {
        const jLeft = j * mapWidth;
        const jRight = jLeft + right + left;
        for (i = left; i <= centerX; i++) {
            const one = jRight - i;
            const two = jLeft + i;
            map.xArray[one] = map.xArray[two];
            map.yArray[one] = map.yArray[two];
            map.sizeArray[one] = 1;
            map.sizeArray[two] = 1;
        }
    }
}

// copy from upper left to lower right coordinates
// mirror at up diagonal (i,j) -> (j-bottom+left,i-left+bottom)
function upperLeftToLowerRight(centerX, centerY, size) {
    var i, j, index;
    let size2 = size / 2;
    size2 = Math.min(size2, centerX + 1, centerY + 1);
    size2 = Math.min(size2, output.canvas.width - 1 - centerX, output.canvas.height - 1 - centerY);
    // the corners
    const left = centerX - size2 + 1;
    const right = centerX + size2;
    const bottom = centerY - size2 + 1;
    const top = centerY + size2;
    const mapWidth = map.width;
    // mirror at up diagonal (i,j) -> (j-bottom+left,i-left+bottom)
    for (j = bottom; j <= top; j++) {
        const jWidth = j * map.width;
        for (i = left + j - bottom; i <= right; i++) {
            const one = jWidth + i;
            const two = j - bottom + left + map.width * (i - left + bottom);
            map.xArray[one] = map.xArray[two];
            map.yArray[one] = map.yArray[two];
            map.sizeArray[one] = 1;
            map.sizeArray[two] = 1;
        }
    }
}

// copy from upper right to lower left
// mirror at down diagonal (i,j) -> (right+bottom-j,right+bottom-i)
function upperRightToLowerLeft(centerX, centerY, size) {
    var i, j, index;
    let size2 = size / 2;
    size2 = Math.min(size2, centerX + 1, centerY + 1);
    size2 = Math.min(size2, output.canvas.width - 1 - centerX, output.canvas.height - 1 - centerY);
    // the corners
    const left = centerX - size2 + 1;
    const right = centerX + size2;
    const bottom = centerY - size2 + 1;
    const top = centerY + size2;
    const mapWidth = map.width;
    // mirror at down diagonal (i,j) -> (right+bottom-j,right+bottom-i)
    for (j = bottom; j <= top; j++) {
        const jWidth = j * map.width;
        const maxI = right - j + bottom;
        for (i = left; i <= maxI; i++) {
            const one = jWidth + i;
            const two = right + bottom - j + map.width * (right + bottom - i);
            map.xArray[one] = map.xArray[two];
            map.yArray[one] = map.yArray[two];
            map.sizeArray[one] = 1;
            map.sizeArray[two] = 1;
        }
    }
}

map.make = function() {
    var i, j;
    let index = 0;
    for (j = 0; j < map.height; j++) {
        for (i = 0; i < map.width; i++) {
            map.xArray[index] = i;
            map.yArray[index] = j;
            map.regionArray[index] = 0;
            map.structureIndexArray[index] = 0;
            map.sizeArray[index] = 1;
            index += 1;
        }
    }
    //     upperLeftToLowerRight(220, 250, 200);
    upperRightToLowerLeft(220, 250, 300);
    //  rightToLeft(220, 250, 300, 400);
    //    topDown(220, 250, 200);

};




output.firstDrawing();