/* jshint esversion: 6 */
import {
    Cell
}
from "./cell.js";

// a collection of cells for a quasiperiodic automaton

export const automaton ={};

automaton.cells=[];

automaton.setLimit=function(r){
	automaton.r=r;
	automaton.r2=r*r;
}

// add a cell at given place if not already there, return the cell
automaton.cellAt=function(x,y){
	let index = automaton.cells.findIndex((element) =>element.isAt(x,y));
	if (index<0){
		index=automaton.cells.length;
		automaton.cells.push(new Cell(x,y));
	}
	return automaton.cells[index];
};

// add a tile: given by an array of corner coordinates, as for drawing the polygon
automaton.addTile=function(cornerCoordinates){
	// determine center
	let centerX=0;
	let centerY=0;
	let coordinatesLength=cornerCoordinates.length;
	for (let i=0;i<coordinatesLength;i+=2){
		centerX+=cornerCoordinates[i];
		centerY+=cornerCoordinates[i+1];
	}
	centerX*=2/coordinatesLength;
	centerY*=2/coordinatesLength;
	console.log('center',centerX,centerY);
	if (centerX*centerX+centerY*centerY>automaton.r2){
		console.log('out');
		return;
	}
	// get corner cells, and add to them center of tile as corner
	const cellsAtCorners=[];
		for (let i=0;i<coordinatesLength;i+=2){
			const newCell=automaton.cellAt(cornerCoordinates[i],cornerCoordinates[i+1]);
			newCell.addCorner(centerX,centerY);
		cellsAtCorners.push(newCell);
	}
	// add connections, each corner cell is connected to neighbors
	const cellsLength=cellsAtCorners.length;
	let lastCell=cellsAtCorners[cellsLength-1];
	for (let i=0;i<cellsLength;i++){
		console.log(i);
	let currentCell=cellsAtCorners[i];
		currentCell.addNeighbor(lastCell);
		lastCell.addNeighbor(currentCell);
		lastCell=currentCell;
	}	
	console.log(cellsAtCorners);


};