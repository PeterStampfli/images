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

gui.add({
    type: 'number',
    params: main,
    property: 'size',
    min: 0,
    onChange: function() {
        create();
        draw();
    }
});

gui.add({
    type: 'number',
    params: main,
    property: 'generations',
    min: 0,
    step: 1,
    onChange: function() {
        create();
        draw();
    }
}).add({
    type: 'number',
    params: main,
    property: 'minRadius',
    labelText: 'minimum radius',
    min: 0,
    onChange: function() {
        create();
        draw();
    }
});

const maxElementsController = gui.add({
    type: 'number',
    params: main,
    property: 'maxElements',
    labelText: 'limit images',
    min: 0,
    step: 1,
    onChange: function() {
        create();
        draw();
    }
});
const currentElementsController = maxElementsController.add({
    type: 'number',
    params: main,
    property: 'currentElements',
    labelText: 'now',
    min: 0,
    step: 1,
    onChange: function() {}
});

gui.add({
    type: 'color',
    params: main,
    property: 'mappingColor',
    labelText: 'maps',
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'color',
    params: main,
    property: 'imageColor',
    labelText: 'images',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: main,
    min: 0,
    property: 'lineWidth',
    onChange: function() {
        draw();
    }
});

const mappingCircles = [];

// add a mapping circle
function mappingCircle(centerX, centerY, radius) {
    const mappingCircle = new Circle(main.size * centerX, main.size * centerY, main.size * radius);
    mappingCircle.images = [];
    const length = Math.max(1, main.generations);
    mappingCircle.images.length = length;
    for (let i = 0; i < length; i++) {
        mappingCircle.images[i] = [];
    }
    mappingCircles.push(mappingCircle);
}

const eps = 0.001;
// add an image circle to a mapping circle, if not already there
function addImage(iMap, circle) {
    const images = mappingCircles[iMap].images[0];
    const length = images.length;
    // if already there then return and do nothing
    for (let i = 0; i < length; i++) {
        const other = images[i];
        if ((Math.abs(other.centerX - circle.centerX) < eps) && (Math.abs(other.centerY - circle.centerY) < eps) && (Math.abs(other.radius - circle.radius) < eps)) {
            return;
        }
    }
    images.push(circle);
}

// create an image circle resulting from a mapping triplett to the zero generation of images
// add to the images belonging to the mapping circles (if not already there)
function basicImage(i, j, k) {
    const circle = Circle.createFromTriplett(mappingCircles[i], mappingCircles[j], mappingCircles[k]);
    addImage(i, circle);
    addImage(j, circle);
    addImage(k, circle);
}

// new generation from inversions
// for each mapping circle invert circles belonging to other mapping circles
//  except if image is unchanged (factor=1)
var nImages;

function newGeneration(generation) {
    const minRadius = main.minRadius;
    const mapLength = mappingCircles.length;
    for (let m = 0; m < mapLength; m++) {
        const mappingCircle = mappingCircles[m];
        const newGeneration = mappingCircle.images[generation];
        for (let i = 0; i < mapLength; i++) {
            if (i !== m) {
                const oldGeneration = mappingCircles[i].images[generation - 1];
                const oldGenLength = oldGeneration.length;
                for (let k = 0; k < oldGenLength; k++) {
                    const newCircle = mappingCircle.invertCircle(oldGeneration[k]);
                    if ((newCircle !== false) && (newCircle.radius > minRadius)) {
                        newGeneration.push(newCircle);
                        nImages += 1;
                    }
                }
            }
        }
    }
}

function tetrahedron() {
    // the tetrahedron, creating the appollonian gasket
    const rt32 = Math.sqrt(3) / 2;
    mappingCircle(1, 0, rt32);
    mappingCircle(-0.5, rt32, rt32);
    mappingCircle(-0.5, -rt32, rt32);
    mappingCircle(0, 0, 1 - rt32);
    basicImage(0, 1, 2);
    basicImage(0, 1, 3);
    basicImage(0, 2, 3);
    basicImage(1, 2, 3);
}

function octahedron() {
    const rt2 = Math.sqrt(2);
    mappingCircle(0, 0, rt2 - 1);
    mappingCircle(1, 1, 1);
    mappingCircle(1, -1, 1);
    mappingCircle(-1, -1, 1);
    mappingCircle(-1, 1, 1);
    mappingCircle(0, 0, rt2 + 1);
    basicImage(0, 1, 2);
    basicImage(0, 2, 3);
    basicImage(0, 3, 4);
    basicImage(0, 4, 1);
    basicImage(5, 1, 2);
    basicImage(5, 2, 3);
    basicImage(5, 3, 4);
    basicImage(5, 4, 1);
}

function create() {
    mappingCircles.length = 0;

    octahedron();

    nImages = 0;
    for (let gen = 1; gen < main.generations; gen++) {
        if (nImages < main.maxElements) {
            newGeneration(gen);
        }
    }
    currentElementsController.setValueOnly(nImages);
}

function draw() {
    SVG.begin();
    SVG.attributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        'stroke-width': main.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };
    SVG.attributes.stroke = main.mappingColor;
    SVG.createGroup(SVG.attributes);


    mappingCircles.forEach(circle => circle.draw());
    SVG.attributes.stroke = main.imageColor;
    SVG.createGroup(SVG.attributes);
    const mapLength = mappingCircles.length;
    for (let i = 0; i < mapLength; i++) {
        const images = mappingCircles[i].images;
        for (let gen = 0; gen < main.generations; gen++) {
            images[gen].forEach(circle => circle.draw());
        }
    }



    SVG.terminate();
}

SVG.draw = draw;
create();
draw();