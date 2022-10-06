/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main
} from './modules.js';

var minSize = 1000;

export const builder = {};

builder.maxGeneration = 2;
builder.drawGeneration = 2;
builder.drawing = 'last only';
builder.tileColors = null;
// default tile colors
const initialColors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#aa00aa'];

var order, inflation;
var basisX = [];
var basisY = [];

// protoTiles has the definition of the tiles from the definition of the tiling/fractal
var protoTiles = {};
// tileNames are the keys to the protoTiles object fields, these are tile objects with the definitions of a tile
// its shape ..., and substitution or comosition
var tileNames = [];

var initialTileController;

// scaling: SVGScale corresponds to the unit in a drawing
var SVGScale = 1;

builder.init = function() {
    const gui = main.gui;
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
};

// working with vectors
//==================================================

// transform a vector from order-fold coordinates to cartesian coordinates
// return as array [x,y]
function cartesianVector(vector) {
    let x = 0;
    let y = 0;
    const length = vector.length;
    for (let j = 0; j < length; j++) {
        const amplitude = vector[j];
        x += amplitude * basisX[j];
        y += amplitude * basisY[j];
    }
    return [x, y];
}

// transforming an array of vectors with order-fold coordinates to 
// an array with cartesian coordinate pairs (returned)
function cartesianVectors(vectors) {
    let result = [];
    const length = vectors.length;
    for (let j = 0; j < length; j++) {
        const vector = cartesianVector(vectors[j]);
        result.push(vector[0], vector[1]);
    }
    return result;
}

// first rotate and scale, and then translate an array of coordinate pairs
// the rotation angle is nRot*2*pi/order,
// the scale is a parameter
// translation is given in components
// returns the transformed array
function transformedVectors(vectors, nRot, scale, translateX, translateY) {
    const cosAlpha = scale * basisX[nRot];
    const sinAlpha = scale * basisY[nRot];
    const result = [];
    result.length = vectors.length;
    length = vectors.length;
    for (let j = 0; j < length; j += 2) {
        const x = vectors[j];
        const y = vectors[j + 1];
        result[j] = cosAlpha * x - sinAlpha * y + translateX;
        result[j + 1] = sinAlpha * x + cosAlpha * y + translateY;
    }
    return result;
}

// reading the definition of the tiling or fractal

builder.defineTiling = function(definition) {
    const gui = main.gui;
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
    SVG.setMinViewWidthHeight(minSize, minSize);
    // SVGScale is number of SVG 'pixels' per logical unit
    SVGScale = minSize / range;
    const shiftX = 0.5 - centerX / range;
    const shiftY = 0.5 - centerX / range;
    SVG.setViewShifts(shiftX, shiftY);
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
        protoTiles = definition.tiles;
    } else {
        protoTiles = {
            none: {}
        };
    }
    // each definition of a tile is a field, with the tile name as key
    // get all tile names=keys
    tileNames = Object.keys(protoTiles);
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
        const protoTile = protoTiles[tileName];
        if (protoTile.marker) {
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
            const protoTile = protoTiles[tileName];
            if (!('color' in protoTile)) {
                protoTile.color = initialColors[i % initialColors.length];
            }
            builder.tileColors.add({
                type: 'color',
                params: protoTile,
                property: 'color',
                labelText: tileName,
                onChange: main.draw
            });
        }
    }
    // vectors in order-fold base, to transform to cartesian
    // if existing
    // tile.shape - array of vectors
    // tile.overprint - array of vectors
    // tile.border - array of vectors
    // tile.marker - single vector
    // tile.substitution.origin - array of vectors
    // tile.composition.origin - array of vectors
    for (let i = 0; i < tileNamesLength; i++) {
        const tileName = tileNames[i];
        const protoTile = protoTiles[tileName];
        if (protoTile.shape) {
            protoTile.cartesianShape = cartesianVectors(protoTile.shape);
        }
        if (protoTile.overprint) {
            protoTile.cartesianOverprint = cartesianVectors(protoTile.overprint);
        }
        if (protoTile.border) {
            if (protoTile.border.length === 0) {
                protoTile.border = protoTile.shape;
                protoTile.cartesianBorder = protoTile.cartesianShape;
            } else {
                protoTile.cartesianBorder = cartesianVectors(protoTile.border);
            }
        }
        if (protoTile.marker) {
            protoTile.cartesianMarker = cartesianVector(protoTile.marker);
        }
        if (protoTile.substitution) {
            const substitution = protoTile.substitution;
            const length = substitution.length;
            for (let i = 0; i < length; i++) {
                if (substitution[i].origin) {
                    substitution[i].cartesianOrigin = cartesianVector(substitution[i].origin);
                }
            }
        }
        if (protoTile.composition) {
            const composition = protoTile.composition;
            const length = composition.length;
            for (let i = 0; i < length; i++) {
                if (composition[i].origin) {
                    composition[i].cartesianOrigin = cartesianVector(composition[i].origin);
                }
            }
        }
    }
};

