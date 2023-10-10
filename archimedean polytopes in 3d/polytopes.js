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
var polytopeVertices = [];
var polytopeEdges = [];
var truncationFactor;
// rotate direction to north pole, for stereographic projection
var northpole = [0, 0, 0, 1];

function basicVertex(x, y, z, w) {
    // rotation, to move the northpole vector to [0,0,0,1]
    const eps = 0.01;
    const nx = northpole[0];
    const ny = northpole[1];
    const nz = northpole[2];
    const nw = northpole[3];
    const nxy = Math.sqrt(nx * nx + ny * ny);
    if (Math.abs(nx) > eps) {
        // rotation in xy to make nx=0
        const h = (x * ny - y * nx) / nxy;
        y = (x * nx + y * ny) / nxy;
        x = h;
    }
    // northpole now at [0,nxy,nz,nw]
    const nxyz = Math.sqrt(nxy * nxy + nz * nz);
    if (Math.abs(nxy) > eps) {
        const h = (y * nz - z * nxy) / nxyz;
        z = (y * nxy + z * nz) / nxyz;
        y = h;
    }
    // northpole at [0,0,nxyz,nw]
    const nxyzw = Math.sqrt(nxyz * nxyz + nw * nw);
    if (Math.abs(nxyz) > eps) {
        const h = (z * nw - w * nxyz) / nxyzw;
        w = (z * nxyz + w * nw) / nxyzw;
        z = h;
    }
    // nortpole now at [0,0,0,nxyzw]
    // normalization to the unit sphere, scaling later after stereographic projection
    let factor = 1 / Math.sqrt(x * x + y * y + z * z + w * w);
    factor=1;
    const vertex = [factor * x, factor * y, factor * z, factor * w];
    console.log(basicVertices.length,factor,x,y,z,w);
        basicVertices.push(vertex);

}

function symplex() {
    basicVertices.length = 0;
    truncationFactor = 0.33333;
    northpole = [0, 0, 0, 1];
    basicVertex(0, 0, 0, -1);
    const r3 = Math.sqrt(15 / 16);
    basicVertex(0, 0, -r3, 0.25);
    const r2 = r3 * Math.sqrt(8 / 9);
    basicVertex(0, -r2, r3 / 3, 0.25);
    const r1 = r2 * Math.sqrt(3 / 4);
    basicVertex(-r1, r2 / 2, r3 / 3, 0.25);
    basicVertex(r1, r2 / 2, r3 / 3, 0.25);
}

function basicCube(s) {
    basicVertex(s, s, s, s);
    basicVertex(s, s, s, -s);
    basicVertex(s, s, -s, s);
    basicVertex(s, s, -s, -s);
    basicVertex(s, -s, s, s);
    basicVertex(s, -s, s, -s);
    basicVertex(s, -s, -s, s);
    basicVertex(s, -s, -s, -s);
    basicVertex(-s, s, s, s);
    basicVertex(-s, s, s, -s);
    basicVertex(-s, s, -s, s);
    basicVertex(-s, s, -s, -s);
    basicVertex(-s, -s, s, s);
    basicVertex(-s, -s, s, -s);
    basicVertex(-s, -s, -s, s);
    basicVertex(-s, -s, -s, -s);
}

function cube() {
    truncationFactor = 0.2929;
    northpole = [0, 0, 0, 1];
    basicCube(1);
}

function basicCross() {
    basicVertex(1, 0, 0, 0);
    basicVertex(-1, 0, 0, 0);
    basicVertex(0, 1, 0, 0);
    basicVertex(0, -1, 0, 0);
    basicVertex(0, 0, 1, 0);
    basicVertex(0, 0, -1, 0);
    basicVertex(0, 0, 0, 1);
    basicVertex(0, 0, 0, -1);
}

function cross() {
    truncationFactor = 0.3333;
    northpole = [1, 1, 1, 1];
    basicCross();
}

function the24Cell() {
    truncationFactor = 0.3333;
    northpole = [1, 1, 1, 1];
    basicVertex(1, 1, 0, 0);
    basicVertex(1, -1, 0, 0);
    basicVertex(-1, 1, 0, 0);
    basicVertex(-1, -1, 0, 0);
    basicVertex(1, 0, 1, 0);
    basicVertex(1, 0, -1, 0);
    basicVertex(-1, 0, 1, 0);
    basicVertex(-1, 0, -1, 0);
    basicVertex(1, 0, 0, 1);
    basicVertex(1, 0, 0, -1);
    basicVertex(-1, 0, 0, 1);
    basicVertex(-1, 0, 0, -1);
    basicVertex(0, 1, 1, 0);
    basicVertex(0, 1, -1, 0);
    basicVertex(0, -1, 1, 0);
    basicVertex(0, -1, -1, 0);
    basicVertex(0, 1, 0, 1);
    basicVertex(0, 1, 0, -1);
    basicVertex(0, -1, 0, 1);
    basicVertex(0, -1, 0, -1);
    basicVertex(0, 0, 1, 1);
    basicVertex(0, 0, 1, -1);
    basicVertex(0, 0, -1, 1);
    basicVertex(0, 0, -1, -1);
}

function even3(a,b,c,d){
     basicVertex(a, b, c, d);
    basicVertex(a, c, d, b);
    basicVertex(a, d, b, c);
}

function evenPermutation(a, b, c, d) {
    even3(a, b, c, d);
    even3(b,a,d,c);
    even3(c,d,a,b);
    even3(d,c,b,a);
}

