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
tiling.maxGen = 1;
tiling.initial = 'rhomb60';

const rhomb30Areas = new Areas({
    color: '#ff0000'
});
const rhomb60Areas = new Areas({
    color: '#ffff00'
});
const squareAreas = new Areas({
    color: '#00ff00'
});
const triangleRAreas = new Areas({
    color: '#0000ff'
});
const triangleLAreas = new Areas({
    color: '#00ffff'
});

/**
 * setting up the tiling user interface
 * @method main.setupTilingUI
 */
main.setupTilingUI = function() {
    console.log('tiling.js setup UI');
    const gui = main.gui;
    const linesGui = gui.addFolder('lines and markers');
    tiles.makeUI(true, true, true, linesGui);
    const tilesGui = gui.addFolder('tiles');
    rhomb30Areas.makeUI('rhomb30', false, tilesGui);
    rhomb60Areas.makeUI('rhomb60', false, tilesGui);
    squareAreas.makeUI('square', false, tilesGui);
    triangleRAreas.makeUI('triangleR', false, tilesGui);
    triangleLAreas.makeUI('triangleL', false, tilesGui);
    BooleanButton.whiteBackground();
    const mapsGui = gui.addFolder('mappings');
    tiling.rhomb30UpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'rhomb30UpperImage',
        labelText: 'rhomb30',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });
    tiling.rhomb60UpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'rhomb60UpperImage',
        labelText: 'rhomb60',
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
    gui.addParagraph('<strong>tiling</strong>');
    gui.add({
        type: 'selection',
        params: tiling,
        property: 'initial',
        options: ['square', 'rhomb30', 'rhomb60', 'triangleR', 'triangleL', 'dodecagon'],
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

/**
 * making the tiling
 * @method main.makeTiling
 */
main.makeTiling = function() {
    console.log('tiling.js make tiling');
    // first clear things
    rhomb30Areas.clear();
    rhomb60Areas.clear();
    squareAreas.clear();
    triangleRAreas.clear();
    triangleLAreas.clear();
    tiles.clear();
    tile();
};

/**
 * drawing the tiling
 * @method main.drawTiling
 */
main.drawTiling = function() {
    console.log('draw tiling');
    Lines.initDrawing();
    rhomb30Areas.draw();
    rhomb60Areas.draw();
    squareAreas.draw();
    triangleRAreas.draw();
    triangleLAreas.draw();
};

main.setup();
// switching to showing the tiling
map.whatToShowController.setValueOnly("tiling");

// tiles of the tiling
//--------------------
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// actually the full square (blX,blY), (trX,trY) is opposite corner
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
            tiles.regularPolygon(true, tiling.squareUpperImage, blX, blY, brX, brY, trX, trY, tlX, tlY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.366025404 = 1 / (1 + rt3);
            const upX = 0.366025404 * (tlX - blX);
            const upY = 0.366025404 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            rhomb30(gen, cX, cY, tlX, tlY);
            rhomb30(gen, cX, cY, trX, trY);
            rhomb30(gen, cX, cY, blX, blY);
            rhomb30(gen, cX, cY, brX, brY);
            // rhomb60(gen,brX,brY,blX+rightX,blY+rightY);
            rhomb60(gen, brX, brY, trX - upX, trY - upY);
            rhomb60(gen, tlX, tlY, blX + upX, blY + upY);
            //  rhomb60(gen,tlX,tlY,trX-rightX,trY-rightY);
            let pX = brX - rt32 * rightX + 0.5 * upX;
            let pY = brY - rt32 * rightY + 0.5 * upY;
            rhomb30(gen, blX, blY, pX, pY);
            // a is corner with no rhomb60, b has one, c has two
            // abc winds right or left as seen from center of triangle
            triangleL(gen, cX, cY, pX, pY, pX - rightX, pY - rightY);
            pX = tlX + 0.5 * rightX - rt32 * upX;
            pY = tlY + 0.5 * rightY - rt32 * upY;
            rhomb30(gen, blX, blY, pX, pY);
            triangleR(gen, cX, cY, pX, pY, pX - upX, pY - upY);
            pX = brX - 0.5 * rightX + rt32 * upX;
            pY = brY - 0.5 * rightY + rt32 * upY;
            rhomb30(gen, trX, trY, pX, pY);
            triangleR(gen, cX, cY, pX, pY, pX + upX, pY + upY);
            pX = tlX + rt32 * rightX - 0.5 * upX;
            pY = tlY + rt32 * rightY - 0.5 * upY;
            rhomb30(gen, trX, trY, pX, pY);
            triangleL(gen, cX, cY, pX, pY, pX + rightX, pY + rightY);
            if (gen === tiling.maxGen) {
                tiles.outlines.addClosed(blX, blY, brX, brY, trX, trY, tlX, tlY);
            }
        }
    }
}


