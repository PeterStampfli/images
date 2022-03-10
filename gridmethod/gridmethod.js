/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

import {
    Line
} from "./line.js";

import {
    ParallelLines
} from "./parallelLines.js";

import {
    grid
} from "./grid.js";

import {
    Intersection
} from "./intersection.js";

export const main = {};
export const color=[];

main.drawLines = true;

main.nLines = 3;
main.offset = 0.5;
main.nFold = 5;

main.tile = true;
main.lineColor = '#000000';
main.lineWidth = 1;

main.rhombusSize = 0.1; // side length of rhombus
main.rhombusColor = '#008800';
main.rhombusLineWidth = 1;
main.drawIntersections = true;
main.fill=true;

color.push('#000000');
color.push('#ff0000');
color.push('#00bb00');
color.push('#cccc00');
color.push('#4444ff');
color.push('#ff00ff');
color.push('#ffffff');


main.setup = function() {
    // gui and output canvas
    const gui = new ParamGui({
        name: 'gridmethod',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;
    BooleanButton.greenRedBackground();
    // no background color, no transparency
    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3);
    output.backgroundColorController.setValueOnly('#999999');
    output.setBackground();
    output.saveType.setValueOnly('jpg');
    output.drawCanvasChanged = draw;
    output.drawImageChanged = draw;

    gui.add({
        type: 'number',
        params: main,
        property: 'lineWidth',
        labelText: 'grid line',
        min: 0,
        onChange: function() {
            draw();
        }
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawLines',
        labelText: '',
        onChange: function() {
            draw();
        }
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'lineColor',
        labelText: '',
        onChange: function() {
            draw();
        }
    });

    gui.add({
        type: 'number',
        params: main,
        property: 'nFold',
        labelText: 'symmetry',
        step: 1,
        min: 3,
        onChange: function() {
            create();
            draw();
        }
    }).add({
        type:'number',
        params:main,
        property:'nLines',
        labelText:'lines',
        min:1,
        step:1,
       onChange: function() {
            create();
            draw();
        }
    });
    gui.add({
type:'number',
params:main,
property:'offset',
       onChange: function() {
            create();
            draw();
        }
    });

    gui.add({
        type: 'boolean',
        params: main,
        property: 'tile',
        labelText: 'make tiling',
        onChange: function() {
            create();
            draw();
        }
    });

    gui.add({
        type: 'number',
        params: main,
        property: 'rhombusLineWidth',
        labelText: 'tiling line',
        min: 0,
        onChange: function() {
            draw();
        }
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawIntersections',
        labelText: '',
        onChange: function() {
            draw();
        }
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'rhombusColor',
        labelText: '',
        onChange: function() {
            draw();
        }
    });

    gui.add({
        type: 'number',
        params: main,
        property: 'rhombusSize',
        labelText: 'tile size',
        onChange: function() {
            create();
            draw();
        }
    });

    gui.add({
        type: 'boolean',
        params: main,
        property: 'fill',
        onChange: function() {
            draw();
        }
    });
    
    gui.add({
        type:'color',
        params:color,
        property:0,
        labelText:'colors: 0',
 onChange: function() {
            draw();
        }        
    })
      for (let i=1;i<color.length;i++){  
    gui.add({
        type:'color',
        params:color,
        property:i,
 onChange: function() {
            draw();
        }        
    });
}

    create();
    draw();
};

function create() {
    grid.createBasic();
    grid.makeTiling();
}

function draw() {
    output.correctYAxis();
    output.startDrawing();
    output.fillCanvas('#bbbbbb');
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    if (main.drawIntersections) {
        grid.drawIntersections();
    }
       if (main.drawLines) {
        grid.drawLines();
    }
 
}