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
tiling.initial = 'rhomb';
tiling.initial = 'small square';

// the different substitution rules
var square, rhomb, triangle;
const squares = [];
const rhombs = [];
const triangles = [];

// choices
tiling.rhomb = 1;
tiling.triangle = 1;
tiling.square = 1;

const rhombAreas = new Areas({
    color: '#ff0000'
});
// actually quarter squares
const squareAreas = new Areas({
    color: '#00ff00'
});
const triangleAreas = new Areas({
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
    triangleAreas.makeUI('triangle', tilesGui);
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

    const subsGui = gui.addFolder('choice for substitution rules');

    const rhombController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'rhomb',
        options: [1, 2],
        onChange: function() {
            rhomb = rhombs[tiling.rhomb];
            main.drawMapChanged();
        }
    });

    const triangleController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'triangle',
        options: [1, 2],
        onChange: function() {
            triangle = triangles[tiling.triangle];
            main.drawMapChanged();
        }
    });

    const squareController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'square',
        options: [1, 2, 3, 4, 5],
        onChange: function() {
            square = squares[tiling.square];
            main.drawMapChanged();
        }
    });

    gui.addParagraph('<strong>tiling</strong>');
    gui.add({
        type: 'selection',
        params: tiling,
        property: 'initial',
        options: {
            'rhomb': 'rhomb',
            'triangle': 'triangle',
            'small square': 'small square',
            'square': 'big square',
            'equilateral triangle': 'full triangle',
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
    triangleAreas.clear();
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
    triangleAreas.draw();
};

// tiles of the tiling
//--------------------
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// actually the quarter square, center of full square at (trX,trY) 
//  corner at (blX,blY) 

squares[1] = function(gen, blX, blY, trX, trY) {
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
            tiles.quarterSquare(true, tiling.squareUpperImage, brX, brY, blX, blY, tlX, tlY, trX, trY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.535898385 = 2 / (2 + rt3);
            const upX = 0.535898385 * (tlX - blX);
            const upY = 0.535898385 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            rhomb(gen, blX, blY, brX + 0.5 * upX, brY + 0.5 * upY);
            rhomb(gen, blX, blY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            rhomb(gen, blX, blY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY));
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, brX - rightX + 0.5 * upX, brY - rightY + 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            fullTriangle(gen, tlX + 0.5 * rightX - upX, tlY + 0.5 * rightY - upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
        }
    }
};

squares[2] = function(gen, blX, blY, trX, trY) {
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
            tiles.quarterSquare(true, tiling.squareUpperImage, brX, brY, blX, blY, tlX, tlY, trX, trY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.535898385 = 2 / (2 + rt3);
            const upX = 0.535898385 * (tlX - blX);
            const upY = 0.535898385 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = tlX + 0.5 * rightX;
            const cY = tlY + 0.5 * rightY;
            rhomb(gen, cX, cY, blX, blY);
            rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
        }
    }
};

squares[3] = function(gen, blX, blY, trX, trY) {
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
            tiles.quarterSquare(true, tiling.squareUpperImage, brX, brY, blX, blY, tlX, tlY, trX, trY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.535898385 = 2 / (2 + rt3);
            const upX = 0.535898385 * (tlX - blX);
            const upY = 0.535898385 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = tlX + 0.5 * rightX;
            const cY = tlY + 0.5 * rightY;
            //   rhomb(gen, cX, cY, blX, blY);
            //   rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            //   fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX + upX, blY + upY, blX + upX + rightX, blY + upY + rightY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            fullSquare(gen, blX, blY, blX + upX + rightX, blY + upY + rightY);
        }
    }
};

squares[4] = function(gen, blX, blY, trX, trY) {
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
            tiles.quarterSquare(true, tiling.squareUpperImage, brX, brY, blX, blY, tlX, tlY, trX, trY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.535898385 = 2 / (2 + rt3);
            const upX = 0.535898385 * (tlX - blX);
            const upY = 0.535898385 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = brX - rightX + 0.5 * upX;
            const cY = brY - rightY + 0.5 * upY;
            //   rhomb(gen, cX, cY, blX, blY);
            //   rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            //  rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            //   fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            //  fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
            rhomb(gen, blX, blY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX, blY, cX, cY, blX + upX, blY + upY);
            fullSquare(gen, cX, cY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            fullTriangle(gen, cX, cY, cX + rightX, cY + rightY, trX - 0.5 * upX - 0.5 * rightX, trY - 0.5 * upY - 0.5 * rightY);
        }
    }
};

