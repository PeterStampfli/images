/* jshint esversion: 6 */

/*
the html page calls this module
it sets up everthing, injecting code into the main object
and calls main.setup
*/

// tiling see rhombsSquare.js

import {
    map,
    output,
    BooleanButton
} from "../libgui/modules.js";

import {
    main,
    Lines,
    Areas,
    tiles
}
from "./modules.js";

const tiling = {};
tiling.maxGen = 0;
tiling.initial = 'triangle A';
// tiling
// triangle A has undetermined triangles, not that functions get hoisted
tiling.freeTriangleA = triangleB;
// triangle B has undetermined triangles
tiling.freeTriangleB = triangleB;

const rhombAreas = new Areas({
    color: '#ff0000'
});
// actually quarter squares
const squareAreas = new Areas({
    color: '#00ff00'
});
const triangleAAreas = new Areas({
    color: '#999999'
});
const triangleBAreas = new Areas({
    color: '#ffff00'
});
const triangleCAreas = new Areas({
    color: '#0000ff'
});

/**
 * setting up the tiling user interface
 * @method main.setupTilingUI
 */
main.setupTilingUI = function() {
    const gui = main.gui;
    const linesGui = gui.addFolder('lines and markers');
    tiles.makeUI(true, true, true, linesGui);
    const tilesGui = gui.addFolder('tiles');
    rhombAreas.makeUI('rhomb', tilesGui);
    squareAreas.makeUI('square', tilesGui);
    triangleAAreas.makeUI('triangleA', tilesGui);
    triangleBAreas.makeUI('triangleB', tilesGui);
    triangleCAreas.makeUI('triangleC', tilesGui);
    BooleanButton.whiteBackground();
    const mapsGui = gui.addFolder('mappings');
    tiling.rhombUpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'rhombUpperImage',
        labelText: 'rhomb',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });
    tiling.squareUpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'squareUpperImage',
        labelText: 'square',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });
    tiling.triangleUpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'triangleUpperImage',
        labelText: 'triangle',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });

    gui.addParagraph('<strong>substitution at 60 degree corner of triangles</strong>');

    const freeTriangleAController = gui.add({
        type: 'selection',
        params: tiling,
        property: 'freeTriangleA',
        labelText: 'triangle A',
        options: {
            //  undefined: triangleX,
            'triangle A': triangleA,
            'triangle B': triangleB,
            'triangle C': triangleC
        },
        onChange: function() {
            main.drawMapChanged();
        }
    });

    const freeTriangleBController = gui.add({
        type: 'selection',
        params: tiling,
        property: 'freeTriangleB',
        labelText: 'triangle B',
        options: {
            //   undefined: triangleX,
            'triangle A': triangleA,
            'triangle B': triangleB,
            'triangle C': triangleC
        },
        onChange: function() {
            main.drawMapChanged();
        }
    });

    gui.addParagraph('<strong>tiling</strong>');
    gui.add({
        type: 'selection',
        params: tiling,
        property: 'initial',
        options: {
            'small square': 'small square',
            'rhomb': 'rhomb',
            'triangle A': 'triangle A',
            'triangle B': 'triangle B',
            'triangle C': 'triangle C',
            'big square': 'big square',
            'equal sided triangle': 'equal sided triangle',
            'dodecagon': 'dodecagon'
        },
        onChange: function() {
            main.drawMapChanged();
        }
    });
    gui.add({
        type: 'number',
        params: tiling,
        property: 'maxGen',
        labelText: 'iterations',
        min: 0,
        step: 1,
        onChange: function() {
            main.drawMapChanged();
        }
    });
};

main.setup();
// switching to showing the tiling
map.whatToShowController.setValueOnly("tiling");


/**
 * making the tiling
 * @method main.makeTiling
 */
main.makeTiling = function() {
    // first clear things
    rhombAreas.clear();
    squareAreas.clear();
    triangleAAreas.clear();
    triangleBAreas.clear();
    triangleCAreas.clear();
    tiles.clear();
    tile();
};

/**
 * drawing the tiling
 * @method main.drawTiling
 */
main.drawTiling = function() {
    Lines.initDrawing();
    rhombAreas.draw();
    squareAreas.draw();
    triangleAAreas.draw();
    triangleBAreas.draw();
    triangleCAreas.draw();
};

