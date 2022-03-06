/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

/**
 * intersection between two grid lines
 * line1 & line2
 */

export const Intersection = function(line1, line2) {
    this.line1 = line1;
    this.line2 = line2;

    const sin1 = line1.sinAlpha;
    const sin2 = line2.sinAlpha;
    const cos1 = line1.cosAlpha;
    const cos2 = line2.cosAlpha;
    console.log(cos1,sin1,cos2,sin2);

    const deltaX = sin1 * line1.d - sin2 * line2.d;
    const deltaY = -cos1 * line1.d + cos2 * line2.d;

    console.log(deltaX,deltaY);

    const det = sin1 * cos2 - cos1 * sin2;
    console.log(det);

    const t1 = (deltaY * cos2 - deltaX * sin2) / det;
    console.log(t1);

    this.x = t1 * cos1 - line1.d * sin1;
    this.y = t1 * sin1 + line1.d * cos1;

};

Intersection.radius = 0.1;
Intersection.color='#ff0000';
Intersection.lineWidth=1;

Intersection.prototype.draw = function() {
output.setLineWidth(Intersection.width);
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = Intersection.color;
    canvasContext.beginPath();
    canvasContext.arc(this.x,this.y,Intersection.radius,0,2*Math.PI);
        canvasContext.stroke();
};

Intersection.prototype.otherLine=function(line){
    if (line===this.line1){
        return this.line2;
    } else {
        return this.line1
    }
}