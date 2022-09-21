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
    builder.maxGenerationController.addHelp('Number of iterations or highest generation, that gets calculated. You can only show generations lower or equal to this. Attention: Computing time increases exponentially');
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
    builder.drawingController.addHelp('Choose the generation to show. You can choose to display only that one (for tilings), or to display also earlier generations (for some fractals, such as the "fractal tree", that include earlier generations.)');
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

// reading the definition of the tiling or fractal

builder.setup = function(definition) {
    // initialize canvas dimensions depending on the definition
    let centerX = 0;
    let centerY = 0;
    let range = 3;
    if ('center' in definition) {
        centerX = definition.center[0];
        centerY = definition.center[1];
    }
    if ('range' in definition) {
        range = definition.range;
    }
    output.setInitialCoordinates(centerX, -centerY, range);

    // drawing controlls
    // set the generation to draw upon loading the definition, default is 2
    if ('drawGeneration' in definition) {
        builder.drawGenController.setValueOnly(definition.drawGeneration);
    } else {
        builder.drawGenController.setValueOnly(2);
    }
    // sequence of drawing generations, last only, or all
    let drawing = 'last only';
    if ('drawing' in definition) {
        drawing = definition.drawing;
    }
    builder.drawingController.setValueOnly(drawing);
    // ui elements (on demand)
    // switching fill for polygons on and off, or nothing at all
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
    // heavy outline for initial polygon, switching on or off, or hiding controls
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
    // generate all generations up to maxGeneration
    //  this is the highest generation you can display
    let maxGeneration = 4;
    if ('maxGeneration' in definition) {
        maxGeneration = definition.maxGeneration;
    }
    builder.maxGenerationController.setValueOnly(maxGeneration);

    // define the tiles of the tiling/fractal
    // inflation ratio of substitution method, typically for tilings
    inflation = 1;
    if ('inflation' in definition) {
        inflation = definition.inflation;
    }
    // order of the rotation group of the tiling/fractal, default is 5
    order = 5;
    if ('order' in definition) {
        order = definition.order;
    }
    // generating the corresponding basis vectors at multiples of 2 pi/order
    basisX.length = 2 * order;
    basisY.length = basisX.length;
    const dalpha = 2 * Math.PI / order;
    let alpha = 0;
    for (let i = 0; i < basisX.length; i++) {
        basisX[i] = Math.cos(alpha);
        basisY[i] = Math.sin(alpha);
        alpha += dalpha;
    }
    // definition.tiles is an object
    if ('tiles' in definition) {
        tiles = definition.tiles;
    } else {
        tiles = {
            none: {}
        };
    }
    // each definition of a tile is a field, with the tile name as key
    // get all tile names=keys
    tileNames = Object.keys(tiles);
    const tileNamesLength = tileNames.length;
    let initialTile = tileNames[0];
    // determine initial tile for the substitution, default is the first tile
    if ('initial' in definition) {
        if (tileNames.indexOf(definition.initial) >= 0) {
            initialTile = definition.initial;
        }
    }
    builder.initialTile = initialTile;
    // each tile may be choosen as initial tile, 
    // destroy previous controller with its options
    // create a new controller
    if (initialTileController) {
        initialTileController.destroy();
    }
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
    initialTileController.addHelp('Choose the initial tile or configuration used in the substitution');
    // check if there are markers, in case add controls
    let hasMarker = false;
    for (let i = 0; i < tileNamesLength; i++) {
        const tileName = tileNames[i];
        const tile = tiles[tileName];
        if (tile.marker) {
            hasMarker = true;
            break;
        }
    }
    if (hasMarker) {
        main.markerColorController.show();
        main.markerSizeController.show();
    } else {
        main.markerColorController.hide();
        main.markerSizeController.hide();
    }
    // if there are fill colors add color controllers for tiles, load color
    // first remove preexisting tile color controllers
    if (builder.tileColors !== null) {
        gui.remove(builder.tileColors);
        builder.tileColors = null;
    }
    if (fill) {
        builder.tileColors = gui.addFolder('colors of tiles');
        for (let i = 0; i < tileNamesLength; i++) {
            const tileName = tileNames[i];
            const tile = tiles[tileName];
            if (!('color' in tile)) {
                tile.color = initialColors[i % initialColors.length];
            }
            builder.tileColors.add({
                type: 'color',
                params: tile,
                property: 'color',
                labelText: tileName,
                onChange: main.draw
            });
        }
    }
};

