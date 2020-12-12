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
const size=2;
    output.setInitialCoordinates(0,0, size);
    output.addGrid();


    // the basic rhomb
    const rt32=0.5*Math.sqrt(3);

    function rhomb(bottomX,bottomY,topX,topY){
        const centerX=0.5*(bottomX+topX);
        const centerY=0.5*(bottomY+topY);
        const upX=0.6666*(topX-centerX);
        const upY=0.6666*(topY-centerY);
        const rightX=centerX+rt32*upY;
        const rightY=centerY-rt32*upX;

    }


function draw(){
        output.isDrawing=true;

    output.fillCanvasBackgroundColor();
rhomb(0,-1,0,1);


    output.drawGrid();
}

    output.drawCanvasChanged = draw;
    output.drawGridChanged=draw;
draw();
