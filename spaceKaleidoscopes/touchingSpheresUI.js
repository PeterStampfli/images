/* jshint esversion: 6 */


import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    mappingSpheres,
    imageSpheres,
    imagePoints
} from "./touchingSpheres.js";

import {
    tetrahedronSpheres
} from "./tetrahedronSpheres.js";

export const controllers = {};
export const style={};

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres',
    closed: false
});

// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 3);
output.createPixels();
// add options for the output image
output.addImageProcessing();
output.addAntialiasing();
output.grid.interval = 0.1;
output.addGrid();
output.addCursorposition();
    const canvasContext = output.canvasContext;

    style.lineWidth = 2;
    style.lineColor='#ffffff';
    style.fillColor='#ffff00';

        gui.add({
        type: 'number',
        params: style,
        property: 'lineWidth',
        min: 1,
        labelText: 'line width',
        onChange: function() {
            draw();
        },
    });

            gui.add({
        type: 'color',
        params: style,
        property: 'lineColor',
        labelText:'line color',
        onChange: function() {
            draw();
        }
    });
            gui.add({
        type: 'color',
        params: style,
        property: 'fillColor',
        labelText:'fill color',
        onChange: function() {
            draw();
        }
    });

            // limits
mappingSpheres.maxGeneration = 3;
mappingSpheres.minGeneration = 1;
mappingSpheres.minimumRadius = 0.01;

            gui.add({
        type: 'number',
        params: mappingSpheres,
        property: 'maxGeneration',
        labelText:'max gen',
        min:1,
        step:1,
        onChange: function() {
            draw();
        }
    });
            gui.add({
        type: 'number',
        params: mappingSpheres,
        property: 'minGeneration',
        labelText:'min gen',
        min:1,
        step:1,
        onChange: function() {
            draw();
        }
    }); 
               gui.add({
        type: 'number',
        params: mappingSpheres,
        property: 'minimumRadius',
        labelText:'min radius',
        min:0,
        onChange: function() {
            draw();
        }
    });

function draw(){
    output.startDrawing();
    output.fillCanvas('#00000000');
            output.setLineWidth(style.lineWidth);
            canvasContext.strokeStyle=style.lineColor;
            canvasContext.fillStyle=style.fillColor;

mappingSpheres.draw2dCircles();
}

    output.drawCanvasChanged = draw;


mappingSpheres.idealTriangle();
draw();

/*
//threeMappingSpheres();
mappingSpheres.idealTriangle();

//setProjection(0.5, 1, 1, 1, 1);

//add4dTo3dMappingSphere(0.5, 1, 1, 1, 1);
//add4dTo3dMappingSphere(0.5, 1, 1, 1, -1);
//add4dTo3dMappingSphere(0.5, 2, 0, 0, 0);

mappingSpheres.log();

mappingSpheres.minimumRadius=0.1

mappingSpheres.createImages();
*/

imageSpheres.log();
imagePoints.log();