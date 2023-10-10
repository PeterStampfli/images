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
var SCADtext;

const saveSCADButton = gui.add({
    type: "button",
    buttonText: "save openSCAD",
    minLabelWidth: 20,
    onClick: function() {
        makeSCAD();
        guiUtils.saveTextAsFile(SCADtext, SCADsaveName.getValue(), 'scad');
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
    onChange: createDraw
});

gui.add({
    type: 'color',
    params: main,
    property: 'imageColor',
    labelText: 'line',
    onChange: createDraw
}).add({
    type: 'number',
    params: main,
    min: 0,
    property: 'lineWidth',
    labelText: 'width',
    onChange: createDraw
});

// rotation angles
main.beta = 0;
main.gamma = 0;
main.alpha = 0;

// rotating final points (endpoints of lines, make this a function)
// 3d rotation
// rotation in x,y then x,z then x,y
gui.add({
    type: 'number',
    params: main,
    property: 'beta',
    onChange: createDraw
}).add({
    type: 'number',
    params: main,
    property: 'gamma',
    onChange: createDraw
}).add({
    type: 'number',
    params: main,
    property: 'alpha',
    onChange: createDraw
});

var basicVertices = [];
var polyhedronVertices=[];
var polyhedronEdges = [];
var truncationFactor;

function basicVertex(x, y, z) {
    // normalize to sphere of given size
    const factor = main.size / Math.sqrt(x * x + y * y + z * z);
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
    onChange: createDraw
}).add({
    type: 'selection',
    params: main,
    property: 'polyhedron',
    options: {
        regular: regularPolyhedron,
        rectified: rectifiedPolyhedron,
        truncated: truncatedPolyhedron
    },
    onChange: createDraw
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
// use relative lengths
// between points of an array
// return an array of endpoints a-b
function makeLines(d2, points) {
    const eps = 0.01;
    const length = points.length;
    let result = [];
    for (let i = 0; i < length - 1; i++) {
        for (let j = i + 1; j < length; j++) {
            if (Math.abs(d2Between(points[i], points[j]) / d2 - 1) < eps) {
                result.push(points[i]);
                result.push(points[j]);
            }
        }
    }
    return result;
}

function interpolate(t, a, b) {
    const x = t * b[0] + (1 - t) * a[0];
    const y = t * b[1] + (1 - t) * a[1];
    const z = t * b[2] + (1 - t) * a[2];
    return [x, y, z];
}

// make midpoints of edges -> rectfied solid
function midpoints(lines) {
    const points = [];
    const length = lines.length;
    for (let i = 0; i < length; i += 2) {
        points.push(interpolate(0.5, lines[i], lines[i + 1]));
    }
    return points;
}

// interpolate at both end -> truncated solid
function truncate(lines) {
    const points = [];
    const length = lines.length;
    for (let i = 0; i < length; i += 2) {
        const a = lines[i];
        const b = lines[i + 1];
        points.push(interpolate(truncationFactor, a, b));
        points.push(interpolate(truncationFactor, b, a));
    }
    return points;
}

function regularPolyhedron() {
    const d2 = minD2(basicVertices);
    polyhedronVertices=basicVertices;
    polyhedronEdges = makeLines(d2, basicVertices);
}

function rectifiedPolyhedron() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    polyhedronVertices = midpoints(regularEdges);
    d2 = minD2(polyhedronVertices);
    polyhedronEdges = makeLines(d2, polyhedronVertices);
}

function truncatedPolyhedron() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    polyhedronVertices = truncate(regularEdges);
    d2 = minD2(polyhedronVertices);
    polyhedronEdges = makeLines(d2, polyhedronVertices);
}

// creation does not take much time, do all in one

// rotating the points of lines, or whatever

function rotate(points) {
    const cosAlpha = Math.cos(main.alpha);
    const sinAlpha = Math.sin(main.alpha);
    const cosBeta = Math.cos(main.beta);
    const sinBeta = Math.sin(main.beta);
    const cosGamma = Math.cos(main.gamma);
    const sinGamma = Math.sin(main.gamma);
    const length = points.length;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        let x = point[0];
        let y = point[1];
        let z = point[2];
        // rotate xy
        let h = cosBeta * x - sinBeta * y;
        y = sinBeta * x + cosBeta * y;
        x = h;
        //rotate xz
        h = cosGamma * x + sinGamma * z;
        z = -sinGamma * x + cosGamma * z;
        x = h;
        // rotate xy
        h = cosAlpha * x - sinAlpha * y;
        y = sinAlpha * x + cosAlpha * y;
        x = h;
        point[0] = x;
        point[1] = y;
        point[2] = z;
    }
}

function drawLines(lines) {
    const length = lines.length;
    for (let i = 0; i < length; i += 2) {
        const a = lines[i];
        const b = lines[i + 1];
        SVG.createPolyline([a[0], a[1], b[0], b[1]]);
    }
}

function createDraw() {
    basicVertices.length = 0;
    main.geometry();
    main.polyhedron();
    rotate(polyhedronVertices);

    SVG.begin();
    SVG.attributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        stroke: main.imageColor,
        'stroke-width': main.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };
    SVG.createGroup(SVG.attributes);
    drawLines(polyhedronEdges);
    SVG.terminate();
}


function prec(x) {
    return x.toPrecision(4);
}

function makeSCAD() {
    SCADtext = 'lines=[';
    let length = polyhedronEdges.length;
    for (let i = 0; i < length; i += 2) {
        const a = polyhedronEdges[i];
        const b = polyhedronEdges[i + 1];
        SCADtext += '[' + prec(a[0]) + ',' + prec(a[1]) + ',' + prec(a[2]) + '],';
        SCADtext += '[' + prec(b[0]) + ',' + prec(b[1]) + ',' + prec(b[2]) + ']';
        if (i < length - 2) {
            SCADtext += ',\n';
        }
    }
    SCADtext += '\n];\n';
    SCADtext += 'points=[';
     length = polyhedronVertices.length;
    for (let i = 0; i < length; i++) {
        const a = polyhedronVertices[i];
        SCADtext += '[' + prec(a[0]) + ',' + prec(a[1]) + ',' + prec(a[2]) + ']';
        if (i < length - 1) {
            SCADtext += ',\n';
        }
    }
    SCADtext += '\n];';
}

SVG.draw = createDraw;
createDraw();