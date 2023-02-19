/* jshint esversion: 6 */
import {
    Cell
}
from "./cell.js";

// a collection of cells for a quasiperiodic automaton

export const automaton ={};

automaton.cells=[];

// add a cell at given place if not already there, return the cell
automaton.cellAt=function(x,y){
	let index = automaton.cells.findIndex((element) =>element.isAt(x,y));
	if (index<0){
		index=automaton.cells.length;
		automaton.cells.push(new Cell(x,y));
	}
	return automaton.cells[index];
}

// add a tile: given by an array of corner coordinates, as for drawing the polygon
automaton.addTile=function(cornerCoordinates){
	// determine center
	let centerX=0;
	let centerY=0;
	let length=cornerCoordinates.length;
	for (let i=0;i<length;i+=2){
		centerX+=cornerCoordinates[i];
		centerY+=cornerCoordinates[i+1];
	}
	centerX*=2/length;
	centerY*=2/length;
	console.log('center',centerX,centerY);
	// get corner cells
	const cellsAtCorners=[];
		for (let i=0;i<length;i+=2){
		cellsAtCorners.push(automaton.cellAt(cornerCoordinates[i],cornerCoordinates[i+1]));
	}
	console.log(cellsAtCorners);


}