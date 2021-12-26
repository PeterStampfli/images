/* jshint esversion: 6 */

import {
    output,
    Pixels
} from "../libgui/modules.js";

import {
    main
} from './mainGrower.js';

export const automaton = {};

var logger;

//=====================================
// utilities

// choose from a random array
function randomChoice(options) {
    const index = Math.floor(options.length * Math.random());
    return options[index];
}

// extend an array/matrix/vector
function extend(space, minLength) {
    if (space.length < minLength) {
        space.length = minLength;
    }
}

function maxArray(a){
    const length=a.length;
    let result=a[0];
    for (let i=1;i<length;i++){
        result=Math.max(result,a[i]);
    }
    return result;
}

function minArray(a){
    const length=a.length;
    let result=a[0];
    for (let i=1;i<length;i++){
        result=Math.min(result,a[i]);
    }
    return result;
}


//=======================================
// color tables as integer colors
const color = {};
color.alpha = 255;
const colors = [];
colors.length = 255;
const colorMover=Pixels.integerOfColor({red:255,green:0,blue:0,alpha:255});


function greys() {
    for (let i = 0; i < 255; i++) {
        color.red = i;
        color.blue = i;
        color.green = i;
        colors[i] = Pixels.integerOfColor(color);
    }
}


//=========================================

const cells = [];
var size;
var trueMagnification;

// drawing: canvas might have been resized
automaton.draw = function() {
    console.log('automaton draws');
    output.startDrawing();
    output.canvasContext.fillStyle = '#8888ff';
    output.canvasContext.fillRect(0, 0, output.canvas.width, output.canvas.height);

    greys();
};

automaton.step = function() {
    console.log('automaton steps');

};

// reset, and a new random setup
automaton.reset = function() {
    logger.clear();
    console.log('automaton resets');
    size = output.canvas.width/automaton.magnification;
    size=2*Math.floor(size/2)+1;
    trueMagnification=output.canvas.width/size;                    // show block pixels, round down
    console.log('size '+size);
    extend(cells, size * size);

};

automaton.magnification=5;

automaton.setup = function() {
    console.log('automaton setup');
    main.gui.add({
        type:'number',
        params:automaton,
        property:'magnification',
        step:1,
        min:1,
        onChange: function(){
            automaton.reset();
        }
    });
    logger = main.gui.addLogger();
};