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


// drawing: canvas might have been resized
automaton.draw = function() {
    console.log('automaton draws');
    output.startDrawing();
    output.canvasContext.fillStyle='#8888ff';
    output.canvasContext.fillRect(0,0,output.canvas.width,output.canvas.height);
};

automaton.step = function() {
    console.log('automaton steps');
    
};


// reset, and a new random setup
automaton.reset = function() {
    logger.clear();
    console.log('automaton resets')
};

automaton.setup = function() {
    console.log('automaton setup')
    logger = main.gui.addLogger();
};