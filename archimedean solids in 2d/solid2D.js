/* jshint esversion: 6 */

import {
    ParamGui,
    SVG,
    BooleanButton,
    guiUtils
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

SVG.makeGui(gui);
SVG.init();
SVG.setMinViewWidthHeight(200, 200);

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

// parameters for drawing
export const main = {};
// colors
main.imageColor = '#000000';
main.lineWidth = 1;

main.size = 80;
main.polyhedron = regularPolyhedron;

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
    type: 'color',
    params: main,
    property: 'imageColor',
    labelText: 'line',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: main,
    min: 0,
    property: 'lineWidth',
    labelText:'width',
    onChange: function() {
        draw();
    }
});

// rotation angles
main.beta=0;
main.gamma=0;

gui.add({
    type: 'number',
    params: main,
    property: 'beta',
    onChange: function() {
        create();
        draw();
    }
}).add({
    type: 'number',
    params: main,
    property: 'gamma',
    onChange: function() {
        create();
        draw();
    }
});

var basicVertices = [];
var polyhedronEdges = [];
var truncationFactor;

function basicVertex(x, y, z) {
    // rotate

    // normalize to unit sphere
    const factor = 1 / Math.sqrt(x * x + y * y + z * z);
    basicVertices.push([factor * x, factor * y, factor * z]);
}

function tetrahedron() {
    const rt32 = Math.sqrt(3) / 2;
    const r3 = 2 / 3 * Math.sqrt(2);
    truncationFactor = 0.33333;
    basicVertex(0, 0, -1);
    basicVertex(r3, 0, 1 / 3);
    basicVertex(-r3 / 2, rt32 * r3, 1 / 3);
    basicVertex(-r3 / 2, -rt32 * r3, 1 / 3);
}

function octahedron() {
    truncationFactor = 0.33333;
    basicVertex(-1, 0, 0);
    basicVertex(1, 0, 0);
    basicVertex(0, 1, 0);
    basicVertex(0, -1, 0);
    basicVertex(0, 0, 1);
    basicVertex(0, 0, -1);
}

function cube() {
    truncationFactor = 0.2929;
    basicVertex(1, 1, 1, 1);
    basicVertex(1, 1, -1, 1);
    basicVertex(1, -1, 1, 1);
    basicVertex(1, -1, -1, 1);
    basicVertex(-1, 1, 1, 1);
    basicVertex(-1, 1, -1, 1);
    basicVertex(-1, -1, 1, 1);
    basicVertex(-1, -1, -1, 1);
}

function ikosahedron() {
    const rt5 = Math.sqrt(5);
    const plus = 0.1 * (5 + rt5);
    const minus = 0.1 * (5 - rt5);
    truncationFactor = 0.33333;
    basicVertex(0, 0, 1);
    basicVertex(0, 0, -1);
    basicVertex(2 / rt5, 0, 1 / rt5);
    basicVertex(-plus, Math.sqrt(minus), 1 / rt5);
    basicVertex(-plus, -Math.sqrt(minus), 1 / rt5);
    basicVertex(minus, -Math.sqrt(plus), 1 / rt5);
    basicVertex(minus, Math.sqrt(plus), 1 / rt5);
    basicVertex(-2 / rt5, 0, -1 / rt5);
    basicVertex(plus, Math.sqrt(minus), -1 / rt5);
    basicVertex(plus, -Math.sqrt(minus), -1 / rt5);
    basicVertex(-minus, -Math.sqrt(plus), -1 / rt5);
    basicVertex(-minus, Math.sqrt(plus), -1 / rt5);
}

function dodecahedron() {
    const phi = 0.5 * (1 + Math.sqrt(5));
    truncationFactor = 0.2764;
    for (let i = 0; i < 5; i++) {
        const x = 2 * Math.cos(2 / 5 * Math.PI * i);
        const y = 2 * Math.sin(2 / 5 * Math.PI * i);
        basicVertex(x, y, phi + 1);
        basicVertex(-x, -y, -(phi + 1));
        basicVertex(phi * x, phi * y, phi - 1);
        basicVertex(-phi * x, -phi * y, -(phi - 1));
    }
}

