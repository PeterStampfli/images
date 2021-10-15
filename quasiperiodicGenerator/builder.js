/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    main
} from './modules.js';

export const builder = {};

builder.maxGeneration = 4;
builder.drawGeneration = 2;
builder.drawing = 'last only';
builder.minSize = 0;

var gui = {};

var order, inflation;
var basisX = [];
var basisY = [];

var tiles = {};
var tileNames = [];

const initialColors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#aa00aa'];

const colorControllers = [];

var initialTileController;

builder.init = function(guiP) {
    gui = guiP;
    builder.maxGenerationController = gui.add({
        type: 'number',
        params: builder,
        property: 'maxGeneration',
        labelText: 'highest generation',
        min: 0,
        step: 1,
        onChange: function() {
            main.create();
            main.draw();
        }
    });
    builder.drawGenController = gui.add({
        type: 'number',
        params: builder,
        property: 'drawGeneration',
        labelText: 'draw generation',
        min: 0,
        step: 1,
        onChange: function() {
            main.draw();
        }
    });
    builder.drawGenController.add({
        type: 'selection',
        params: builder,
        property: 'drawing',
        options: ['last only', 'lower in back', 'lower in front'],
        onChange: function() {
            main.draw();
        }
    });
    builder.minSizeController = gui.add({
        type: 'number',
        params: builder,
        property: 'minSize',
        labelText: 'minimum tile size',
        min: 0,
        onChange: function() {
            main.create();
            main.draw();
        }
    });
};

builder.setup = function(definition) {
    // initial canvas 
    let centerX = 0;
    let centerY = 0;
    let range = 3;
    if (definition.center) {
        centerX = definition.center[0];
        centerY = definition.center[1];
    }
    if (definition.range) {
        range = definition.range;
    }
    output.setInitialCoordinates(centerX, centerY, range);
    // definition of tiling
    inflation = definition.inflation;
    order = definition.order;
    if (definition.maxGeneration) {
        builder.maxGenerationController.setValueOnly(definition.maxGeneration);
    }
    if (definition.minSize) {
        builder.minSizeController.setValueOnly(definition.minSize);
    } else {
        builder.minSizeController.setValueOnly(0);
    }
    basisX.length = order;
    basisY.length = order;
    const dalpha = 2 * Math.PI / order;
    let alpha = 0;
    for (let i = 0; i < order; i++) {
        basisX[i] = Math.cos(alpha);
        basisY[i] = Math.sin(alpha);
        alpha += dalpha;
    }
    tiles = definition.tiles;
    colorControllers.forEach(controller => controller.destroy());
    colorControllers.length = 0;
    if (initialTileController) {
        initialTileController.destroy();
    }
    tileNames = Object.keys(tiles);
    const tileNamesLength = tileNames.length;
    for (let i = 0; i < tileNamesLength; i++) {
        const tileName = tileNames[i];
        const tile = tiles[tileName];
        if (!tile.color) {
            tile.color = initialColors[i % initialColors.length];
        }
        const colorController = gui.add({
            type: 'color',
            params: tile,
            property: 'color',
            labelText: tileName,
            onChange: function() {}
        });
        colorControllers.push(colorController);
    }
    builder.initialTile = tileNames[0];
    initialTileController = gui.add({
        type: 'selection',
        params: builder,
        property: 'initialTile',
        options: tileNames,
        labelText: 'initial tile',
        onChange: function() {
            main.create();
            main.draw();
        }
    });
};

//  making the structure
//============================================

var generations = [];
var currentGeneration;
var initialTile;