// tiles of the tiling
//--------------------
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// actually the minimum square, center of full square at (blX,blY), (trX,trY) is opposite corner
function square(gen, blX, blY, trX, trY) {
    // make center and missing corners
    let cX = 0.5 * (blX + trX);
    let cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.quarterSquare(true, tiling.squareUpperImage, tlX, tlY, trX, trY, brX, brY, blX, blY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.732050808 = 2 / (1 + rt3);
            const upX = 0.732050808 * (tlX - blX);
            const upY = 0.732050808 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            cX = brX + 0.5 * (upX - rightX);
            cY = brY + 0.5 * (upY - rightY);
            square(gen, brX, brY, cX, cY);
            triangleB(gen, brX + 0.5 * upX, brY + 0.5 * upY, cX, cY, trX, trY);
            triangleB(gen, brX - 0.5 * rightX, brY - 0.5 * rightY, cX, cY, blX, blY);
            cX = tlX - 0.5 * (upX - rightX);
            cY = tlY - 0.5 * (upY - rightY);
            square(gen, tlX, tlY, cX, cY);
            triangleB(gen, tlX + 0.5 * rightX, tlY + 0.5 * rightY, cX, cY, trX, trY);
            triangleB(gen, tlX - 0.5 * upX, tlY - 0.5 * upY, cX, cY, blX, blY);
            rhomb(gen, blX, blY, trX, trY);
        }
    }
}

// the rhomb, coordinates of the corners with acute angles
function rhomb(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.378937382=tan(Math.PI/12)*sqrt(2);
    const upX = 0.378937382 * (cX - bX);
    const upY = 0.378937382 * (cY - bY);
    const rightX = upY;
    const rightY = -upX;
    const rX = cX + 0.7071 * rightX;
    const rY = cY + 0.7071 * rightY;
    const lX = cX - 0.7071 * rightX;
    const lY = cY - 0.7071 * rightY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            rhombAreas.add(bX, bY, rX, rY, tX, tY, lX, lY);
            tiles.rhomb30(false, tiling.rhombUpperImage, bX, bY, rX, rY, tX, tY, lX, lY);
        } else {
            gen += 1;
            const bcX = cX - 0.7071 * upX;
            const bcY = cY - 0.7071 * upY;
            const tcX = cX + 0.7071 * upX;
            const tcY = cY + 0.7071 * upY;
            rhomb(gen, bX, bY, bcX, bcY);
            rhomb(gen, tX, tY, tcX, tcY);
            square(gen, cX, cY, lX, lY);
            square(gen, cX, cY, rX, rY);
            square(gen, cX, cY, bcX, bcY);
            square(gen, cX, cY, tcX, tcY);
            // sqrt(0.5)-sqrt(3)/2*cos(75)=0.48296
            // sqrt(3)/2*sin(75)=0.83652
            let x = cX + 0.48296 * rightX + 0.83652 * upX;
            let y = cY + 0.48296 * rightY + 0.83652 * upY;
            // sqrt(0.5)-sqrt(3)*cos(75)=0.25881
            // sqrt(3)*sin(75)=1.67303
            triangleA(gen, x, y, tcX, tcY, rX, rY);
            triangleC(gen, x, y, tcX, tcY, cX + 0.25881 * rightX + 1.67303 * upX, cY + 0.25881 * rightY + 1.67303 * upY);
            x = cX - 0.48296 * rightX + 0.83652 * upX;
            y = cY - 0.48296 * rightY + 0.83652 * upY;
            triangleA(gen, x, y, tcX, tcY, lX, lY);
            triangleC(gen, x, y, tcX, tcY, cX - 0.25881 * rightX + 1.67303 * upX, cY - 0.25881 * rightY + 1.67303 * upY);
            x = cX + 0.48296 * rightX - 0.83652 * upX;
            y = cY + 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, rX, rY);
            triangleC(gen, x, y, bcX, bcY, cX + 0.25881 * rightX - 1.67303 * upX, cY + 0.25881 * rightY - 1.67303 * upY);
            x = cX - 0.48296 * rightX - 0.83652 * upX;
            y = cY - 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, lX, lY);
            triangleC(gen, x, y, bcX, bcY, cX - 0.25881 * rightX - 1.67303 * upX, cY - 0.25881 * rightY - 1.67303 * upY);
        }
    }
}

