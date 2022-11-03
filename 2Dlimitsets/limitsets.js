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

// first project from 3d space to 2d
// then add mapping circle
function project(x, y, z, r) {
    console.log(x, y, z, r);
    // center of hyperbolic sphere at origin, radius rHyp
    let d2 = x * x + y * y + z * z;
    const r2 = r * r;
    const rHyp2 = d2 - r2;
    const rHyp = Math.sqrt(rHyp2);
    console.log('rhyp', rHyp)
        // projection with inversion at sphere with radius sqrt(2)*rHyp, center at (0,0,rHyp)
    const dz = z - rHyp;
    d2 = x * x + y * y + dz * dz;
    const factor = 2 * rHyp2 / (d2 - r2);
    console.log("d2,dz,factor", d2, dz, factor)
    x *= factor;
    y *= factor;
    z = rHyp + factor * dz;
    r = Math.abs(factor) * r;
    console.log('mappingCircle(' + x.toPrecision(4) + ',' + y.toPrecision(4) + ',' + r.toPrecision(4) + ');');
    mappingCircle(x, y, r);
}

// add a mapping circle
function mappingCircle(centerX, centerY, radius) {
    const mappingCircle = new Circle(main.size * centerX, main.size * centerY, main.size * radius);
    mappingCircle.images = [];
    const length = main.generations;
    mappingCircle.images.length = length;
    for (let i = 0; i < length; i++) {
        mappingCircle.images[i] = [];
    }
    mappingCircles.push(mappingCircle);
}

// generation 0:
// make basic images: find tripletts of touching circles  circleI---circleJ---circleK
// add image circle resulting from triplett
function generation1() {
    const length = mappingCircles.length;
    // find tripletts of touching circles, circle j is in the middle, touching circle i and circle k
    // we can impose i<k, obviously indices are not equal
    for (let j = 0; j < length; j++) {
        const circleJ = mappingCircles[j];
        for (let i = 0; i < length - 1; i++) {
            if (i === j) {
                continue;
            }
            const circleI = mappingCircles[i];
            if (circleJ.touches(circleI)) {
                for (let k = i + 1; k < length; k++) {
                    const circleK = mappingCircles[k];
                    if (k === j) {
                        continue;
                    }
                    if (circleJ.touches(circleK)) {
                        // generate the image of the triplett, a Circle or a Line
                        const image = Circle.createFromTriplett(circleI, circleJ, circleK);
                        // check if image already there, in images of another mapping circle
                        let isCopy = false;
                        for (let c = 0; c < length; c++) {
                            const otherImages = mappingCircles[c].images[0];
                            const otherLength = otherImages.length;
                            for (let otherIndex = 0; otherIndex < otherLength; otherIndex++) {
                                const otherImage = otherImages[otherIndex];
                                if (otherImage.equals(image)) {
                                    isCopy = true;
                                    break;
                                }
                            }
                            if (isCopy) {
                                break;
                            }
                        }
                        if (!isCopy) {
                            circleJ.images[0].push(image);
                            nImages += 1;
                        }
                    }
                }
            }
        }
    }
}

// new generation from inversions
// for each mapping circle invert circles belonging to other mapping circles
//  except if image is unchanged (factor=1)
var nImages;

// the first true generation, there can be Lines and Circles to invert
function generation2() {
    const mapLength = mappingCircles.length;
    for (let m = 0; m < mapLength; m++) {
        const mappingCircle = mappingCircles[m];
        const newGeneration = mappingCircle.images[1];
        for (let i = 0; i < mapLength; i++) {
            if (i !== m) {
                const oldImages = mappingCircles[i].images[0];
                const oldLength = oldImages.length;
                for (let k = 0; k < oldLength; k++) {
                    var newImage;
                    const oldImage = oldImages[k];
                    if (oldImage instanceof Circle) {
                        newImage = mappingCircle.invertCircle(oldImage);
                    } else {
                        newImage = mappingCircle.invertLine(oldImage);
                    }
                    if (newImage) {
                        newGeneration.push(newImage);
                        nImages += 1;
                    }
                }
            }
        }
    }
}

