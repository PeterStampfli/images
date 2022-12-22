/* jshint esversion: 6 */

import {
    ParamGui,
    SVG,
    BooleanButton,
    guiUtils
}
from "../libgui/modules.js";

import {
    Circle
} from "./circle.js";

import {
    Sphere
} from "./sphere.js";

import {
    Line
} from "./line.js";

const gui = new ParamGui({
    closed: false
});

SVG.makeGui(gui);
SVG.init();
SVG.setMinViewWidthHeight(200, 200);
Circle.planar = false;

const saveSCADButton = gui.add({
    type: "button",
    buttonText: "save openSCAD",
    minLabelWidth: 20,
    onClick: function() {
        makeSCAD();
        guiUtils.saveTextAsFile(Circle.SCADtext, SCADsaveName.getValue(), 'scad');
    }
});
const SCADsaveName = saveSCADButton.add({
    type: "text",
    initialValue: "image",
    labelText: "as",
    textInputWidth: 150,
    minLabelWidth: 20
});

gui.add({
    type: 'boolean',
    params: Circle,
    property: 'planar',
    onChange: function() {
        draw();
    }
});

// parameters for drawing
export const main = {};
// colors
main.imageColor = '#000000';
main.mappingColor = '#ff0000';
main.lineWidth = 1;

Circle.size = 80;
main.generations = 1;
main.maxElements = 1000;
main.currentElements = 1000;
main.geometry = octahedron;

