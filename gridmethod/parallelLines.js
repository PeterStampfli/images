/* jshint esversion: 6 */

import {
    Line
} from "./line.js";

/**
* having many parallel lines
*/

export const ParallelLines=function(){
this.lines=[];
};

ParallelLines.prototype.addLine=function(alpha,d){
	this.lines.push(new Line(alpha,d));
};

ParallelLines.prototype.draw=function(){
this.lines.forEach(line=>line.draw());
};

// symmetric set of lines, unit distance
ParallelLines.createSymmetricBundle=function(alpha,n){
 const lines=new ParallelLines();
 for (let i=0;i<n;i++){
 	lines.addLine(alpha,0.5+i);
 	lines.addLine(alpha,-0.5-i);
 }
 return lines;
};