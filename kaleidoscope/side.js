/* jshint esversion: 6 */

import {

}
from "../libgui/modules.js";

import {


} from './modules.js';

/**
* a side of a polygon, connecting two points
* for determining if a point is inside the polygon
* tells if a point is vertically above
* @constructor Side
* @param {Corner} corner1
* @param {Corner} corner2
*/
export function Side(corner1,corner2){
	// ordering the line ends
	if (corner1.x<corner2.x){
		this.xLeft=corner1.x;
		this.xRight=corner2.x;
		this.yLeft=corner1.y;
		this.yRight=corner2.y;
	} else {
		this.xLeft=corner2.x;
		this.xRight=corner1.x;
		this.yLeft=corner2.y;
		this.yRight=corner1.y;
	}
	// the bounding rectangle
	this.yMax=Math.max(this.yLeft,this.yRight);
	this.yMin=Math.min(this.yLeft,this.yRight);
	// the line equation, beware of divide by zero
	const eps=1e-10;
	const dx=Math.max(this.xRight-this.xLeft,eps);
	// y=this.Yleft+this.m*(x-this.xLeft)
	this.m=(this.yRight-this.yLeft)/dx;
}