main.geometry = tetrahedron;

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
}).add({
    type: 'selection',
    params: main,
    property: 'polyhedron',
    options: {
        regular: regularPolyhedron,
        rectified: rectifiedPolyhedron,
        truncated: truncatedPolyhedron
    },
    onChange: function() {
        create();
        draw();
    }
});

// square of distance between two points a and b (arrays of [x,y,z])
function d2Between(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    return dx * dx + dy * dy + dz * dz;
}

// minimum sqaure distance between points in an array
function minD2(points) {
    const length = points.length;
    let result = 1e10;
    for (let i = 0; i < length - 1; i++) {
        for (let j = i + 1; j < length; j++) {
            result = Math.min(result, d2Between(points[i], points[j]));
        }
    }
    return result;
}

// create lines of given square length
// between points of an array
// return an array of endpoints a-b
function makeLines(d2, points) {
    const eps = 0.01;
    const length = points.length;
    let result = [];
    for (let i = 0; i < length - 1; i++) {
        for (let j = i + 1; j < length; j++) {
            if (Math.abs(d2 - d2Between(points[i], points[j])) < eps) {
                result.push(points[i]);
                result.push(points[j]);
            }
        }
    }
    return result;
}

// make midpoints of edges -> rectfied solid
function midpoints(lines) {
    const points = [];
    const length = lines.length;
    for (let i = 0; i < length; i += 2) {
        const a = lines[i];
        const b = lines[i + 1];
        points.push([0.5 * (a[0] + b[0]), 0.5 * (a[1] + b[1]), 0.5 * (a[2] + b[2])]);
    }
    return points;
}

// interpolate at both end -> truncated solid
function interpolate(lines) {
    const points = [];
    const x = truncationFactor;
    const length = lines.length;
    for (let i = 0; i < length; i += 2) {
        const a = lines[i];
        const b = lines[i + 1];
        points.push([x * a[0] + (1 - x) * b[0], x * a[1] + (1 - x) * b[1], x * a[2] + (1 - x) * b[2]]);
        points.push([x * b[0] + (1 - x) * a[0], x * b[1] + (1 - x) * a[1], x * b[2] + (1 - x) * a[2]]);
    }
    return points;
}

function regularPolyhedron() {
    const d2 = minD2(basicVertices);
    polyhedronEdges = makeLines(d2, basicVertices);
}

function rectifiedPolyhedron() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    const rectifiedVertices = midpoints(regularEdges);
    d2 = minD2(basicVertices);
    polyhedronEdges = makeLines(d2, rectifiedVertices);
}

function truncatedPolyhedron() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    const truncatedVertices = interpolate(regularEdges);
    d2 = minD2(truncatedVertices);
    polyhedronEdges = makeLines(d2, truncatedVertices);
}

function create() {
    basicVertices.length = 0;
    main.geometry();
    main.polyhedron();

    console.log(polyhedronEdges);
    console.log(midpoints(polyhedronEdges));


}

function makeSCAD() {
    Circle.SCADtext = 'imageCircles=[';
    Circle.first = true;
    const mapLength = mappingCircles.length;
    for (let i = 0; i < mapLength; i++) {
        const images = mappingCircles[i].images;
        for (let gen = 0; gen < main.generations; gen++) {
            images[gen].forEach(image => image.writeSCAD());
        }
    }
    Circle.SCADtext += '\n];\n';
    Circle.SCADtext += 'mappingCircles=[';
    Circle.first = true;
    mappingCircles.forEach(circle => circle.writeSCAD());
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
    SVG.createGroup(SVG.attributes);


    SVG.terminate();
}

SVG.draw = draw;
create();
draw();