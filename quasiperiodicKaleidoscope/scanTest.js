/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    output
} from "../libgui/modules.js";

const test={};

// drawing the image: constants
const white = Pixels.integerOfColor({
    red: 200,
    green: 255,
    blue: 255,
    alpha: 255
});
const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});
const blue = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 255,
    alpha: 255
});

function action(x,y,index){
        output.pixels.array[index]=blue;

if(x<0){
    output.pixels.array[index]=black;
}
}

test.draw = function() {
    
 pixelPaint.fill(white);

//pixelPaint.scanTrapeze(0,-0.5,1,0.5,-0.7,0.9,action);

pixelPaint.scanTriangle(2,-1,1,0.5,0.5,-0.6,action);
    output.pixels.show();



};

test.setup = function() {
    pixelPaint.setup('test', false);
    const gui = pixelPaint.gui;
    output.addCursorposition();
    output.setInitialCoordinates(0,0,3);
    output.drawCanvasChanged = test.draw;
    test.draw();
    
};

test.setup();
