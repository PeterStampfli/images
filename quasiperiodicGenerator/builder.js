/* jshint esversion: 6 */

export const builder={};

var gui={};

var order,inflation;
var basisX=[];
var basisY=[];

var tiles={};
var tileNames=[];

const initialColors=['#ff0000','#ff8800','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff'];

const colorControllers=[];

builder.init=function(guiP){
 gui=guiP;
};

builder.setup=function(definition){
	inflation=definition.inflation;
order=definition.order;
basisX.length=order;
basisY.length=order;
const dalpha=Math.PI/order;
let alpha=0;
for (let i=0;i<order;i++){
	basisX[i]=Math.cos(alpha);
	basisY[i]=Math.sin(alpha);
	alpha+=dalpha;
}
console.log(basisX,basisY);
tiles=definition.tiles;
colorControllers.forEach(controller=>controller.destroy());
tileNames=Object.keys(tiles);
console.log(tileNames)
for (let name of tileNames){
	console.log(name)
}
};