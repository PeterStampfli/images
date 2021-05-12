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
tiling.fixedSize = true;


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
    tiles.makeUI(true, false, true, linesGui);
    const tilesGui = gui.addFolder('tiles');
    rhombAreas.makeUI('rhomb', false, tilesGui);
    squareAreas.makeUI('square', false, tilesGui);
    triangleAreas.makeUI('triangle', false, tilesGui);
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
            draw();
        }
    });

    const triangleController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'triangle',
        options: [1, 2],
        onChange: function() {
            triangle = triangles[tiling.triangle];
            draw();
        }
    });

    const squareController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'square',
        options: [1, 2, 3, 4, 5],
        onChange: function() {
            square = squares[tiling.square];
            draw();
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

    BooleanButton.whiteBackground();
    const fixedSizeController = gui.add({
        type: 'boolean',
        params: tiling,
        labelText: 'tile size',
        buttonText: ['fixed', 'variable'],
        property: 'fixedSize',
        onChange: function() {
            main.drawMapChanged();
        }
    });
};


main.setup();
// switching to showing the tiling
map.whatToShowController.setValueOnly("tiling");


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
            tiles.quarterSquare(brX, brY, blX, blY, tlX, tlY, trX, trY);
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



main.drawMapChanged();