//  making the structure
//============================================

var generations = [];
var initialTile;

function addTile(tile, generation) {
    tile.orientation %= order;
    if ('composition' in tiles[tile.name]) {
        const composition = tiles[tile.name].composition;
        // decompose the tile
        // get info of the composed tile
        const parentOriginX = tile.originX;
        const parentOriginY = tile.originY;
        const parentSize = tile.size;
        const parentOrientation = tile.orientation;
        // default origin is same as parent tile origin
        let childOriginX = parentOriginX;
        let childOriginY = parentOriginY;
        // default orientation is same as mother tile
        let childOrientation = parentOrientation;
        // do each tile of the substitution          
        const compositionLength = composition.length;
        for (let compIndex = 0; compIndex < compositionLength; compIndex++) {
            const childTile = {};
            const childTileDefinition = composition[compIndex];
            childTile.name = childTileDefinition.name;
            // the child tiles may have reduced/different sizes (fractals)
            if (childTileDefinition.size) {
                childTile.size = parentSize * childTileDefinition.size;
            } else {
                childTile.size = parentSize;
            }
            // update origin for children if an origin is given
            // and reset orientation to orientation of mother tile
            if (childTileDefinition.origin) {
                childOrientation = parentOrientation;
                const vector = childTileDefinition.origin;
                childOriginX = 0;
                childOriginY = 0;
                const vectorLength = vector.length;
                for (let j = 0; j < vectorLength; j++) {
                    const direction = parentOrientation + j;
                    const amplitude = vector[j];
                    childOriginX += amplitude * basisX[direction];
                    childOriginY += amplitude * basisY[direction];
                }
                childOriginX = parentSize * childOriginX + parentOriginX;
                childOriginY = parentSize * childOriginY + parentOriginY;
            }
            // set origin of child tile
            childTile.originX = childOriginX;
            childTile.originY = childOriginY;
            // the orientation
            // childTileDefinition gives orientation: reset orientation
            // else use predicted value
            if ('orientation' in childTileDefinition) {
                childOrientation = parentOrientation + order + childTileDefinition.orientation;
            }
            childTile.orientation = childOrientation;
            // tile has angle: update orientation for next tile
            const childTileInfo = tiles[childTile.name];
            if (childTileInfo.angle) {
                childOrientation += childTileInfo.angle;
            }
            addTile(childTile, generation);
        }
    } else {
        generations[generation].push(tile);
    }
}

builder.create = function() {
    // initialization with base tile
    generations.length = builder.maxGeneration + 1;
    generations[0] = [];
    const tile = {
        name: builder.initialTile,
        originX: 0,
        originY: 0,
        size: 1,
        orientation: 0
    };
    addTile(tile, 0);
    initialTile = tile;
    // repeat substitutions
    const noInflate = !main.inflate;
    for (let childGeneration = 1; childGeneration <= builder.maxGeneration; childGeneration++) {
        const parentGeneration = generations[childGeneration - 1];
        generations[childGeneration] = [];
        const parentGenerationLength = parentGeneration.length;
        // for each tile of the parent generation make its children tiles
        for (let tileIndex = 0; tileIndex < parentGenerationLength; tileIndex++) {
            const parentTileInfo = parentGeneration[tileIndex];
            let parentOriginX = parentTileInfo.originX;
            let parentOriginY = parentTileInfo.originY;
            if (main.inflate) {
                parentOriginX *= inflation;
                parentOriginY *= inflation;
            }
            let parentSize = parentTileInfo.size;
            if (noInflate) {
                parentSize /= inflation;
            }
            if (parentSize < builder.minSize) {
                continue;
            }
            // for each substitution (tile) get orientation and origin
            // if no origin is given use origin of previous substitution tile
            if ('substitution' in tiles[parentTileInfo.name]) {
                const substitution = tiles[parentTileInfo.name].substitution;
                // default origin is same as parent tile origin
                let childOriginX = parentOriginX;
                let childOriginY = parentOriginY;
                // default orientation is same as mother tile
                const parentOrientation = parentTileInfo.orientation;
                let childOrientation = parentOrientation;
                // do each tile of the substitution          
                const substitutionLength = substitution.length;
                for (let subsIndex = 0; subsIndex < substitutionLength; subsIndex++) {
                    const childTile = {};
                    const childTileDefinition = substitution[subsIndex];
                    childTile.name = childTileDefinition.name;
                    // the child tiles may have reduced/different sizes (fractals)
                    if ('size' in childTileDefinition) {
                        childTile.size = parentSize * childTileDefinition.size;
                    } else {
                        childTile.size = parentSize;
                    }
                    // update origin for children if an origin is given
                    // and reset orientation to relative zero
                    if ('origin' in childTileDefinition) {
                        childOrientation = parentOrientation;
                        const vector = childTileDefinition.origin;
                        childOriginX = 0;
                        childOriginY = 0;
                        const vectorLength = vector.length;
                        for (let j = 0; j < vectorLength; j++) {
                            const direction = parentOrientation + j;
                            const amplitude = vector[j];
                            childOriginX += amplitude * basisX[direction];
                            childOriginY += amplitude * basisY[direction];
                        }
                        childOriginX = parentSize * childOriginX + parentOriginX;
                        childOriginY = parentSize * childOriginY + parentOriginY;
                    }
                    // set origin of child tile
                    childTile.originX = childOriginX;
                    childTile.originY = childOriginY;
                    // the orientation
                    // childTileDefinition gives orientation: reset orientation
                    // else use predicted value
                    if ('orientation' in childTileDefinition) {
                        childOrientation = parentOrientation + order + childTileDefinition.orientation;
                    }
                    childTile.orientation = childOrientation;
                    // tile has angle: update orientation for next tile
                    const childTileInfo = tiles[childTile.name];
                    if ('angle' in childTileInfo) {
                        childOrientation += childTileInfo.angle;
                    }
                    addTile(childTile, childGeneration);
                }
            }
        }
    }
};

