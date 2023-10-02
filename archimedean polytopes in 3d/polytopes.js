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
main.polytope = regularPolytope;

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

// rotation angles in 3d
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
var polytopeEdges = [];
var truncationFactor;

function basicVertex(x, y, z,w) {
    // normalize to hypersphere of given size
    console.log(x,y,z,w);
    console.log(x * x + y * y + z * z+w*w);
    const factor = main.size / Math.sqrt(x * x + y * y + z * z+w*w);
    basicVertices.push([factor * x, factor * y, factor * z,factor*w]);
}

// hypertetrahedron, 4 symplex
function symplex(){
    basicVertex(0,0,0,-1);
    const r3=Math.sqrt(15/16);
    basicVertex(0,0,-r3,0.25);
    const r2=r3*Math.sqrt(8/9);
    basicVertex(0,-r2,r3/3,0.25);
    const r1=r2*Math.sqrt(3/4);
    basicVertex(-r1,r2/2,r3/3,0.25);
    basicVertex(r1,r2/2,r3/3,0.25);
}

main.geometry = symplex;

/*
gui.add({
    type: 'selection',
    params: main,
    property: 'geometry',
    options: {
        symplex: symplex,
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
        regular: regularPolytope,
        rectified: rectifiedPolytope,
        truncated: truncatedPolytope
    },
    onChange: createDraw
});
*/

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

function regularPolytope() {
    const d2 = minD2(basicVertices);
    polyhedronEdges = makeLines(d2, basicVertices);
}

function rectifiedPolytope() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    const rectifiedVertices = midpoints(regularEdges);
    d2 = minD2(rectifiedVertices);
    polyhedronEdges = makeLines(d2, rectifiedVertices);
}

function truncatedPolytope() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    const truncatedVertices = truncate(regularEdges);
    d2 = minD2(truncatedVertices);
    polyhedronEdges = makeLines(d2, truncatedVertices);
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

    /*
    main.polyhedron();

    console.log(polyhedronEdges);
    console.log(midpoints(polyhedronEdges));

    rotate(polyhedronEdges);

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
    */
}


function prec(x) {
    return x.toPrecision(4);
}

function makeSCAD() {
    SCADtext = 'lines=[';

    const length = polyhedronEdges.length;
    for (let i = 0; i < length; i += 2) {
        const a = polyhedronEdges[i];
        const b = polyhedronEdges[i + 1];
        SCADtext += '[' + prec(a[0]) + ',' + prec(a[1]) + ',' + prec(a[2]) + '],';
        SCADtext += '[' + prec(b[0]) + ',' + prec(b[1]) + ',' + prec(b[2]) + ']';
        if (i < length - 2) {
            SCADtext += ',\n';
        }
    }
    SCADtext += '\n]';
}

SVG.draw = createDraw;
createDraw();