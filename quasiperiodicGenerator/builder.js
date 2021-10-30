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
builder.tileColors = null;

var gui = {};

var order, inflation;
var basisX = [];
var basisY = [];

var tiles = {};
var tileNames = [];

const initialColors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#aa00aa'];

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
    builder.drawingController = builder.drawGenController.add({
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
    if ('imageCenter' in definition) {
        centerX = definition.imageCenter[0];
        centerY = definition.imageCenter[1];
    }
    if ('imageRange' in definition) {
        range = definition.imageRange;
    }
    // drawing controlls
    if ('drawGeneration' in definition) {
        builder.drawGenController.setValueOnly(definition.drawGeneration);
    } else {
        builder.drawGenController.setValueOnly(2);
    }
    let drawing = 'last only';
    if ('drawing' in definition) {
        drawing = definition.drawing;
    }
    builder.drawingController.setValueOnly(drawing);
    output.setInitialCoordinates(-centerX, -centerY, range);
    // ui elements (on demand)
    let fill = true;
    if ('fill' in definition) {
        fill = definition.fill;
    }
    main.drawFillController.setValueOnly(fill);
    if (fill) {
        main.drawFillController.show();
    } else {
        main.drawFillController.hide();
    }
    let outline = true;
    if ('outline' in definition) {
        outline = definition.outline;
    }
    main.OutlineOnOffController.setValueOnly(outline);
    if (outline) {
        main.outlineColorController.show();
        main.outlineSizeController.show();
    } else {
        main.outlineColorController.hide();
        main.outlineSizeController.hide();
    }
    if ('markerSize' in definition) {
        main.markerSizeController.setValueOnly(definition.markerSize);
    } else {
        main.markerSizeController.setValueOnly(0.1);
    }
    // definition of tiling
    inflation = 1;
    if ('inflation' in definition) {
        inflation = definition.inflation;
    }
    let maxGeneration = 4;
    if ('maxGeneration' in definition) {
        maxGeneration = definition.maxGeneration;
    }
    builder.maxGenerationController.setValueOnly(maxGeneration);
    if ('minSize' in definition) {
        builder.minSizeController.setValueOnly(definition.minSize);
        builder.minSizeController.show();
    } else {
        builder.minSizeController.setValueOnly(0);
        builder.minSizeController.hide();
    }
    order = 5;
    if ('order' in definition) {
        order = definition.order;
    }
    basisX.length = order;
    basisY.length = order;
    const dalpha = 2 * Math.PI / order;
    let alpha = 0;
    if ('rotation' in definition) {
        alpha = Math.PI * definition.rotation;
    }
    for (let i = 0; i < order; i++) {
        basisX[i] = Math.cos(alpha);
        basisY[i] = Math.sin(alpha);
        alpha += dalpha;
    }
    if (initialTileController) {
        initialTileController.destroy();
    }
    if ('tiles' in definition) {
        tiles = definition.tiles;
    } else {
        tiles = {
            none: {}
        };
    }
    tileNames = Object.keys(tiles);
    const tileNamesLength = tileNames.length;
    let initialTile = tileNames[0];
    if ('initial' in definition) {
        if (tileNames.indexOf(definition.initial) >= 0) {
            initialTile = definition.initial;
        }
    }
    builder.initialTile = initialTile;
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
    if (builder.tileColors !== null) {
        gui.remove(builder.tileColors);
        builder.tileColors = null;
    }
    if (fill) {
        builder.tileColors = gui.addFolder('colors of tiles');
    }
    let hasMarker = false;
    for (let i = 0; i < tileNamesLength; i++) {
        const tileName = tileNames[i];
        const tile = tiles[tileName];
        if (tile.marker) {
            hasMarker = true;
        }
        if (fill) {
            if (!('color' in tile)) {
                tile.color = initialColors[i % initialColors.length];
            }
            builder.tileColors.add({
                type: 'color',
                params: tile,
                property: 'color',
                labelText: tileName,
                onChange: function() {}
            });
        }
    }
    if (hasMarker) {
        main.markerColorController.show();
        main.markerSizeController.show();
    } else {
        main.markerColorController.hide();
        main.markerSizeController.hide();
    }
};

//  making the structure
//============================================

var generations = [];
var currentGeneration;
var initialTile;

function addTile(tile) {
    if ('composition' in tiles[tile.name]) {
        const composition = tiles[tile.name].composition;
        // decompose the tile
        // get info of the composed tile
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
            const additionalTile = {};
            const definitionAdditionalTile = composition[compIndex];
            additionalTile.name = definitionAdditionalTile.name;
            // the new tiles may have reduced/different sizes (fractals)
            if (definitionAdditionalTile.size) {
                additionalTile.size = oldSize * definitionAdditionalTile.size;
            } else {
                additionalTile.size = oldSize;
            }
            // update origin for children if an origin is given
            // and reset orientation to relative zero
            if (definitionAdditionalTile.origin) {
                newOrientation = oldOrientation;
                const vector = definitionAdditionalTile.origin;
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
            additionalTile.originX = newOriginX;
            additionalTile.originY = newOriginY;
            // the orientation
            // definitionAdditionalTile gives orientation: reset orientation
            // else use predicted value
            if (definitionAdditionalTile.orientation) {
                newOrientation = oldOrientation + definitionAdditionalTile.orientation;
            }
            additionalTile.orientation = newOrientation;
            // tile has angle: update orientation for next tile
            const infoAdditionalTile = tiles[additionalTile.name];
            if (infoAdditionalTile.angle) {
                newOrientation += infoAdditionalTile.angle;
            }
            addTile(additionalTile);
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
            if ('substitution' in tiles[oldTileInfo.name]) {
                const substitution = tiles[oldTileInfo.name].substitution;
                // default origin is same as old tile origin
                let newOriginX = oldOriginX;
                let newOriginY = oldOriginY;
                // default orientation is same as mother tile
                const oldOrientation = oldTileInfo.orientation;
                let newOrientation = oldOrientation;
                // do each tile of the substitution          
                const substitutionLength = substitution.length;
                for (let subsIndex = 0; subsIndex < substitutionLength; subsIndex++) {
                    const additionalTile = {};
                    const definitionAdditionalTile = substitution[subsIndex];
                    additionalTile.name = definitionAdditionalTile.name;
                    // the new tiles may have reduced/different sizes (fractals)
                    if ('size' in definitionAdditionalTile) {
                        additionalTile.size = oldSize * definitionAdditionalTile.size;
                    } else {
                        additionalTile.size = oldSize;
                    }
                    // update origin for children if an origin is given
                    // and reset orientation to relative zero
                    if ('origin' in definitionAdditionalTile) {
                        newOrientation = oldOrientation;
                        const vector = definitionAdditionalTile.origin;
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
                    additionalTile.originX = newOriginX;
                    additionalTile.originY = newOriginY;
                    // the orientation
                    // definitionAdditionalTile gives orientation: reset orientation
                    // else use predicted value
                    if ('orientation' in definitionAdditionalTile) {
                        newOrientation = oldOrientation + definitionAdditionalTile.orientation;
                    }
                    additionalTile.orientation = newOrientation;
                    // tile has angle: update orientation for next tile
                    const infoAdditionalTile = tiles[additionalTile.name];
                    if ('angle' in infoAdditionalTile) {
                        newOrientation += infoAdditionalTile.angle;
                    }
                    addTile(additionalTile);
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
    if ('shape' in tiles[tileInfo.name]) {
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
            // if an explicite border is given then change the path
            if ('border' in tile) {
                let border = tile.border;
                if (border.length === 0) {
                    border = tile.shape;
                }
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
        if (main.drawMarker && tile.marker) {
            // make a dot at given position:
            const marker = tile.marker;
            const length = marker.length;
            let x = 0;
            let y = 0;
            for (let j = 0; j < length; j++) {
                const direction = (orientation + j) % order;
                const amplitude = marker[j];
                x += amplitude * basisX[direction];
                y += amplitude * basisY[direction];
            }
            x = size * x + originX;
            y = size * y + originY;
            canvasContext.beginPath();
            canvasContext.arc(x, y, size * main.markerSize, 0, 2 * Math.PI);
            canvasContext.fillStyle = main.markerColor;
            canvasContext.fill();
        }
    }
};

function drawGeneration(generation) {
    const tilesToDraw = generations[generation];
    tilesToDraw.forEach(tile => builder.drawTile(tile));
}

builder.draw = function() {
    output.setLineWidth(main.lineWidth);
    output.canvasContext.strokeStyle = main.lineColor;
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
    if (main.drawInitialStroke && ('shape' in tiles[initialTile.name])) {
        // draw  border of initial shape
        output.setLineWidth(main.outlineWidth);
        output.canvasContext.strokeStyle = main.outlineColor;
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