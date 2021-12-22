/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
	main
} from './main.js';

export const automaton = {};

var logger;

const prevCells=[];    // reversible
const cells=[];
const sums=[];
const transitionTable=[];

// drawing: canvas might have been resized
automaton.draw = function() {
    output.startDrawing();
    output.canvasContext.fillStyle = '#8899ff';
    output.canvasContext.fillRect(0, 0, output.canvas.width, output.canvas.height);
};

automaton.step = function() {
    console.log('automaton steps');
};

// choose from a random array
function randomChoice(options){
	const index=Math.floor(options.length*Math.random());
	return options[index];
}

const sizes=[15,20,30,40,80];

const configs=[];
configs.push([1,1,0,0,0,0]);
configs.push([1,1,1,0,0,0]);
configs.push([1,1,1,1,0,0]);
configs.push([1,1,1,0,1,0]);
configs.push([1,1,1,1,1,0]);
configs.push([1,1,1,0,0,1]);
configs.push([1,1,1,1,0,1]);
configs.push([1,1,1,1,1,1]);

const centerCells=[0,1,1,1,2];

const borders=[0,0,0,1,1,2];

const boundaries=[-1,-1,0,0,1];

const nStatesOptions=[4,8,12,20,40];

var size;

// reset, and a new random setup
automaton.reset = function() {
 size=Math.floor(randomChoice(sizes)/2)*2+1;
};

automaton.setup=function() {
logger = main.gui.addLogger();

};
