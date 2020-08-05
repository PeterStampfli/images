/* jshint esversion: 6 */


import {
    CoordinateTransform,
    Pixels,
    ParamGui,
    output,
    map,
    guiUtils
} from "../libgui/modules.js";

import {
    Circle,
    mirrors,
    Intersection
} from './modules.js';

// basic setup
const gui = new ParamGui({
    name: 'test',
    closed: false
});

// an output canvas and some test image
const outputGui = gui.addFolder('output image');
output.createCanvas(outputGui);

output.canvas.style.backgroundColor = 'grey';
output.createPixels();
const canvas = output.canvas;
const canvasContext = output.canvasContext;
outputGui.addParagraph('coordinate transform');
output.addCoordinateTransform(outputGui, false);
output.setInitialCoordinates(0, 0, 3);
map.setOutputDraw();
const inputGui = gui.addFolder('input image');
map.inputImage = '../libgui/testimage.jpg';
map.setupInputImage(inputGui);
const regionGui = gui.addFolder('regions');

map.regionControl(regionGui, 2);

map.makeNewColorTable(regionGui, 2);

// setup mapping show structure
//point.x , point.y and point.structureIndex
map.mapping = function(point) {
    mirrors.map(point);
};

mirrors.makeGui(gui);

// adjust a circle to intersections, generaal case
// setting up the general problem by going inversely from known solution

// the circle with index 0 has to be adjusted
// it has intersections with the other circles

const centerX = -1.0;
const centerY = -1;
const radius = 1;
const isOutsideInMap0 = false;
mirrors.addCircle({
    radius: radius,
    centerX: centerX,
    centerY: centerY,
    isOutsideInMap: isOutsideInMap0
});
mirrors.selected=mirrors.collection[0];

// any number of intersections <=3

const nInter = 3;

// the intersection order

let n = 2000;

let n1 = n;
let n2 = n;
let n3 = n;

// change some of them ?

// radius' of the circles

const r = 2;

let r1 = r;
let r2 = r;
let r3 = r;

// changes ?

// angles, in degrees

let phi1 = 0;
let phi2 = 90;
let phi3 = 180;

// to radians
phi1 *= Math.PI / 180;
phi2 *= Math.PI / 180;
phi3 *= Math.PI / 180;

// map direction:

const isOutsideInMap = false;

let isOutsideInMap1 = isOutsideInMap;
let isOutsideInMap2 = isOutsideInMap;
let isOutsideInMap3 = isOutsideInMap;

// set up geometry

var is;

if (nInter>=1){
const circle=mirrors.addCircle({
    radius: r1,
    centerX: 0,
    centerY: 0,
    isOutsideInMap: isOutsideInMap1
});
is = new Intersection(mirrors.collection[0], mirrors.collection[1], n1);
const d=is.distanceBetweenCenters();
console.log('distance',d);
circle.setCenter(centerX+Math.cos(phi1)*d,centerY+Math.sin(phi1)*d);
}

if (nInter>=2){
const circle=mirrors.addCircle({
    radius: r2,
    centerX: 0,
    centerY: 0,
    isOutsideInMap: isOutsideInMap2
});
is = new Intersection(mirrors.collection[0], mirrors.collection[2], n2);
const d=is.distanceBetweenCenters();
console.log('distance',d);
circle.setCenter(centerX+Math.cos(phi2)*d,centerY+Math.sin(phi2)*d);
}

if (nInter>=3){
const circle=mirrors.addCircle({
    radius: r3,
    centerX: 0,
    centerY: 0,
    isOutsideInMap: isOutsideInMap3
});
is = new Intersection(mirrors.collection[0], mirrors.collection[3], n3);
const d=is.distanceBetweenCenters();
console.log('distance',d);
circle.setCenter(centerX+Math.cos(phi3)*d,centerY+Math.sin(phi3)*d);
}

mirrors.collection[0].adjustToIntersections();

map.drawImageChanged = function() {
    map.draw();
    mirrors.draw();
};
Circle.draw = map.drawMapChanged;

output.mouseCtrlMoveAction = function(event) {
    if (mirrors.isSelected(event)) {
        output.canvas.style.cursor = "pointer";
    } else {
        output.canvas.style.cursor = "default";
    }
    output.pixels.show();
    mirrors.draw(false);
};

output.mouseCtrlDownAction = function(event) {
    mirrors.select(event);
    output.pixels.show();
    mirrors.draw(false);
};

output.mouseCtrlWheelAction = function(event) {
    if (event.shiftPressed) {
        console.log('wheel');
        is.incDecN(event.wheelDelta);
        map.drawMapChanged();

    } else {
        mirrors.wheelAction(event);
        map.drawMapChanged();
    }
};

output.mouseCtrlDragAction = function(event) {
    mirrors.dragAction(event);
    map.drawMapChanged();
};

output.firstDrawing();