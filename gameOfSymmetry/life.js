/**
* the automaton that makes the generations (life)
* we might need several of them
*/
import {
    gosUtils
}
from "./gosModules.js";

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
 this.arraySide=size+2;
 this.cells=new Uint8Array(this.arraySide*this.arraySide);
 // period, accounting for finite pixels
 // goes from a pixel to a pixel with the same color
 this.periodX=size;
 console.log(this.periodX)
 this.periodY=this.arraySide*size;
 // offset for position of sides, corner positions
 // this.bottomLeft=0;  
 this.bottomRight=this.arraySide-1;          
 this.topLeft=this.arraySide*(this.arraySide-1);
   this.topRight=this.cells.length-1;
// position of the center

// steps

// nearest neighbors

// second nearest
};



// array routines for initialization, boundary conditions and waht not


/**
 * fill the cells with numbers that are functions of the indices, module 256
 * @method Life#fill
 * @param {function} fun - of indices i,j
 */
Life.prototype.fill = function(fun) {
	const arraySide=this.arraySide;
    let index = 0;
    for (var j = 0; j < arraySide; j++) {
       for (var i = 0; i < arraySide; i++) {
            this.cells[index] = fun(i, j,arraySide) & 255;
            index += 1;
        }
    }
};

/**
 * fill cells with some number
 * not very usefull, rather a note to self
 * @method Life#fillValue
 * @param {number} value
 */
Life.prototype.fillValue = function( value) {
    this.cells.fill(value);
};

/**
 * fill border cells, leave rest unchanged
 * @method Life#fillBorder
 * @param {number} value
 */
Life.prototype.fillBorderValue = function( value) {
    let top = this.topLeft;
    let left = 0;
    let right = this.bottomRight;
    const arraySide=this.arraySide;
    for (var i = 0; i < arraySide; i++) {
        this.cells[i] = value; // bottom border
        this.cells[top] = value; // top border
        top += 1;
        this.cells[left] = value; // left border
        left += arraySide;
        this.cells[right] = value; // right border
        right += arraySide;
    }
};

/**
 * fill border cells, periodic boundary condition
 * @method Life#fillBorderPeriodic
 */
Life.prototype.fillBorderPeriodic = function( ) {
     const arraySide=this.arraySide;
     const end=arraySide-1;
     // first do borders between corners
  let top = this.topLeft+1;
    let right = this.bottomRight+arraySide;
    let left=arraySide;
    for (var i = 1; i < end; i++) {
        this.cells[i] = this.cells[i+this.periodY]; // bottom border
        this.cells[top] = this.cells[top-this.periodY]; // top border
        top += 1;
        this.cells[left] = this.cells[left+this.periodX]; // left border
        left += arraySide;
        this.cells[right] = this.cells[right-this.periodX]; // right border
        right += arraySide;
    }
    // the corners
    this.cells[0]=this.cells[this.periodX+this.periodY];
    this.cells[this.bottomRight]=this.cells[this.bottomRight-this.periodX+this.periodY];
    this.cells[this.topLeft]=this.cells[this.topLeft+this.periodX-this.periodY];
   this.cells[this.topRight]=this.cells[this.topRight-this.periodX-this.periodY];
};