gui.add({
    type: 'number',
    params: Circle,
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

const mappingSpheres = [];

// add a mapping sphere
function addMappingSphere(centerX, centerY, centerZ, radius) {
    const mappingSphere = new Sphere(centerX, centerY, centerZ, radius);
    mappingSphere.images = [];
    const length = main.generations;
    mappingSphere.images.length = length;
    for (let i = 0; i < length; i++) {
        mappingSphere.images[i] = [];
    }
    mappingSpheres.push(mappingSphere);
}

// add a mapping sphere, normalized to hyperbolic radius 1
function addNormalizedMappingSphere(centerX, centerY, centerZ, radius) {
    const rHyp = Math.sqrt(centerX * centerX + centerY * centerY + centerZ * centerZ - radius * radius);
    addMappingSphere(centerX / rHyp, centerY / rHyp, centerZ / rHyp, radius / rHyp);
}

function tetrahedron() {
    // the tetrahedron, creating the appollonian gasket
    const rt32 = Math.sqrt(3) / 2;
    const rSphere = Math.sqrt(2 / 3);
    const r3 = 2 / 3 * Math.sqrt(2);
    addNormalizedMappingSphere(0, 0, -1, rSphere);
    addNormalizedMappingSphere(r3, 0, 1 / 3, rSphere);
    addNormalizedMappingSphere(-r3 / 2, rt32 * r3, 1 / 3, rSphere);
    addNormalizedMappingSphere(-r3 / 2, -rt32 * r3, 1 / 3, rSphere);
}

function octahedron() {
    const r = 1 / Math.sqrt(2);
    addNormalizedMappingSphere(-1, 0, 0, r);
    addNormalizedMappingSphere(1, 0, 0, r);
    addNormalizedMappingSphere(0, 1, 0, r);
    addNormalizedMappingSphere(0, -1, 0, r);
    addNormalizedMappingSphere(0, 0, 1, r);
    addNormalizedMappingSphere(0, 0, -1, r);
}

function cube() {
    addNormalizedMappingSphere(1, 1, 1, 1);
    addNormalizedMappingSphere(1, 1, -1, 1);
    addNormalizedMappingSphere(1, -1, 1, 1);
    addNormalizedMappingSphere(1, -1, -1, 1);
    addNormalizedMappingSphere(-1, 1, 1, 1);
    addNormalizedMappingSphere(-1, 1, -1, 1);
    addNormalizedMappingSphere(-1, -1, 1, 1);
    addNormalizedMappingSphere(-1, -1, -1, 1);
}

function ikosahedron() {
    const rt5 = Math.sqrt(5);
    const r = 0.5 * Math.sqrt(4 / 5 + (1 - 1 / rt5) * (1 - 1 / rt5));
    const plus = 0.1 * (5 + rt5);
    const minus = 0.1 * (5 - rt5);
    addNormalizedMappingSphere(0, 0, 1, r);
    addNormalizedMappingSphere(0, 0, -1, r);
    addNormalizedMappingSphere(2 / rt5, 0, 1 / rt5, r);
    addNormalizedMappingSphere(-plus, Math.sqrt(minus), 1 / rt5, r);
    addNormalizedMappingSphere(-plus, -Math.sqrt(minus), 1 / rt5, r);
    addNormalizedMappingSphere(minus, -Math.sqrt(plus), 1 / rt5, r);
    addNormalizedMappingSphere(minus, Math.sqrt(plus), 1 / rt5, r);
    addNormalizedMappingSphere(-2 / rt5, 0, -1 / rt5, r);
    addNormalizedMappingSphere(plus, Math.sqrt(minus), -1 / rt5, r);
    addNormalizedMappingSphere(plus, -Math.sqrt(minus), -1 / rt5, r);
    addNormalizedMappingSphere(-minus, -Math.sqrt(plus), -1 / rt5, r);
    addNormalizedMappingSphere(-minus, Math.sqrt(plus), -1 / rt5, r);
}

function dodecahedron() {
    const phi = 0.5 * (1 + Math.sqrt(5));
    const r = 0.5 * Math.sqrt(10 - 2 * Math.sqrt(5));
    for (let i = 0; i < 5; i++) {
        const x = 2 * Math.cos(2 / 5 * Math.PI * i);
        const y = 2 * Math.sin(2 / 5 * Math.PI * i);
        addNormalizedMappingSphere(x, y, phi + 1, r);
        addNormalizedMappingSphere(-x, -y, -(phi + 1), r);
        addNormalizedMappingSphere(phi * x, phi * y, phi - 1, r);
        addNormalizedMappingSphere(-phi * x, -phi * y, -(phi - 1), r);
    }
}

gui.add({
    type: 'selection',
    params: main,
    property: 'geometry',
    options: {
        tetrahedron: tetrahedron,
        octahedron: octahedron,
        cube: cube,
        ikosahedron: ikosahedron,
        dodecahedron: dodecahedron
    },
    onChange: function() {
        create();
        draw();
    }
});

// new generation from inversions
// for each mapping circle invert circles belonging to other mapping circles
//  except if image is unchanged (factor=1)
var nImages;

// generation 1:
// make basic images: find tripletts of touching spheres  sphereI---sphereJ---sphereK
// add image circle (or line) resulting from triplett
function generation1() {
    const length = mappingSpheres.length;
    // find tripletts of touching spheres, sphere j is in the middle, touching sphere i and sphere k
    // we can impose i<k, obviously indices are not equal
    for (let j = 0; j < length; j++) {
        const sphereJ = mappingSpheres[j];
        for (let i = 0; i < length - 1; i++) {
            if (i === j) {
                continue;
            }
            const sphereI = mappingSpheres[i];
            if (sphereJ.touches(sphereI)) {
                for (let k = i + 1; k < length; k++) {
                    const sphereK = mappingSpheres[k];
                    if (k === j) {
                        continue;
                    }
                    if (sphereJ.touches(sphereK)) {
                        // generate the image of the triplett, a Circle or a Line
                        const image = Circle.createFromTriplett(sphereI, sphereJ, sphereK);
                        // check if image already there, in images of another mapping sphere
                        let isCopy = false;
                        for (let c = 0; c < length; c++) {
                            const otherImages = mappingSpheres[c].images[0];
                            const otherImagesLength = otherImages.length;
                            for (let otherImageIndex = 0; otherImageIndex < otherImagesLength; otherImageIndex++) {
                                const otherImage = otherImages[otherImageIndex];
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
                            sphereJ.images[0].push(image);
                            nImages += 1;
                        }
                    }
                }
            }
        }
    }
}

function create() {
    mappingSpheres.length = 0;
    nImages = 0;
    main.geometry();
    if (main.generations >= 1) {
        generation1();
    }
    if (main.generations >= 2) {
        //  generation2();
    }
    for (let gen = 3; gen <= main.generations; gen++) {
        //  newGeneration(gen);
        if (nImages > main.maxElements) {
            break;
        }
    }
    currentElementsController.setValueOnly(nImages);
}

// save as scad data
//
function makeSCAD() {
    Circle.SCADtext = 'imageCircles=[';
    Circle.first = true;
    const mapLength = mappingSpheres.length;
    for (let i = 0; i < mapLength; i++) {
        const images = mappingSpheres[i].images;
        for (let gen = 0; gen < main.generations; gen++) {
            images[gen].forEach(image => image.writeSCAD());
        }
    }
    Circle.SCADtext += '\n];\n';
    Circle.SCADtext += 'mappingSpheres=[';
    Circle.first = true;
    mappingSpheres.forEach(sphere => sphere.writeSCAD());
    Circle.SCADtext += '\n];';
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
    Circle.minDrawingRadius = main.lineWidth;
    mappingSpheres.forEach(sphere => sphere.draw());
    SVG.attributes.stroke = main.imageColor;
    SVG.createGroup(SVG.attributes);
    const mapLength = mappingSpheres.length;
    for (let i = 0; i < mapLength; i++) {
        const images = mappingSpheres[i].images;
        for (let gen = 0; gen < main.generations; gen++) {
            images[gen].forEach(image => image.draw());
        }
    }
    SVG.terminate();
}

SVG.draw = draw;
create();
draw();

const stereographicProjector = new Sphere(0, 0, 1, Math.sqrt(2));
const testCircle = new Circle(0, 0, 0, 1, 0, 1, 0);
console.log(testCircle);
const proj = stereographicProjector.invertCircle(testCircle);
console.log(proj);
proj.drawProjection();