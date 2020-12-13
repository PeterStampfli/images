/* jshint esversion: 6 */

import {
    ParamGui,
    output
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
const size = 2;
output.setInitialCoordinates(0, 0, size);
output.addGrid();


// the basic rhomb
const rt32 = 0.5 * Math.sqrt(3);

const rhombs = {};
rhombs.maxGen = 3;
rhombs.crossFraction = 0.2; // probability for cross designs

function drawBorder(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    canvasContext.beginPath();
    canvasContext.moveTo(rightX, rightY);
    canvasContext.lineTo(topX, topY);
    canvasContext.lineTo(leftX, leftY);
    canvasContext.lineTo(bottomX, bottomY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function drawLines(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    const bottomRightX = 0.5 * (bottomX + rightX);
    const bottomRightY = 0.5 * (bottomY + rightY);
    const topRightX = 0.5 * (topX + rightX);
    const topRightY = 0.5 * (topY + rightY);
    const bottomLeftX = 0.5 * (bottomX + leftX);
    const bottomLeftY = 0.5 * (bottomY + leftY);
    const topLeftX = 0.5 * (topX + leftX);
    const topLeftY = 0.5 * (topY + leftY);
        canvasContext.beginPath();
    canvasContext.moveTo(rightX, rightY);
    canvasContext.lineTo(topX, topY);
    canvasContext.lineTo(leftX, leftY);
    canvasContext.lineTo(bottomX, bottomY);
    canvasContext.closePath();
  //  canvasContext.fill();

    if (Math.random()>0.5){
canvasContext.beginPath();
canvasContext.moveTo(bottomLeftX,bottomLeftY);
canvasContext.lineTo(topLeftX,topLeftY);
canvasContext.moveTo(bottomX,bottomY);
canvasContext.lineTo(topX,topY);
canvasContext.moveTo(bottomRightX,bottomRightY);
canvasContext.lineTo(topRightX,topRightY);
canvasContext.stroke();
    } else {
canvasContext.beginPath();
canvasContext.moveTo(bottomLeftX,bottomLeftY);
canvasContext.lineTo(bottomRightX,bottomRightY);
canvasContext.moveTo(rightX,rightY);
canvasContext.lineTo(leftX,leftY);
canvasContext.moveTo(topLeftX,topLeftY);
canvasContext.lineTo(topRightX,topRightY);
canvasContext.stroke();
    }
    

}

function rhomb(gen, bottomX, bottomY, topX, topY) {
    const centerX = 0.5 * (bottomX + topX);
    const centerY = 0.5 * (bottomY + topY);
    const upX = 0.6666 * (topX - centerX);
    const upY = 0.6666 * (topY - centerY);
    const rightX = centerX + rt32 * upY;
    const rightY = centerY - rt32 * upX;
    const leftX = centerX - rt32 * upY;
    const leftY = centerY + rt32 * upX;

    if (gen >= rhombs.maxGen) {
       // drawBorder(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
        drawLines(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);

    } else {
        gen += 1;
        rhomb(gen, bottomX, bottomY, bottomX + upX, bottomY + upY);
        rhomb(gen, leftX - upX, leftY - upY, bottomX + upX, bottomY + upY);
      //  rhomb(gen, rightX - upX, rightY - upY, bottomX + upX, bottomY + upY);
        rhomb(gen, leftX, leftY, bottomX + upX, bottomY + upY);
        rhomb(gen, rightX, rightY, bottomX + upX, bottomY + upY);
        rhomb(gen, topX - upX, topY - upY, bottomX + upX, bottomY + upY);
        rhomb(gen, topX - upX, topY - upY, rightX, rightY);
        rhomb(gen, topX - upX, topY - upY, leftX, leftY);
      //  rhomb(gen, topX - upX, topY - upY, leftX + upX, leftY + upY);
        rhomb(gen, topX - upX, topY - upY, rightX + upX, rightY + upY);
        rhomb(gen, topX - upX, topY - upY, topX, topY);
    }

}


function draw() {
    output.isDrawing = true;
    output.fillCanvasBackgroundColor();
canvasContext.strokeStyle = 'white';
canvasContext.fillStyle = output.backgroundColorString;
canvasContext.lineCap = 'round';
output.setLineWidth(4);
    rhomb(0, -0.5, rt32, 1, 0);
    rhomb(0, -0.5, -rt32, 1, 0);
    rhomb(0, -0.5, rt32, -0.5,-rt32);


    output.drawGrid();
}



output.drawCanvasChanged = draw;
output.drawGridChanged = draw;
draw();