squares[5] = function(gen, blX, blY, trX, trY) {
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
            tiles.quarterSquare(true, tiling.squareUpperImage, brX, brY, blX, blY, tlX, tlY, trX, trY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.535898385 = 2 / (2 + rt3);
            const upX = 0.535898385 * (tlX - blX);
            const upY = 0.535898385 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            //    triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            //   triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = tlX + 0.5 * rightX - upX;
            const cY = tlY + 0.5 * rightY - upY;
            rhomb(gen, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX, blY);
            //  rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            //  rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            //  fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            // fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX, cY);
            fullTriangle(gen, blX + rightX, blY + rightY, cX + rightX, cY + rightY, cX, cY);
            fullTriangle(gen, cX, cY, trX - 0.5 * rightX - 0.5 * upX, trY - 0.5 * rightY - 0.5 * upY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            rhomb(gen, cX, cY, trX + 0.5 * rightX - 0.5 * upX, trY + 0.5 * rightY - 0.5 * upY);
            rhomb(gen, blX + rightX, blY + rightY, trX + 0.5 * rightX - 0.5 * upX, trY + 0.5 * rightY - 0.5 * upY);
        }
    }
};


square = squares[1];

function fullSquare(gen, blX, blY, trX, trY) {
    // make center and missing corners
    let cX = 0.5 * (blX + trX);
    let cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dX;
    square(gen, blX, blY, cX, cY);
    square(gen, brX, brY, cX, cY);
    square(gen, tlX, tlY, cX, cY);
    square(gen, trX, trY, cX, cY);
}

// the rhomb, coordinates of the corners with acute angles

rhombs[1] = function(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.267949192=tan(Math.PI/12);
    const hX = -0.267949192 * (cY - bY);
    const hY = 0.267949192 * (cX - bX);
    const rX = cX - hX;
    const rY = cY - hY;
    const lX = cX + hX;
    const lY = cY + hY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            rhombAreas.add(bX, bY, rX, rY, tX, tY, lX, lY);
            tiles.rhomb30(false, tiling.rhombUpperImage, bX, bY, rX, rY, tX, tY, lX, lY);
        } else {
            gen += 1;
            // 0.267949192=1/(2+rt3)
            const rightX = 0.267949192 * (rX - bX);
            const rightY = 0.267949192 * (rY - bY);
            const upX = -rightY;
            const upY = rightX;
            rhomb(gen, lX, lY, rX, rY);
            const bbcX = bX + rightX * (1 + rt32) + 0.5 * upX;
            const bbcY = bY + rightY * (1 + rt32) + 0.5 * upY;
            const ttcX = tX - rightX * (1 + rt32) - 0.5 * upX;
            const ttcY = tY - rightY * (1 + rt32) - 0.5 * upY;
            rhomb(gen, bX, bY, bbcX, bbcY);
            rhomb(gen, tX, tY, ttcX, ttcY);
            const bcX = rX - 0.5 * rightX + rt32 * upX;
            const bcY = rY - 0.5 * rightY + rt32 * upY;
            const tcX = lX + 0.5 * rightX - rt32 * upX;
            const tcY = lY + 0.5 * rightY - rt32 * upY;
            fullSquare(gen, bbcX, bbcY, bcX, bcY);
            fullSquare(gen, ttcX, ttcY, tcX, tcY);
            let midX = 0.5 * (bX + rX);
            let midY = 0.5 * (bY + rY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rightX, bY + rightY);
            triangle(gen, midX, midY, bbcX, bbcY, rX - rightX, rY - rightY);
            fullTriangle(gen, rX, rY, rX - rightX, rY - rightY, bcX, bcY);
            midX = 0.5 * (lX + tX);
            midY = 0.5 * (lY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rightX, tY - rightY);
            triangle(gen, midX, midY, ttcX, ttcY, lX + rightX, lY + rightY);
            fullTriangle(gen, lX, lY, lX + rightX, lY + rightY, tcX, tcY);
            midX = 0.5 * (lX + bX);
            midY = 0.5 * (lY + bY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rt32 * rightX + 0.5 * upX, bY + rt32 * rightY + 0.5 * upY);
            triangle(gen, midX, midY, bbcX, bbcY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY);
            fullTriangle(gen, lX, lY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY, bcX, bcY);
            midX = 0.5 * (rX + tX);
            midY = 0.5 * (rY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rt32 * rightX - 0.5 * upX, tY - rt32 * rightY - 0.5 * upY);
            triangle(gen, midX, midY, ttcX, ttcY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            fullTriangle(gen, rX, rY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY, tcX, tcY);
        }
    }
};