//  making the structure
//=========================================================================

// generations is an array of the various iterations of the tiling/fractal
// a single generation is an array of tile data
// each tile has a name (key to protoTiles), size, originX, originY, size
// additional data to speed up drawing
// shape -  array of cartesian coordinate pairs
// overprint - same
// border - same
// marker - same (single pair)

var generations = [];
var initialTile;

function addTile(tile, generation) {
    tile.orientation %= order;
    const protoTile = protoTiles[tile.name];
    if ('composition' in protoTile) {
        // the tile a composition of other tiles
        // generate these composing tiles and add them
        const composition = protoTile.composition;
        // decompose the tile
        // get info of the composed parent tile
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
                [childOriginX, childOriginY] = transformedVectors(childTileDefinition.cartesianOrigin, parentOrientation, parentSize, parentOriginX, parentOriginY);
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
            // tile has angle property: increase orientation by this amount for next tile
            const childTileInfo = protoTiles[childTile.name];
            if (childTileInfo.angle) {
                childOrientation += childTileInfo.angle;
            }
            addTile(childTile, generation);
        }
    } else {
        // the tile is not a composition, add it to the tiles of the current generation
        generations[generation].push(tile);
    }
    // make cartesian vector data of the tile:
    // transform cartesian vectors of protoTile using geometry data of the tile
    const originX = tile.originX;
    const originY = tile.originY;
    const size = tile.size;
    const orientation = tile.orientation;
    if (protoTile.cartesianShape) {
        tile.cartesianShape = transformedVectors(protoTile.cartesianShape, orientation, size, originX, originY);
    }
    if (protoTile.cartesianOverprint) {
        tile.cartesianOverprint = transformedVectors(protoTile.cartesianOverprint, orientation, size, originX, originY);
    }
    if (protoTile.border) {
        tile.cartesianBorder = transformedVectors(protoTile.cartesianBorder, orientation, size, originX, originY);
    }
    if (protoTile.cartesianMarker) {
        tile.cartesianMarker = transformedVectors(protoTile.cartesianMarker, orientation, size, originX, originY);
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
        size: SVGScale,
        orientation: 0
    };
    addTile(tile, 0);
    initialTile = tile;
    // repeat substitutions
    for (let childGeneration = 1; childGeneration <= builder.maxGeneration; childGeneration++) {
        const parentGeneration = generations[childGeneration - 1];
        generations[childGeneration] = [];
        const parentGenerationLength = parentGeneration.length;
        // for each tile of the parent generation make its children tiles
        for (let tileIndex = 0; tileIndex < parentGenerationLength; tileIndex++) {
            const parentTileInfo = parentGeneration[tileIndex];
            if ('substitution' in protoTiles[parentTileInfo.name]) {
                const substitution = protoTiles[parentTileInfo.name].substitution;
                let parentOriginX = parentTileInfo.originX;
                let parentOriginY = parentTileInfo.originY;
                let parentSize = parentTileInfo.size;
                if (main.inflate) {
                    parentOriginX *= inflation;
                    parentOriginY *= inflation;
                } else {
                    parentSize /= inflation;
                }
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
                    // update origin for children if an origin property is given
                    // and reset child orientation to parent orientation
                    if ('origin' in childTileDefinition) {
                        childOrientation = parentOrientation;
                        [childOriginX, childOriginY] = transformedVectors(childTileDefinition.cartesianOrigin, parentOrientation, parentSize, parentOriginX, parentOriginY);
                    }
                    // set origin of child tile
                    childTile.originX = childOriginX;
                    childTile.originY = childOriginY;
                    // the orientation
                    // if childTileDefinition gives orientation: reset orientation
                    // else use predicted value
                    if ('orientation' in childTileDefinition) {
                        childOrientation = parentOrientation + order + childTileDefinition.orientation;
                    }
                    childTile.orientation = childOrientation;
                    // tile has angle property: increase orientation by this amount for next tile as preediction
                    const childTileInfo = protoTiles[childTile.name];
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

// draw overprinting lines to join halves if there is a stroke finally
builder.drawOverprint = function(tile) {
    const protoTile = protoTiles[tile.name];
    if ('overprint' in protoTile) {
        // overprinting to join halves, only if fill
        // need explicit overprinting, do first
        SVG.createPolyline(tile.cartesianOverprint, {
            stroke: protoTile.color
        });
    }
};

// no final stroke: draw fill and stroke (for overprinting) together
builder.drawOverprintStroke = function(tile) {
    const protoTile = protoTiles[tile.name];
    if ('shape' in protoTile) {
        SVG.createPolygon(tile.cartesianShape, {
            stroke: protoTile.color,
            fill: protoTile.color
        });
    }
};

// fill the tiles
builder.drawFill = function(tile) {
    const protoTile = protoTiles[tile.name];
    if ('shape' in protoTile) {
        SVG.createPolygon(tile.cartesianShape, {
            fill: protoTile.color
        });
    }
};

// draw outline
// if border is given, then draw it instead (if not a closed border, for halves of tiles)

builder.drawStroke = function(tile) {
    const protoTile = protoTiles[tile.name];
    // if an explicite border is given then use border path
    // else use CLOSED shape of tile as border if exists
    if ('border' in protoTile) {
        SVG.createPolyline(tile.cartesianBorder);
    } else if ('shape' in protoTile) {
        SVG.createPolygon(tile.cartesianShape);
    }
};

builder.drawMarker = function(tile) {
    if (tile.cartesianMarker) {
        const radius = tile.size * main.markerSize;
        SVG.createCircle(tile.cartesianMarker[0], tile.cartesianMarker[1], radius);
        //canvasContext.fillStyle = main.markerColor;
        //canvasContext.fill();
    }
};

function drawGeneration(generation) {
    const tilesToDraw = generations[generation];
    if (main.drawFill) {
        SVG.groupAttributes['stroke-width'] = 1;
        SVG.groupAttributes.fill = 'none';
        SVG.createGroup(SVG.groupAttributes);
        if (main.drawStroke) {
            tilesToDraw.forEach(tile => builder.drawOverprint(tile));
        } else {
            // no stroke: use entire shape for overprinting
            tilesToDraw.forEach(tile => builder.drawOverprintStroke(tile));
        }
        SVG.groupAttributes.stroke = 'none';
        SVG.createGroup(SVG.groupAttributes);
        tilesToDraw.forEach(tile => builder.drawFill(tile));
    }
    if (main.drawStroke) {
        SVG.groupAttributes.stroke = main.lineColor;
        SVG.groupAttributes['stroke-width'] = main.lineWidth;
        SVG.createGroup(SVG.groupAttributes);
        tilesToDraw.forEach(tile => builder.drawStroke(tile));
    }
    if (main.drawMarker) {
        SVG.groupAttributes.stroke = 'none';
        SVG.groupAttributes.fill = main.markerColor;
        SVG.createGroup(SVG.groupAttributes);
        tilesToDraw.forEach(tile => builder.drawMarker(tile));
    }
}

builder.drawOutline = function() {
    if ('shape' in protoTiles[initialTile.name]) {
        // draw  border of initial shape
        const protoTile = protoTiles[initialTile.name];
        const shape = protoTile.shape;
        const originX = initialTile.originX;
        const originY = initialTile.originY;
        let size = 1;
        if (main.inflate) {
            size *= Math.pow(inflation, builder.drawGeneration);
        }
        const orientation = initialTile.orientation;
        const cartesianOutline = transformedVectors(initialTile.cartesianShape, orientation, size, originX, originY);
        SVG.createPolygon(cartesianOutline, {
            fill: 'none',
            stroke: main.outlineColor,
            'stroke-width': main.outlineWidth
        });
    }
};

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
    // drawing the outline around initial configuration, particularly for subs rules
    if (main.drawInitialStroke) {
        builder.drawOutline();
    }
};