// the 60 degrees rhomb, coordinates of the corners with acute angles
// top is where the side of the rhomb lies on the boundary
function rhomb60(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.211324865=1/(3+sqrt(3));
    const upX = 0.211324865 * (tX - bX);
    const upY = 0.211324865 * (tY - bY);
    const rightX = upY;
    const rightY = -upX;
    const rX = cX + 1.366025404 * rightX;
    const rY = cY + 1.366025404 * rightY;
    const lX = cX - 1.366025404 * rightX;
    const lY = cY - 1.366025404 * rightY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            rhomb60Areas.add(bX, bY, rX, rY, tX, tY, lX, lY);
            tiles.rhomb60(true, tiling.rhomb60UpperImage, bX, bY, rX, rY, tX, tY, lX, lY);
        } else {
            gen += 1;
            rhomb60(gen, tX, tY, lX + 0.5 * rightX + rt32 * upX, lY + 0.5 * rightY + rt32 * upY);
            rhomb60(gen, lX, lY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            const ntX = tX - upX;
            const ntY = tY - upY;
            rhomb30(gen, lX, lY, ntX, ntY);
            rhomb30(gen, rX, rY, ntX, ntY);
            const nlX = lX + rt32 * rightX - 0.5 * upX;
            const nlY = lY + rt32 * rightY - 0.5 * upY;
            rhomb30(gen, bX, bY, nlX, nlY);
            triangleL(gen, lX, lY, nlX + upX, nlY + upY, nlX, nlY);
            const nrX = rX - rt32 * rightX - 0.5 * upX;
            const nrY = rY - rt32 * rightY - 0.5 * upY;
            triangleR(gen, ntX, ntY, nlX + upX, nlY + upY, nrX + upX, nrY + upY);
            rhomb30(gen, bX, bY, nrX, nrY);
            square(gen, nrX, nrY, nlX + upX, nlY + upY);
            triangleL(gen, rX, rY, nrX, nrY, nrX + upX, nrY + upY);
            triangleR(gen, nrX, nrY, nlX, nlY, bX + upX, bY + upY);
            if (gen === tiling.maxGen) {
                tiles.outlines.addClosed(bX, bY, rX, rY, tX, tY, lX, lY);
            }
        }
    }
}

// the 30 degrees rhomb, coordinates of the corners with acute angles
function rhomb30(gen, bX, bY, tX, tY) {
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
            rhomb30Areas.add(bX, bY, rX, rY, tX, tY, lX, lY);
            tiles.rhomb30(false, tiling.rhomb30UpperImage, bX, bY, rX, rY, tX, tY, lX, lY);
        } else {
            gen += 1;
            const bcX = cX - 0.7071 * upX;
            const bcY = cY - 0.7071 * upY;
            const tcX = cX + 0.7071 * upX;
            const tcY = cY + 0.7071 * upY;
            rhomb30(gen, bX, bY, bcX, bcY);
            rhomb30(gen, tX, tY, tcX, tcY);
            //   0.3660254=1/(1+sqrt(3))
            //   0.6339745=sqrt(3)/(1+sqrt(3))
            square(gen, rX, rY, lX, lY);
            rhomb60(gen, lX, lY, 0.3660254 * lX + 0.6339745 * bX, 0.3660254 * lY + 0.6339745 * bY);
            rhomb60(gen, rX, rY, 0.3660254 * rX + 0.6339745 * tX, 0.3660254 * rY + 0.6339745 * tY);
            if (gen === tiling.maxGen) {
                tiles.outlines.addClosed(bX, bY, rX, rY, tX, tY, lX, lY);
            }
        }
    }
}

