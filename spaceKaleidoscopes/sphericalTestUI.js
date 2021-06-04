/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels,
    BooleanButton,
    Logger
} from "../libgui/modules.js";

export const controllers = {};

Logger.spacing = 2;

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'spheres',
    closed: false
});

const geometry = {};
// dihedral groups and mirrors
geometry.d12 = 5;
geometry.d13 = 3;
geometry.d23 = 2;
geometry.d14 = 2;
geometry.d24 = 2;
geometry.d34 = 3;

// the dihedrals
const dihedralControl = {
    type: 'number',
    params: geometry,
    min: 2,
    step: 1,
    onChange: function() {
        check();
    }
};

gui.addParagraph('<strong>basic three mirrors</strong>');

controllers.d12 = gui.add(dihedralControl, {
    property: 'd12',
    labelText: 'order of 1-2'
});
controllers.d13 = controllers.d12.add(dihedralControl, {
    property: 'd13',
    labelText: '1-3'
});
controllers.d23 = controllers.d13.add(dihedralControl, {
    property: 'd23',
    labelText: '2-3'
});
gui.addParagraph('<strong>fourth mirror</strong>');


controllers.d14 = gui.add(dihedralControl, {
    property: 'd14',
    labelText: 'order of 1-4'
});
controllers.d24 = controllers.d14.add(dihedralControl, {
    property: 'd24',
    labelText: '2-4'
});
controllers.d34 = controllers.d24.add(dihedralControl, {
    property: 'd34',
    labelText: '3-4'
});

const logger = new ParamGui({
    name: "log",
    width: "700",
    horizontalShift: 500,
    verticalPosition: "top",
    closed: false
}).addLogger();
logger.container.style.height = "";

function log(message) {
    if (arguments.length === 0) {
        logger.clear();
    } else {
        logger.log(message);
    }
}
// constants
const eps = 0.001;
const eps2 = eps * eps;
const pi = Math.PI;
const toDeg = 180 / pi;
const fromDeg = 1 / toDeg;
// abreviations for functions
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const round = Math.round;
const sqrt = Math.sqrt;
const abs = Math.abs;
var nMaterialVertices, nIdealVertices, nHyperIdealVertices;
var geometryType;
// mirror planes, n1x=1, trivial
var n2x, n2y, n3x, n3y, n3z;

var n3x, n4x, n4y, n4z, n4w;

function triangle(n1, n2, n3, d12, d13, d23) {
    const sum = round(180 / d12 + 180 / d13 + 180 / d23);
    let message = 'mirrors ' + n1 + ', ' + n2 + ' and ' + n3 + ': ';
    message += 'd<sub>' + d12 + '</sub>, d<sub>' + d13 + '</sub> and d<sub>' + d23 + '</sub>, ';
    if (sum === 180) {
        message += 'euklidic';
        nIdealVertices += 1;
    } else if (sum < 180) {
        message += 'hyperbolic';
        nHyperIdealVertices += 1;
    } else {
        message += 'spherical';
        nMaterialVertices += 1;
    }
    log(message);
}


function check() {
    log();
    log(geometry.d12 + ' ' + geometry.d13 + ' ' + geometry.d23);
    log(geometry.d14 + ' ' + geometry.d24 + ' ' + geometry.d34);
    nIdealVertices = 0;
    nMaterialVertices = 0;
    nHyperIdealVertices = 0;
    const d12 = geometry.d12;
    const d13 = geometry.d13;
    const d23 = geometry.d23;
    const angle12 = pi / d12;
    const angle13 = pi / d13;
    const angle23 = pi / d23;
    const d14 = geometry.d14;
    const d24 = geometry.d24;
    const d34 = geometry.d34;
    triangle(1, 2, 3, d12, d13, d23);
    triangle(1, 2, 4, d12, d14, d24);
    triangle(1, 3, 4, d13, d14, d34);
    triangle(2, 3, 4, d23, d24, d34);
    if (nMaterialVertices === 1) {
        log('1 material vertex');
    }
    if (nMaterialVertices > 1) {
        log(nMaterialVertices + ' material vertices');
    }
    if (nIdealVertices === 1) {
        log('1 ideal vertex');
    }
    if (nIdealVertices > 1) {
        log(nIdealVertices + ' ideal vertices');
    }
    if (nHyperIdealVertices === 1) {
        log('1 hyperideal vertex');
    }
    if (nHyperIdealVertices > 1) {
        log(nHyperIdealVertices + ' hyperideal vertices');
    }
    const angle14 = pi / d14;
    const angle24 = pi / d24;
    const angle34 = pi / d34;
    //setting up the first three mirror planes, normal vectors in 3d, unit length
    // n1=(1,0,0)
    // n2=(n2x,n2y,0)
    // intersection angle of planes: n2*n1=-cos(angle12)
    n2x = -cos(angle12);
    // normalize
    n2y = sqrt(1 - n2x * n2x);
    log('n1: 1,0,...');
    log('n2: ' + n2x.toPrecision(3) + ', ' + n2y.toPrecision(3));
    // intersection angle of planes: n3*n1=-cos(angle13)
    n3x = -cos(angle13);
    // intersection angle of planes: n3*n2=-cos(angle23)
    n3y = (-cos(angle23) - n3x * n2x) / n2y;
    // normalize
    let n3z2 = 1 - n3x * n3x - n3y * n3y;
    log('n3 z-component square ' + n3z2.toPrecision(3));
    if (n3z2 < 0.0001) {
        log("NOT spherical");
        return;
    }
    n3z = sqrt(1 - n3x * n3x - n3y * n3y);
    log('n3: ' + n3x.toPrecision(3) + ', ' + n3y.toPrecision(3) + ', ' + n3z.toPrecision(3));
    // intersection angle of planes: n4*n1=-cos(angle14)
    n4x = -cos(angle14);
    // intersection angle of planes: n4*n2=-cos(angle24)
    n4y = (-cos(angle24) - n4x * n2x) / n2y;
    // intersection angle of planes: n4*n3=-cos(angle34)
    n4z = (-cos(angle34) - n4x * n3x - n4y * n3y) / n3z;
    let n4w2 = 1 - n4x * n4x - n4y * n4y - n4z * n4z;
    log('n4 w-component square ' + n4w2.toPrecision(3));
    if (n4w2 < 0.0001) {
        log("NOT spherical");
        return;
    }
    n4w = sqrt(n4w2);
    log('n4: ' + n4x.toPrecision(3) + ', ' + n4y.toPrecision(3) + ', ' + n4z.toPrecision(3) + ', ' + n4w.toPrecision(3));
    log('d23 cosines: ' + cos(angle23).toPrecision(3) + ', ' + (n3x * n2x + n3y * n2y).toPrecision(3));
    log('d24 cosines: ' + cos(angle24).toPrecision(3) + ', ' + (n4x * n2x + n4y * n2y).toPrecision(3));
    log('d34 cosines: ' + cos(angle34).toPrecision(3) + ', ' + (n4x * n3x + n4y * n3y + n4z * n3z).toPrecision(3));
}

check();