function addTile(tile) {
    const composition = tiles[tile.name].composition;
    if (composition) {
        // decompose the tile
        console.log('tile with compostion');
        console.log(tile);
        // get info of the old tile
        let oldOriginX = tile.originX;
        let oldOriginY = tile.originY;
        let oldSize = tile.size;
        const oldOrientation = tile.orientation;
        // default origin is same as old tile origin
        let newOriginX = oldOriginX;
        let newOriginY = oldOriginY;
        // default orientation is same as mother tile
        let newOrientation = oldOrientation;
        // do each tile of the substitution          
        const compositionLength = composition.length;
        for (let compIndex = 0; compIndex < compositionLength; compIndex++) {
            const newTile = {};
            const newTileDef = composition[compIndex];
            newTile.name = newTileDef.name;
            // the new tiles may have reduced/different sizes (fractals)
            if (newTileDef.size) {
                newTile.size = oldSize * newTileDef.size;
            } else {
                newTile.size = oldSize;
            }
            // update origin for children if an origin is given
            // and reset orientation to relative zero
            if (newTileDef.origin) {
                newOrientation = oldOrientation;
                const vector = newTileDef.origin;
                newOriginX = 0;
                newOriginY = 0;
                const vectorLength = vector.length;
                for (let j = 0; j < vectorLength; j++) {
                    const direction = (oldOrientation + j) % order;
                    const amplitude = vector[j];
                    newOriginX += amplitude * basisX[direction];
                    newOriginY += amplitude * basisY[direction];
                }
                newOriginX = oldSize * newOriginX + oldOriginX;
                newOriginY = oldSize * newOriginY + oldOriginY;
            }
            // set origin of new child tile
            newTile.originX = newOriginX;
            newTile.originY = newOriginY;
            // the orientation
            // newTileDef gives orientation: reset orientation
            // else use predicted value
            if (newTileDef.orientation) {
                newOrientation = oldOrientation + newTileDef.orientation;
            }
            newTile.orientation = newOrientation;
            // tile has angle: update orientation for next tile
            const newTileInfo = tiles[newTile.name];
            if (newTileInfo.angle) {
                newOrientation += newTileInfo.angle;
            }
            addTile(newTile);
        }
    } else {
        generations[currentGeneration].push(tile);
    }
}

builder.create = function() {
    // initialization with base tile
    generations.length = builder.maxGeneration + 1;
    generations[0] = [];
    currentGeneration = 0;
    const tile = {
        name: builder.initialTile,
        originX: 0,
        originY: 0,
        size: 1,
        orientation: 0
    };
    addTile(tile);
    initialTile = tile;
    // repeat substitutions
    for (currentGeneration = 1; currentGeneration <= builder.maxGeneration; currentGeneration++) {
        const oldGeneration = generations[currentGeneration - 1];
        generations[currentGeneration] = [];
        const oldGenerationLength = oldGeneration.length;
        // for each tile of the parent generation make its children tiles
        for (let tileIndex = 0; tileIndex < oldGenerationLength; tileIndex++) {
            const oldTileInfo = oldGeneration[tileIndex];
            let oldOriginX = oldTileInfo.originX;
            let oldOriginY = oldTileInfo.originY;
            if (main.inflate) {
                oldOriginX *= inflation;
                oldOriginY *= inflation;
            }
            let oldSize = oldTileInfo.size;
            if (!main.inflate) {
                oldSize /= inflation;
            }
            if (oldSize < builder.minSize) {
                continue;
            }
            // for each substitution (tile) get orientation and origin
            // if no origin is given use origin of previous substitution tile
            const oldOrientation = oldTileInfo.orientation;
            const substitution = tiles[oldTileInfo.name].substitution;
            if (substitution) {
                // default origin is same as old tile origin
                let newOriginX = oldOriginX;
                let newOriginY = oldOriginY;
                // default orientation is same as mother tile
                let newOrientation = oldOrientation;
                // do each tile of the substitution          
                const substitutionLength = substitution.length;
                for (let subsIndex = 0; subsIndex < substitutionLength; subsIndex++) {
                    const newTile = {};
                    const newTileDef = substitution[subsIndex];
                    newTile.name = newTileDef.name;
                    // the new tiles may have reduced/different sizes (fractals)
                    if (newTileDef.size) {
                        newTile.size = oldSize * newTileDef.size;
                    } else {
                        newTile.size = oldSize;
                    }
                    // update origin for children if an origin is given
                    // and reset orientation to relative zero
                    if (newTileDef.origin) {
                        newOrientation = oldOrientation;
                        const vector = newTileDef.origin;
                        newOriginX = 0;
                        newOriginY = 0;
                        const vectorLength = vector.length;
                        for (let j = 0; j < vectorLength; j++) {
                            const direction = (oldOrientation + j) % order;
                            const amplitude = vector[j];
                            newOriginX += amplitude * basisX[direction];
                            newOriginY += amplitude * basisY[direction];
                        }
                        newOriginX = oldSize * newOriginX + oldOriginX;
                        newOriginY = oldSize * newOriginY + oldOriginY;
                    }
                    // set origin of new child tile
                    newTile.originX = newOriginX;
                    newTile.originY = newOriginY;
                    // the orientation
                    // newTileDef gives orientation: reset orientation
                    // else use predicted value
                    if (newTileDef.orientation) {
                        newOrientation = oldOrientation + newTileDef.orientation;
                    }
                    newTile.orientation = newOrientation;
                    // tile has angle: update orientation for next tile
                    const newTileInfo = tiles[newTile.name];
                    if (newTileInfo.angle) {
                        newOrientation += newTileInfo.angle;
                    }
                    addTile(newTile);
                }
            }
        }
    }

};