// the rhomb, coordinates of the corners with acute angles
// no square, asymmetric
rhombs[2] = function(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.267949192=tan(Math.PI/12);
    const hX = -0.267949192 * (cY - bY);
    const hY = 0.267949192 * (cX - bX);
    const rX = cX - hX;
    const rY = cY - hY;
    const lX = cX + hX;
    const lY = cY + hY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            rhombAreas.add(bX, bY, rX, rY, tX, tY, lX, lY);
            tiles.rhomb30(false, tiling.rhombUpperImage, bX, bY, rX, rY, tX, tY, lX, lY);
        } else {
            gen += 1;
            // 0.267949192=1/(2+rt3)
            const rightX = 0.267949192 * (rX - bX);
            const rightY = 0.267949192 * (rY - bY);
            const upX = -rightY;
            const upY = rightX;
            rhomb(gen, rX, rY, lX, lY);
            const bbcX = bX + rightX * (1 + rt32) + 0.5 * upX;
            const bbcY = bY + rightY * (1 + rt32) + 0.5 * upY;
            const ttcX = tX - rightX * (1 + rt32) - 0.5 * upX;
            const ttcY = tY - rightY * (1 + rt32) - 0.5 * upY;
            rhomb(gen, bX, bY, bbcX, bbcY);
            rhomb(gen, tX, tY, ttcX, ttcY);
            const bcX = rX - 0.5 * rightX + rt32 * upX;
            const bcY = rY - 0.5 * rightY + rt32 * upY;
            const tcX = lX + 0.5 * rightX - rt32 * upX;
            const tcY = lY + 0.5 * rightY - rt32 * upY;
            let midX = 0.5 * (bX + rX);
            let midY = 0.5 * (bY + rY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rightX, bY + rightY);
            triangle(gen, midX, midY, bbcX, bbcY, rX - rightX, rY - rightY);
            midX = 0.5 * (lX + tX);
            midY = 0.5 * (lY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rightX, tY - rightY);
            triangle(gen, midX, midY, ttcX, ttcY, lX + rightX, lY + rightY);
            fullTriangle(gen, rX, rY, tcX, tcY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            midX = 0.5 * (lX + bX);
            midY = 0.5 * (lY + bY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rt32 * rightX + 0.5 * upX, bY + rt32 * rightY + 0.5 * upY);
            triangle(gen, midX, midY, bbcX, bbcY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY);
            fullTriangle(gen, lX, lY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY, bcX, bcY);
            midX = 0.5 * (rX + tX);
            midY = 0.5 * (rY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rt32 * rightX - 0.5 * upX, tY - rt32 * rightY - 0.5 * upY);
            triangle(gen, midX, midY, ttcX, ttcY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            rhomb(gen, rX, rY, bbcX, bbcY);
            rhomb(gen, lX, lY, ttcX, ttcY);
            rhomb(gen, lX, lY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            rhomb(gen, rX, rY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY);
            fullTriangle(gen, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY, bbcX, bbcY, bbcX + rightX, bbcY + rightY);
            fullTriangle(gen, ttcX, ttcY, ttcX - rightX, ttcY - rightY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
        }
    }
};

rhomb = rhombs[1];

// halves of triangles, asymmetric!
// (mX,mY) is midpoint of base of full triangle. Has 90 degree angle corner
// (bX,bY) is other point at base. 60 degree angle corner
// (cX,cY) is top, 30 degree angle corner

triangles[1] = function(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            tiles.halfTriangle(false, tiling.triangleUpperImage, mX, mY, bX, bY, cX, cY);
            triangleAreas.add(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // attention: mirror images
            // 0.535898385 = 2 / (2 + rt3);
            const rightX = 0.535898385 * (bX - mX);
            const rightY = 0.535898385 * (bY - mY);
            // 0.309401077=1/(1.5+sqrt(3))
            const upX = 0.309401077 * (cX - mX);
            const upY = 0.309401077 * (cY - mY);
            const cenX = mX + 0.5 * rightX + (0.5 + rt32) * upX;
            const cenY = mY + 0.5 * rightY + (0.5 + rt32) * upY;
            rhomb(gen, bX, bY, mX + 0.5 * upX, mY + 0.5 * upY);
            rhomb(gen, bX, bY, cenX, cenY);
            rhomb(gen, cX, cY, cenX, cenY);
            fullTriangle(gen, cenX, cenY, mX + rightX + 0.5 * upX, mY + rightY + 0.5 * upY, mX + 0.5 * upX, mY + 0.5 * upY);
            triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, mX + 0.5 * upX, mY + 0.5 * upY);
            triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, cX - upX, cY - upY);
            triangle(gen, mX, mY, mX + 0.5 * upX, mY + 0.5 * upY, mX + rt32 * rightX, mY + rt32 * rightY);
            const midX = 0.5 * (cX + bX);
            const midY = 0.5 * (cY + bY);
            triangle(gen, midX, midY, cenX, cenY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, midX, midY, cenX, cenY, cX + 0.5 * rightX - rt32 * upX, cY + 0.5 * rightY - rt32 * upY);
        }
    }
};