// equilateral triangle
// a is corner with no rhomb60, b has one, c has two
// abc winds right or left as seen from center of triangle
function triangleR(gen, aX, aY, bX, bY, cX, cY) {
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            triangleRAreas.add(aX, aY, bX, bY, cX, cY);
            tiles.regularPolygon(true, tiling.triangleUpperImage, aX, aY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // 0.366025404 = 1 / (1 + rt3);
            const rightX = 0.366025404 * (bX - aX);
            const rightY = 0.366025404 * (bY - aY);
            const upX = -rightY;
            const upY = rightX;
            const nbX = bX - rt32 * rightX + 0.5 * upX;
            const nbY = bY - rt32 * rightY + 0.5 * upY;
            const ncX = cX - upX;
            const ncY = cY - upY;
            rhomb30(gen, bX, bY, ncX, ncY);
            rhomb30(gen, aX, aY, ncX, ncY);
            rhomb30(gen, aX, aY, nbX, nbY);
            rhomb60(gen, cX, cY, aX + 0.5 * rightX + rt32 * upX, aY + 0.5 * rightY + rt32 * upY);
            triangleL(gen, ncX, ncY, nbX, nbY, aX + rt32 * rightX + 0.5 * upX, aY + rt32 * rightY + 0.5 * upY);
            if (gen === tiling.maxGen) {
                tiles.outlines.addClosed(aX, aY, bX, bY, cX, cY);
            }
        }
    }
}

// equilateral triangle
// a is corner with no rhomb60, b has one, c has two
// abc winds right or left as seen from center of triangle
// mirror image of triangleR, so 'right' actually points to the left
// has different triangle at center, different rhombs at border
// else everything the same
function triangleL(gen, aX, aY, bX, bY, cX, cY) {
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            triangleLAreas.add(aX, aY, bX, bY, cX, cY);
            tiles.regularPolygon(true, tiling.triangleUpperImage, aX, aY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // 0.366025404 = 1 / (1 + rt3);
            const rightX = 0.366025404 * (bX - aX);
            const rightY = 0.366025404 * (bY - aY);
            const upX = -rightY;
            const upY = rightX;
            const nbX = bX - rt32 * rightX + 0.5 * upX;
            const nbY = bY - rt32 * rightY + 0.5 * upY;
            const ncX = cX - upX;
            const ncY = cY - upY;
            rhomb30(gen, bX, bY, ncX, ncY);
            rhomb30(gen, aX, aY, ncX, ncY);
            rhomb30(gen, aX, aY, nbX, nbY);
            rhomb60(gen, cX, cY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            rhomb60(gen, bX, bY, aX + rightX, aY + rightY);
            triangleR(gen, ncX, ncY, nbX, nbY, aX + rt32 * rightX + 0.5 * upX, aY + rt32 * rightY + 0.5 * upY);
            if (gen === tiling.maxGen) {
                tiles.outlines.addClosed(aX, aY, bX, bY, cX, cY);
            }
        }
    }
}

const size = 1; //length of side

const basicX = [];
basicX.length = 15;

const basicY = [];
basicY.length = 15;

for (let i = 0; i < 15; i++) {
    basicX[i] = Math.cos(Math.PI * i / 6) * size;
    basicY[i] = Math.sin(Math.PI * i / 6) * size;
}

const secondX = [];
const secondY = [];
secondX.length = 14;
secondY.length = 14;

for (let i = 0; i < 14; i++) {
    secondX[i] = basicX[i] + basicX[i + 1];
    secondY[i] = basicY[i] + basicY[i + 1];
}

// make that all sides have the same length, initially, for good substitution rule figures
function tile() {
    let s = size;
    if (tiling.maxGen === 0) {
        s /= 1 + Math.sqrt(3);
    }
    const r = s / Math.sqrt(3);
    const z = s * Math.cos(Math.PI / 12);
    switch (tiling.initial) {
        case 'square':
            square(0, -s / 2, -s / 2, s / 2, s / 2);
            break;
        case 'rhomb30':
            rhomb30(0, -z, 0, z, 0);
            break;
        case 'rhomb60':
            rhomb60(0, -rt32 * s, 0, rt32 * s, 0);
            break;
        case 'triangleR':
            triangleR(0, -rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'triangleL':
            triangleL(0, -rt32 * r, -r / 2, 0, r, rt32 * r, -r / 2);
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb30(0, 0, 0, secondX[i], secondY[i]);
            }
            break;
    }
}

main.drawMapChanged();