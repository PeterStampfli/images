/**
* the automaton that makes the generations (life)
*/
import {
    gosUtils
}
from "./gosModules.js"

export function Life(){

}

/**
* set the size of the problem, is the periodicity
* has to be an odd number, will be odded
* the arrays include the added border cells of the boundary condition
* @method Life#setSize
* @param {int} size - has to be an odd number
* @return this - for chaining, just in case
*/
Life.prototype.setSize=function(size){
	// size of world (period length or width without boundary cells)
 this.size=(size>>1)<<1|1;            // force size to be odd
 console.log(size);
 // size plus boundary cells
 this.arraySize=size+2
 this.cells=new Uint8Array(this.arraySize*this.arraySize);
};