// drawing the structure
//=======================================

// draw overprinting lines to join halves
builder.drawOverprint = function(tileInfo) {
    const tile = tiles[tileInfo.name];
    if ('overprint' in tile) {
        // overprinting to join halves, only if fill
        // need explicit overprinting, do first
        const canvasContext = output.canvasContext;
        canvasContext.strokeStyle = tile.color;
        const overprint = tile.overprint;
        const originX = tileInfo.originX;
        const originY = tileInfo.originY;
        const size = tileInfo.size;
        const orientation = tileInfo.orientation;
        const length = overprint.length;
        canvasContext.beginPath();
        for (let i = 0; i < length; i++) {
            let x = 0;
            let y = 0;
            const vector = overprint[i];
            const vectorLength = vector.length;
            for (let j = 0; j < vectorLength; j++) {
                const direction = orientation + j;
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
        canvasContext.stroke();
    }
};

// fill the shape and draw its outline
// if border is given, then draw it instead (if not a closed border, for halves of tiles)

builder.drawTile = function(tileInfo) {
    const tile = tiles[tileInfo.name];
    if ('shape' in tile) {
        const shape = tile.shape;
        const originX = tileInfo.originX;
        const originY = tileInfo.originY;
        const size = tileInfo.size;
        const orientation = tileInfo.orientation;
        const canvasContext = output.canvasContext;
        canvasContext.fillStyle = tile.color;
        const length = shape.length;
        // make path for fill (and stroke)
        canvasContext.beginPath();
        for (let i = 0; i < length; i++) {
            let x = 0;
            let y = 0;
            const vector = shape[i];
            const vectorLength = vector.length;
            for (let j = 0; j < vectorLength; j++) {
                const direction = orientation + j;
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
                        const direction = orientation + j;
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
                const direction = orientation + j;
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
    const canvasContext = output.canvasContext;
    const tilesToDraw = generations[generation];
    if (main.drawFill) {
        output.setLineWidth(1);
        tilesToDraw.forEach(tile => builder.drawOverprint(tile));
    }
    output.setLineWidth(main.lineWidth);
    canvasContext.strokeStyle = main.lineColor;

    tilesToDraw.forEach(tile => builder.drawTile(tile));
}

builder.draw = function() {
    output.setLineWidth(main.lineWidth);
    const canvasContext = output.canvasContext;
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
    // drawing the outline around initial configuration, particularly for subs rules
    if (main.drawInitialStroke && ('shape' in tiles[initialTile.name])) {
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
        const length = shape.length;
        canvasContext.beginPath();
        for (let i = 0; i < length; i++) {
            let x = 0;
            let y = 0;
            const vector = shape[i];
            const vectorLength = vector.length;
            for (let j = 0; j < vectorLength; j++) {
                const direction = orientation + j;
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
        output.setLineWidth(main.outlineWidth);
        canvasContext.strokeStyle = main.outlineColor;
        canvasContext.stroke();
    }
};