function triangleA(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            tiles.halfTriangle(false, tiling.triangleUpperImage, mX, mY, bX, bY, cX, cY);
            triangleAAreas.add(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
            const bcX = 0.5 * (bX + cX);
            const bcY = 0.5 * (bY + cY);
            const mcX = cX - upX;
            const mcY = cY - upY;
            square(gen, mX, mY, cenX, cenY);
            triangleA(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            square(gen, bcX, bcY, cenX, cenY);
            square(gen, bcX, bcY, mcX, mcY);
            // 0.433012=sqrt(3)/4
            triangleB(gen, cX + 0.433012 * rightX - 0.75 * upX, cY + 0.433012 * rightY - 0.75 * upY, mcX, mcY, cX, cY);
            // free triangles
            tiling.freeTriangleA(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            tiling.freeTriangleA(gen, bX - 0.433012 * rightX + 0.75 * upX, bY - 0.433012 * rightY + 0.75 * upY, cenX, cenY, bX, bY);
        }
    }
}

function triangleB(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            tiles.halfTriangle(false, tiling.triangleUpperImage, mX, mY, bX, bY, cX, cY);
            triangleBAreas.add(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
        const bcX = bX - 0.433012 * rightX + 0.75 * upX;
        const bcY = bY - 0.433012 * rightY + 0.75 * upY;
            const mcX = cX - upX;
            const mcY = cY - upY;
            square(gen, mX, mY, cenX, cenY);
            rhomb(gen, cX, cY, cenX, cenY);
            triangleC(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            triangleC(gen, bcX, bcY, cenX, cenY, cenX + upX, cenY + upY);
            // free triangles
            tiling.freeTriangleB(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            tiling.freeTriangleB(gen, bcX, bcY, cenX, cenY, bX, bY);
        }
    }
}

function triangleC(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            tiles.halfTriangle(false, tiling.triangleUpperImage, mX, mY, bX, bY, cX, cY);
            triangleCAreas.add(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
        const bcX = cX + 0.433012 * rightX - 0.75 * upX;
        const bcY = cY + 0.433012 * rightY - 0.75 * upY;
            const mcX = cX - upX;
            const mcY = cY - upY;
            square(gen, mX, mY, cenX, cenY);
            rhomb(gen, bX, bY, mcX, mcY);
            triangleB(gen, bcX, bcY, mcX, mcY, cX, cY);
            triangleC(gen, bcX, bcY, mcX, mcY, cX + rt32 * rightX - 1.5 * upX, cY + rt32 * rightY - 1.5 * upY);
            triangleB(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            triangleB(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
        }
    }
}

// make the tiling for various initial patterns

const size = 0.5;

const basicX = [];
basicX.length = 15;

const basicY = [];
basicY.length = 15;

const secondX = [];
const secondY = [];
secondX.length = 14;
secondY.length = 14;


function tile() {
    let s = size * Math.pow(2 + Math.sqrt(3), tiling.maxGen);
    for (let i = 0; i < 15; i++) {
        basicX[i] = Math.cos(Math.PI * i / 6) * s;
        basicY[i] = Math.sin(Math.PI * i / 6) * s;
    }
    for (let i = 0; i < 14; i++) {
        secondX[i] = basicX[i] + basicX[i + 1];
        secondY[i] = basicY[i] + basicY[i + 1];
    }
    const r = s / Math.sqrt(3);
    const z = s * Math.cos(Math.PI / 12);
    const w = s * Math.sin(Math.PI / 12);
    switch (tiling.initial) {
        case 'small square':
            square(0, -s / 4, -s / 4, s / 4, s / 4);
            tiles.outlines.addClosed(-s / 4, -s / 4, -s / 4, s / 4, s / 4, s / 4, s / 4, -s / 4);
            break;
        case 'rhomb':
            rhomb(0, -z, 0, z, 0);
            const h = Math.tan(Math.PI / 12) * z;
            tiles.outlines.addClosed(-z, 0, 0, h, z, 0, 0, -h);
            break;
        case 'triangle A':
            triangleA(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(0, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'triangle B':
            triangleB(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(0, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'triangle C':
            triangleC(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(0, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'equal sided triangle':
            triangleA(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            triangleA(0, 0, -r / 2, -rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(-rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'big square':
            square(0, 0, 0, s / 2, s / 2);
            square(0, 0, 0, s / 2, -s / 2);
            square(0, 0, 0, -s / 2, s / 2);
            square(0, 0, 0, -s / 2, -s / 2);
            tiles.outlines.addClosed(-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2, s / 2, -s / 2);
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb(0, 0, 0, secondX[i], secondY[i]);
                const mX = 0.5 * (secondX[i] + secondX[i + 1]);
                const mY = 0.5 * (secondY[i] + secondY[i + 1]);
                triangleC(0, mX, mY, secondX[i], secondY[i], basicX[i + 1], basicY[i + 1]);
                triangleC(0, mX, mY, secondX[i + 1], secondY[i + 1], basicX[i + 1], basicY[i + 1]);
                tiles.outlines.addOpen(secondX[i + 1], secondY[i + 1], secondX[i], secondY[i]);
            }
            break;
    }
}





main.drawMapChanged();