triangles[2] = function(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            tiles.halfTriangle(false, tiling.triangleUpperImage, mX, mY, bX, bY, cX, cY);
            triangleAreas.add(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            // make directions
            // attention: mirror images
            // 0.535898385 = 2 / (2 + rt3);
            const rightX = 0.535898385 * (bX - mX);
            const rightY = 0.535898385 * (bY - mY);
            // 0.309401077=1/(1.5+sqrt(3))
            const upX = 0.309401077 * (cX - mX);
            const upY = 0.309401077 * (cY - mY);
            const cenX = mX + 0.5 * rightX + (0.5 + rt32) * upX;
            const cenY = mY + 0.5 * rightY + (0.5 + rt32) * upY;
            //    rhomb(gen, bX, bY, cenX, cenY);
            //    rhomb(gen, cX, cY, cenX, cenY);
            //    fullTriangle(gen, cenX, cenY, mX + rightX + 0.5 * upX, mY + rightY + 0.5 * upY, mX + 0.5 * upX, mY + 0.5 * upY);
            triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, mX + 0.5 * upX, mY + 0.5 * upY);
            //   triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, cX - upX, cY - upY);
            triangle(gen, mX, mY, mX + 0.5 * upX, mY + 0.5 * upY, mX + rt32 * rightX, mY + rt32 * rightY);
            const midX = 0.5 * (cX + bX);
            const midY = 0.5 * (cY + bY);
            fullTriangle(gen, bX - rightX, bY - rightY, bX, bY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, midX, midY, cenX, cenY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, midX, midY, cenX, cenY, cX + 0.5 * rightX - rt32 * upX, cY + 0.5 * rightY - rt32 * upY);
            fullSquare(gen, mX + 0.5 * upX, mY + 0.5 * upY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, cX - rt32 * upX, cY - rt32 * upY, cX - rt32 * upX + 0.5 * rightX, cY - rt32 * upY + 0.5 * rightY, cX, cY);
            square(gen, cenX, cenY, cX - rt32 * upX - 0.5 * upX, cY - rt32 * upY - 0.5 * upY);
            square(gen, cX - rt32 * upX + 0.5 * rightX, cY - rt32 * upY + 0.5 * rightY, cX - rt32 * upX - 0.5 * upX, cY - rt32 * upY - 0.5 * upY);
        }
    }
};

triangle = triangles[1];

function fullTriangle(gen, aX, aY, bX, bY, cX, cY) {
    const mX = 0.5 * (aX + bX);
    const mY = 0.5 * (aY + bY);
    triangle(gen, mX, mY, aX, aY, cX, cY);
    triangle(gen, mX, mY, bX, bY, cX, cY);
}

// make the tiling for various initial patterns

const size = 1;

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
        case 'triangle':
            triangle(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(0, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'full triangle':
            fullTriangle(0, -rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(-rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'big square':
            fullSquare(0, -s / 2, -s / 2, s / 2, s / 2);
            tiles.outlines.addClosed(-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2, s / 2, -s / 2);
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb(0, 0, 0, secondX[i], secondY[i]);
                const mX = 0.5 * (secondX[i] + secondX[i + 1]);
                const mY = 0.5 * (secondY[i] + secondY[i + 1]);
                triangle(0, mX, mY, secondX[i], secondY[i], basicX[i + 1], basicY[i + 1]);
                triangle(0, mX, mY, secondX[i + 1], secondY[i + 1], basicX[i + 1], basicY[i + 1]);
                tiles.outlines.addOpen(secondX[i + 1], secondY[i + 1], secondX[i], secondY[i]);
            }
            break;
    }
}

main.drawMapChanged();