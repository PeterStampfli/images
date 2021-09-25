/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    main
} from './modules.js';

export const builder = {};

builder.maxGeneration = 3;
builder.showGeneration = 0;
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
    gui.add({
        type: 'number',
        params: builder,
        property: 'maxGeneration',
        labelText: 'max gen',
        min: 0,
        step: 1,
        onChange: function() {
            main.create();
            main.draw();
        }
    });
    builder.showGenController = gui.add({
        type: 'number',
        params: builder,
        property: 'showGeneration',
        labelText: 'show gen',
        min: 0,
        step: 1,
        onChange: function() {
            main.create();
            main.draw();
        }
    });
    gui.add({
        type: 'number',
        params: builder,
        property: 'minSize',
        labelText: 'min size',
        min: 0,
        onChange: function() {
            main.create();
            main.draw();
        }
    });
};

builder.setup = function(definition) {
    inflation = definition.inflation;
    order = definition.order;
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
        labelText: 'initial',
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
        console.log(genIndex);
        const oldGeneration = generations[genIndex - 1];
        const newGeneration = [];
        generations[genIndex] = newGeneration;
        const oldGenerationLength = oldGeneration.length;
        for (let tileIndex = 0; tileIndex < oldGenerationLength; tileIndex++) {
            const tileInfo = oldGeneration[tileIndex];
            console.log(tileInfo);
            const originX = tileInfo.originX;
            const originY = tileInfo.originY;
            const size = tileInfo.size;
            const orientation = tileInfo.orientation;
            const substitution = tiles[tileInfo.name].substitution;
            console.log(substitution);
            const substitutionLength = substitution.length;
            for (let subsIndex = 0; subsIndex < substitutionLength; subsIndex++) {
                const newTile = {};
                newGeneration.push(newTile);



            }
        }
    }

};

// drawing the structure
//=======================================

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
    canvasContext.moveTo(originX, originY);
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
        canvasContext.lineTo(x, y);
    }
    canvasContext.closePath();
    canvasContext.fill();
};