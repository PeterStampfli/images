/* jshint esversion: 6 */

import {
    ColorInput,
    output
}
from "../libgui/modules.js";

// polygon with corners, fillcolor, generation number
export const Polygon = function(generation) {
    this.cornersX=[];
    this.cornersY=[];
    this.generation=generation;
    this.red=0;
    this.green=0;
    this.blue=0;
    this.alpha=255;
};

// drawing options
Polygon.fill = true;
Polygon.stroke = true;
Polygon.lineColor = '#000000';
Polygon.lineWidth = 2;

// adding a corner
Polygon.prototype.addCorner=function(x,y){
    this.cornersX.push(x);
    this.cornersY.push(y);
};

// close the polygon
Polygon.prototype.close=function(x,y){
    this.cornersX.push(this.cornersX[0]);
    this.cornersY.push(this.cornersY[0]);
};

// draw the polygon
Polygon.prototype.draw=function(){
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');
canvasContext.beginPath();
canvasContext.moveTo(this.cornersX[0],this.cornersY[0]);
const length=this.cornersX.length;
for (let i=1;i<=length;i++){
canvasContext.lineTo(this.cornersX[i],this.cornersY[i]);
}
  canvasContext.closePath(); 
  if (Polygon.fill){
    canvasContext.fillStyle=ColorInput.rgbaFrom(this);
 canvasContext.fill();
  } 
  if (Polygon.stroke){
    canvasContext.strokeStyle = Polygon.lineColor;
  }
  else {
        canvasContext.strokeStyle=ColorInput.rgbaFrom(this);
  }
  canvasContext.stroke();
};



// create regular polygon with n corners, generation 0

Polygon.createRegular=function(n){
const polygon=new Polygon(0);
for (let i=0; i<n;i++){
const angle=2*i*Math.PI/n;
    polygon.addCorner(Math.cos(angle),Math.sin(angle));
}
return polygon;
};