function the600Cell() {
    basicVertices.length = 0;
    const phi = 1.618;
    const iPhi = phi - 1;
    truncationFactor = 0.33333;
    northpole = [0, 1 / 3, 0, (1 + phi) / 3];
    northpole = [0, 0,0,1];
  //  basicCross();
  //  basicCube(0.5);
    evenPermutation(0, 0.5, iPhi / 2, phi / 2);
  //  evenPermutation(0, 0.5, iPhi / 2, -phi / 2);
  //  evenPermutation(0, 0.5, -iPhi / 2, phi / 2);
  //  evenPermutation(0, 0.5, -iPhi / 2, -phi / 2);
  //  evenPermutation(0, -0.5, iPhi / 2, phi / 2);
  //  evenPermutation(0, -0.5, iPhi / 2, -phi / 2);
  //  evenPermutation(0, -0.5, -iPhi / 2, phi / 2);
   // evenPermutation(0, -0.5, -iPhi / 2, -phi / 2);
   console.log(basicVertices);
}

main.geometry = symplex;
main.geometry = the600Cell;
main.polytope = regularPolytope;

gui.add({
    type: 'selection',
    params: main,
    property: 'geometry',
    options: {
        symplex: symplex,
        cross: cross,
        cube: cube,
        '24 cell': the24Cell,
        '600 cell':the600Cell
    },
    onChange: createDraw
}).add({
    type: 'selection',
    params: main,
    property: 'polytope',
    options: {
        regular: regularPolytope,
        rectified: rectifiedPolytope,
        truncated: truncatedPolytope
    },
    onChange: createDraw
});

// square of distance between two points a and b (arrays of [x,y,z])
function d2Between(a, b) {
    const min2=0.617*0.617;
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    const dw = a[3] - b[3];
    const d2=dx * dx + dy * dy + dz * dz + dw * dw;
    if (d2<min2){
        console.log(dx,dy,dz,dw,Math.sqrt(d2));
        console.log(a[0],a[1],a[2],a[3]);
        console.log(b[0],b[1],b[2],b[3]);
    }
    return dx * dx + dy * dy + dz * dz + dw * dw;
}

// minimum sqaure distance between points in an array
function minD2(points) {
    const length = points.length;
    const min2=0.617*0.617;
    let result = 1e10;
    for (let i = 0; i < length - 1; i++) {
        for (let j = i + 1; j < length; j++) {
            if (min2>d2Between(points[i], points[j])){
            console.log(i,j,Math.sqrt(d2Between(points[i], points[j])));
        }
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
    const w = t * b[3] + (1 - t) * a[3];
    return [x, y, z, w];
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

// stereographic projection of array of points/lines
// normaliize the points
function stereographic(points) {
    const length = points.length;
    const r2 = 2;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        let x = point[0];
        let y = point[1];
        let z = point[2];
        let w = point[3];
        let factor = 1 / Math.sqrt(x * x + y * y + z * z + w * w);
        x *= factor;
        y *= factor;
        z *= factor;
        w *= factor;
        const dw = w - 1;
        factor = r2 / (x * x + y * y + z * z + dw * dw);
        point[0] = factor * x;
        point[1] = factor * y;
        point[2] = factor * z;
        point[3] = 1 + factor * dw;
    }
}

function logbv(n){
    const p=basicVertices[n];
    console.log(n,'-',p[0],p[1],p[2],p[3]);
}

function regularPolytope() {
    console.log('regular');
     logbv(3);
    logbv(8);
    const d2 = minD2(basicVertices);
    console.log('bv')
    logbv(3);
    logbv(8);
    polytopeVertices = basicVertices;
    polytopeEdges = makeLines(d2, basicVertices);
}

function rectifiedPolytope() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    polytopeVertices = midpoints(regularEdges);
    d2 = minD2(polytopeVertices);
    polytopeEdges = makeLines(d2, polytopeVertices);
}

function truncatedPolytope() {
    let d2 = minD2(basicVertices);
    const regularEdges = makeLines(d2, basicVertices);
    polytopeVertices = truncate(regularEdges);
    d2 = minD2(polytopeVertices);
    polytopeEdges = makeLines(d2, polytopeVertices);
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
        // inflate
        point[0] = main.size * x;
        point[1] = main.size * y;
        point[2] = main.size * z;
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
    main.polytope();
//   stereographic(polytopeVertices);
 //   rotate(polytopeVertices);

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
    drawLines(polytopeEdges);
    SVG.terminate();
}

function prec(x) {
    return x.toPrecision(4);
}

function makeSCAD() {
    SCADtext = 'lines=[';
    let length = polytopeEdges.length;
    for (let i = 0; i < length; i += 2) {
        const a = polytopeEdges[i];
        const b = polytopeEdges[i + 1];
        SCADtext += '[' + prec(a[0]) + ',' + prec(a[1]) + ',' + prec(a[2]) + '],';
        SCADtext += '[' + prec(b[0]) + ',' + prec(b[1]) + ',' + prec(b[2]) + ']';
        if (i < length - 2) {
            SCADtext += ',\n';
        }
    }
    SCADtext += '\n];\n';
    SCADtext += 'points=[';
    length = polytopeVertices.length;
    for (let i = 0; i < length; i++) {
        const a = polytopeVertices[i];
        SCADtext += '[' + prec(a[0]) + ',' + prec(a[1]) + ',' + prec(a[2]) + ']';
        if (i < length - 1) {
            SCADtext += ',\n';
        }
    }
    SCADtext += '\n];';
}

SVG.draw = createDraw;
createDraw();