// drawing the structure
//=======================================

// fill the shape and draw its outline
// if border is given, then draw it instead (if not a closed border, for halves of tiles)

builder.drawTile = function(tileInfo) {
    const tile = tiles[tileInfo.name];
    const shape = tile.shape;
    const originX = tileInfo.originX;
    const originY = tileInfo.originY;
    const size = tileInfo.size;
    const orientation = tileInfo.orientation;
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = tile.color;
    const length = shape.length;
    canvasContext.beginPath();
    for (let i = 0; i < length; i++) {
        let x = 0;
        let y = 0;
        const vector = shape[i];
        const vectorLength = vector.length;
        for (let j = 0; j < vectorLength; j++) {
            const direction = (orientation + j) % order;
            const amplitude = vector[j];
            x += amplitude * basisX[direction];
            y += amplitude * basisY[direction];
        }
        x = size * x + originX;
        y = size * y + originY;
        if (i === 0) {
            canvasContext.moveTo(x, y);

        } else {
            canvasContext.lineTo(x, y);
        }
    }
    canvasContext.closePath();
    if (main.drawFill) {
        canvasContext.fill();
    }
    if (main.drawStroke) {
        if (tile.border) {
            const border = tile.border;
            const length = border.length;
            canvasContext.beginPath();
            for (let i = 0; i < length; i++) {
                let x = 0;
                let y = 0;
                const vector = border[i];
                const vectorLength = vector.length;
                for (let j = 0; j < vectorLength; j++) {
                    const direction = (orientation + j) % order;
                    const amplitude = vector[j];
                    x += amplitude * basisX[direction];
                    y += amplitude * basisY[direction];
                }
                x = size * x + originX;
                y = size * y + originY;
                if (i === 0) {
                    canvasContext.moveTo(x, y);

                } else {
                    canvasContext.lineTo(x, y);
                }
            }
        }
        canvasContext.stroke();
    }
};

function drawGeneration(generation) {
    const tilesToDraw = generations[generation];
    tilesToDraw.forEach(tile => builder.drawTile(tile));
}

builder.draw = function() {
    switch (builder.drawing) {
        case 'last only':
            drawGeneration(builder.drawGeneration);
            break;
        case 'lower in back':
            for (let i = 0; i <= builder.drawGeneration; i++) {
                drawGeneration(i);
            }
            break;
        case 'lower in front':
            for (let i = builder.drawGeneration; i >= 0; i--) {
                drawGeneration(i);
            }
            break;
    }
    if (main.drawInitialStroke) {
        // draw  border of initial shape
        const tile = tiles[initialTile.name];
        const shape = tile.shape;
        const originX = initialTile.originX;
        const originY = initialTile.originY;
        let size = initialTile.size;
        if (main.inflate) {
            size *= Math.pow(inflation, builder.drawGeneration);
        }
        const orientation = initialTile.orientation;
        const canvasContext = output.canvasContext;
        const length = shape.length;
        canvasContext.beginPath();
        for (let i = 0; i < length; i++) {
            let x = 0;
            let y = 0;
            const vector = shape[i];
            const vectorLength = vector.length;
            for (let j = 0; j < vectorLength; j++) {
                const direction = (orientation + j) % order;
                const amplitude = vector[j];
                x += amplitude * basisX[direction];
                y += amplitude * basisY[direction];
            }
            x = size * x + originX;
            y = size * y + originY;
            if (i === 0) {
                canvasContext.moveTo(x, y);

            } else {
                canvasContext.lineTo(x, y);
            }
        }
        canvasContext.closePath();
        canvasContext.stroke();
    }
};