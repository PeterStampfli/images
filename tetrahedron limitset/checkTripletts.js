/* jshint esversion: 6 */

import {
    ParamGui,
    SVG,
    BooleanButton
}
from "../libgui/modules.js";

import {
    Circle
} from "./circle.js";

import {
    Line
} from "./line.js";

const gui = new ParamGui({
    closed: false
});

SVG.makeGui(gui);
SVG.init();

// parameters for drawing
export const main = {};
// colors
main.imageColor = '#000000';
main.mappingColor = '#ff0000';
main.lineWidth = 1;

main.size = 40;
main.generations = 5;
main.minRadius = 0.1;
main.maxElements = 1000;
main.currentElements = 1000;

function draw() {
    SVG.begin();
    SVG.attributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        'stroke-width': main.lineWidth,
        stroke:main.imageColor,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };
    SVG.attributes.stroke = main.mappingColor;
    SVG.createGroup(SVG.attributes);

const c1=new Circle(0,200,350);
const c2=new Circle(100,50,150);
const c3=new Circle(-100,0,50);
c1.draw();
c2.draw();
c3.draw();
    SVG.attributes.stroke = main.imageColor;
    SVG.createGroup(SVG.attributes);

const thing=Circle.createFromTriplett(c1,c2,c3);
thing.draw();

    SVG.terminate();
}

SVG.draw = draw;
draw();