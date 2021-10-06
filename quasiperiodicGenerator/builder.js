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
builder.minSize = 0.1;

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
            main.create();
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
        const substitutions = tile.substitution;
        const substitutionsLength = substitutions.length;
        for (let subsIndex = 0; subsIndex < substitutionsLength; subsIndex++) {
            const substitution = substitutions[subsIndex];
        }
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

builder.create = function() {
    generations.length = builder.maxGeneration + 1;
    const generation0 = [{
        name: builder.initialTile,
        originX: 0,
        originY: 0,
        size: 1,
        orientation: 0
    }];
    generations[0] = generation0;
    for (let genIndex = 1; genIndex <= builder.maxGeneration; genIndex++) {
        const oldGeneration = generations[genIndex - 1];
        const newGeneration = [];
        generations[genIndex] = newGeneration;
        const oldGenerationLength = oldGeneration.length;
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
            const substitutions = tiles[oldTileInfo.name].substitution;
            const substitutionsLength = substitutions.length;
            // default origin is same as old tile origin
            let newOriginX = oldOriginX;
            let newOriginY = oldOriginY;
            // default orientation is same as mother tile
            let newOrientation = oldOrientation;
            // do each substitution          
            for (let subsIndex = 0; subsIndex < substitutionsLength; subsIndex++) {
                const newTile = {};
                newGeneration.push(newTile);
                const substitution = substitutions[subsIndex];
                newTile.name = substitution.name;
                // substitutions may have reduced/different sizes
                if (substitution.size) {
                    newTile.size = oldSize * substitution.size;
                } else {
                    newTile.size = oldSize;
                }
                // update origin for children if an origin is given
                // and reset orientation to relative zero
                if (substitution.origin) {
                    newOrientation = oldOrientation;
                    const vector = substitution.origin;
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
                // substitution gives orientation: reset orientation
                // else use predicted value
                if (substitution.orientation) {
                    newOrientation = oldOrientation + substitution.orientation;
                }
                newTile.orientation = newOrientation;
                // tile has angle: update orientation for next tile
                const newTileInfo = tiles[newTile.name];
                if (newTileInfo.angle) {
                    newOrientation += newTileInfo.angle;
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

builder.draw = function() {
    const tilesToDraw = generations[builder.drawGeneration];
    tilesToDraw.forEach(tile => builder.drawTile(tile));
    if (main.drawStroke) {
        // draw  border of initial shape
        const tileInfo = generations[0][0];
        const tile = tiles[tileInfo.name];
        const shape = tile.shape;
        const originX = tileInfo.originX;
        const originY = tileInfo.originY;
        let size = tileInfo.size;
        if (main.inflate) {
            size *= Math.pow(inflation, builder.drawGeneration);
        }
        const orientation = tileInfo.orientation;
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