// make a new generation, only circles for inversion
// new generation at index generation-1
function newGeneration(generation) {
    const minRadius = main.minRadius;
    const mapLength = mappingCircles.length;
    for (let m = 0; m < mapLength; m++) {
        const mappingCircle = mappingCircles[m];
        const newGeneration = mappingCircle.images[generation - 1];
        for (let i = 0; i < mapLength; i++) {
            if (i !== m) {
                const oldGeneration = mappingCircles[i].images[generation - 2];
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
}

function octahedron() {
    const rt2 = Math.sqrt(2);
    mappingCircle(0, 0, rt2 - 1);
    mappingCircle(1, 1, 1);
    mappingCircle(1, -1, 1);
    mappingCircle(-1, -1, 1);
    mappingCircle(-1, 1, 1);
    mappingCircle(0, 0, rt2 + 1);
}

function projectedOctahedron() {
    const r = 1 / Math.sqrt(2);
    project(-1, 0, 0, r);
    project(1, 0, 0, r);
    project(0, 1, 0, r);
    project(0, -1, 0, r);
    project(0, 0, 1, r);
    project(0, 0, -1, r);
}

function projectedCube() {
    project(1, 1, 1, 1);
    project(1, 1, -1, 1);
    project(1, -1, 1, 1);
    project(1, -1, -1, 1);
    project(-1, 1, 1, 1);
    project(-1, 1, -1, 1);
    project(-1, -1, 1, 1);
    project(-1, -1, -1, 1);
}

function cubeoctahedron() {
    const r = 1 / Math.sqrt(2);
    project(1, 0, 1, r);
    project(1, 0, -1, r);
    project(-1, 0, 1, r);
    project(-1, 0, -1, r);
    project(1, 1, 0, r);
    project(1, -1, 0, r);
    project(-1, 1, 0, r);
    project(-1, -1, 0, r);
    project(0, 1, 1, r);
    project(0, 1, -1, r);
    project(0, -1, 1, r);
    project(0, -1, -1, r);
}

function ikosahedron() {
    const rt5 = Math.sqrt(5);
    const r = 0.5 * Math.sqrt(4 / 5 + (1 - 1 / rt5) * (1 - 1 / rt5));
    const plus = 0.1 * (5 + rt5);
    const minus = 0.1 * (5 - rt5);
    console.log(r);
    project(0, 0, 1, r);
    project(0, 0, -1, r);
    project(2 / rt5, 0, 1 / rt5, r);
    project(-plus, Math.sqrt(minus), 1 / rt5, r);
    project(-plus, -Math.sqrt(minus), 1 / rt5, r);
    project(minus, -Math.sqrt(plus), 1 / rt5, r);
    project(minus, Math.sqrt(plus), 1 / rt5, r);
    project(-2 / rt5, 0, -1 / rt5, r);
    project(plus, Math.sqrt(minus), -1 / rt5, r);
    project(plus, -Math.sqrt(minus), -1 / rt5, r);
    project(-minus, -Math.sqrt(plus), -1 / rt5, r);
    project(-minus, Math.sqrt(plus), -1 / rt5, r);
}

function dodecagon() {
    const phi = 0.5 * (1 + Math.sqrt(5));
    const r = 0.5 * Math.sqrt(10 - 2 * Math.sqrt(5));
    for (let i = 0; i < 5; i++) {
const x=2*Math.cos(2/5*Math.PI*i);
const y=2*Math.sin(2/5*Math.PI*i);
project(x,y,phi+1,r);
project(-x,-y,-(phi+1),r);
project(phi*x,phi*y,phi-1,r);
project(-phi*x,-phi*y,-(phi-1),r);
    }
}

function create() {
    mappingCircles.length = 0;
    nImages = 0;

    //  octahedron();
    //projectedOctahedron();
    //  tetrahedron();
    //   projectedCube();
    //ikosahedron();
    //cubeoctahedron();
    dodecagon();
    if (main.generations > 0) {
        generation1();
    }
    if (main.generations > 1) {
        generation2();
    }

    for (let gen = 2; gen <= main.generations; gen++) {
        newGeneration(gen);
        console.log(gen, nImages);
        if (nImages > main.maxElements) {
            break;
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
            images[gen].forEach(image => image.draw());
        }
    }


    SVG.terminate();
}

SVG.draw = draw;
create();
draw();