/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    basics,
    poincare
} from "./basics.js";

import {
    mapping
} from "./mapping.js";
import {
    animation
} from "./animation.js";

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres',
    closed: false,
    booleanButtonWidth: 40
});

// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 2);
output.createPixels();
output.backgroundColorController.setValueOnly('#0000aa');
output.setBackground();
output.saveType.setValueOnly('jpg');

gui.add({
    type: "boolean",
    params: animation,
    property: 'isRecording',
    labelText: 'anim record'
}).add({
    type: 'number',
    params: animation,
    property: 'startFrameNumber',
    min: 0,
    step: 1,
    labelText: 'start number'
});
gui.add({
    type: 'number',
    params: animation,
    property: 'smoothing',
    min: 1,
    step: 1,
    max: 4
}).add({
    type: 'button',
    labelText: '',
    buttonText: 'stop animation',
    onClick: function() {
        animation.isRunning = false;
    }
});

mapping.config = mapping.tetrahedron;

gui.add({
    type: 'selection',
    params: mapping,
    property: 'config',
    options: {
        tetrahedron: mapping.tetrahedron,
        '4-Simplex': mapping.fourSimplex,
        cube:mapping.cube
    },
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'number',
    params: mapping,
    property: 'minGeneration',
    labelText: 'min gen',
    min: 1,
    step: 1,
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'number',
    params: mapping,
    property: 'maxGeneration',
    labelText: 'max gen',
    min: 1,
    step: 1,
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});
gui.add({
    type: 'number',
    params: mapping,
    property: 'minRadius',
    labelText: 'point radius',
    min: 0,
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping,
    property: 'useTouchingPoints',
    labelText: 'touch points',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'number',
    params: mapping,
    property: 'additionalPointsIterations',
    labelText: 'morePoints',
    min: 0,
    step: 1,
    max: 4,
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping.on,
    property: 0,
    labelText: 'mappings',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 1,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 2,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 3,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 4,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping,
    property: 'sortPoints',
    labelText: 'z-sort pts',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

basics.alpha = 0;
basics.beta = 0;
basics.gamma = 0;

const controllerAlpha = gui.add({
    type: 'number',
    params: basics,
    property: 'alpha',
    labelText: 'Euler: alpha',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerAlpha.cyclic();

const controllerBeta = controllerAlpha.add({
    type: 'number',
    params: basics,
    property: 'beta',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerBeta.cyclic();

const controllerGamma = controllerBeta.add({
    type: 'number',
    params: basics,
    property: 'gamma',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerGamma.cyclic();

basics.tiltController = gui.add({
    type: 'number',
    params: basics,
    property: 'tiltAngle',
    labelText: 'tilt',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
}).cyclic();

basics.tiltController.add({
    type: 'button',
    labelText: '',
    buttonText: 'anim',
    onClick: function() {
        animation.frameTime = 50;
        animation.stepsToDo = animation.tiltSteps;
        animation.deltaTilt = (animation.tiltEnd - basics.tiltAngle) / (animation.tiltSteps - 1);
        basics.tiltAngle -= animation.deltaTilt;
        animation.start(animation.tilt);
    }
}).add({
    type: 'number',
    params: animation,
    property: 'tiltSteps',
    min: 10,
    step: 1,
    labelText: 'steps'
}).add({
    type: 'number',
    params: animation,
    property: 'tiltEnd',
    step: 1,
    labelText: 'to'
});

basics.rotationController = gui.add({
    type: 'number',
    params: basics,
    property: 'rotationAngle',
    labelText: 'rotation',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
}).cyclic();

basics.rotationController.add({
    type: 'button',
    labelText: '',
    buttonText: 'anim',
    onClick: function() {
        animation.frameTime = 50;
        animation.stepsToDo = animation.rotationSteps;
        animation.deltaRotation = (animation.rotationEnd - basics.rotationAngle) / (animation.rotationSteps - 1);
        basics.rotationAngle -= animation.deltaRotation;
        animation.start(animation.rotation);
    }
}).add({
    type: 'number',
    params: animation,
    property: 'rotationSteps',
    min: 10,
    step: 1,
    labelText: 'steps'
}).add({
    type: 'number',
    params: animation,
    property: 'rotationEnd',
    step: 1,
    labelText: 'to'
});

export const display = {};
display.show = 'points on poincare sphere';
display.lineWidth = 2;
display.textColor = '#ffffff';
display.textOn = true;
display.equalColors = false;

gui.add({
    type: 'selection',
    params: display,
    property: 'show',
    options: [
        'mapping spheres',
        'mapping bubbles',
        'mapping discs',
        'image spheres and mapping bubbles',
        'image and mapping spheres as discs',
        'image spheres only',
        'points on poincare sphere',
        'points on poincare bubble',
        'points in mapping bubbles',
        'points only'
    ],
    labelText: 'display',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: basics,
    property: 'view',
    options: ['normal', 'stereographic', 'both (for points only)'],
    onChange: function() {
        switch (basics.view) {
            case 'normal':
                mapping.viewInterpolationController.hide();
                break;
            case 'both for points':
                mapping.viewInterpolationController.hide();
                break;
            case 'stereographic':
                mapping.viewInterpolationController.show();
                break;
        }
        transformSort();
        draw();
    }
});

mapping.viewInterpolationController = gui.add({
    type: 'number',
    params: basics,
    property: 'viewInterpolation',
    min: 0.001,
    max: 1,
    step: 0.001,
    labelText: 'x',
    onChange: function() {
        transformSort();
        draw();
    }
});
mapping.viewInterpolationController.hide();

mapping.viewInterpolationController.add({
    type: 'button',
    labelText: '',
    buttonText: 'animate',
    onClick: function() {
        if (animation.viewInterpolationSteps >= 0) {
            animation.viewInterpolationSteps = Math.max(10, animation.viewInterpolationSteps);
            mapping.viewInterpolationController.setValueOnly(0);
        } else {
            mapping.viewInterpolationController.setValueOnly(1);
        }
        animation.frameTime = 50;
        animation.stepsToDo = Math.abs(animation.viewInterpolationSteps);
        animation.start(animation.viewInterpolation);
    }
}).add({
    type: 'number',
    params: animation,
    property: 'viewInterpolationSteps',
    labelText: 'steps'
});

gui.add({
    type: 'number',
    params: display,
    property: 'lineWidth',
    labelText: 'line width',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: display,
    property: 'textColor',
    labelText: 'text',
    onChange: function() {
        draw();
    }
}).add({
    type: 'boolean',
    params: display,
    property: 'textOn',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: poincare,
    property: 'color',
    labelText: 'poinc sphere',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: mapping,
    property: 'color',
    labelText: 'map spheres',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: basics,
    property: 'alphaBubble',
    min: 1,
    step: 1,
    max: 255,
    labelText: 'alpha front',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: basics,
    property: 'alphaBubbleFront',
    min: 0,
    step: 1,
    max: 255,
    labelText: 'min front',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: basics,
    property: 'alphaBubbleBack',
    min: 0,
    step: 1,
    max: 255,
    labelText: 'back',
    onChange: function() {
        draw();
    }
});

mapping.drawGenController = gui.add({
    type: 'number',
    params: mapping,
    property: 'drawImageSphereGen',
    min: 1,
    step: 1,
    labelText: 'image of ite',
    onChange: function() {
        draw();
    }
});
mapping.drawGenController.add({
    type: 'button',
    labelText: '',
    buttonText: 'animate',
    onClick: function() {
        mapping.drawGenController.setValueOnly(1);
        animation.frameTime = 400;
        animation.stepsToDo = mapping.minGeneration;
        animation.start(animation.imageSphereGenerations);
    }
});

const frontColorController = gui.add({
    type: 'color',
    params: mapping,
    property: 'colorFront',
    labelText: 'front',
    onChange: function() {
        draw();
    }
});

const backColorController = gui.add({
    type: 'color',
    params: mapping,
    property: 'colorBack',
    labelText: 'back',
    onChange: function() {
        draw();
    }
});

backColorController.add({
    type: 'boolean',
    params: display,
    property: 'equalColors',
    labelText: 'same as front',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping,
    property: 'specialColor',
    labelText: 'special colors',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: basics,
    property: 'pointSize',
    min: 1,
    step: 1,
    max: 4,
    labelText: 'point size',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping,
    property: 'equatorOn',
    labelText: 'equator',
    onChange: function() {
        transformSort();
        draw();
    }
}).add({
    type: 'number',
    params: mapping,
    property: 'equatorNPoints',
    labelText: 'points',
    min: 10,
    step: 1,
    onChange: function() {
        transformSort();
        draw();
    }
});

gui.add({
    type: 'color',
    params: mapping,
    property: 'equatorColor',
    labelText: '',
    onChange: function() {
        draw();
    }
});

function create() {
    mapping.spheres.length = 0;
    mapping.config();
    mapping.createImages();
    mapping.createTouchingPoints();
}

function transformSort() {
    mapping.transformSortImages();
    if (mapping.equatorOn && (basics.view !== 'normal')) {
        mapping.createEquator();
    }
    // mapping.logSpheres();
}

function writeIterations() {
    if (display.textOn) {
        output.write('Iterations: ' + mapping.drawImageSphereGen, 10, 40, 36, display.textColor);
    }
}

function draw() {
    if (mapping.minGeneration < mapping.drawImageSphereGen) {
        mapping.drawGenController.setValueOnly(mapping.minGeneration);
    }
    if (display.equalColors) {
        backColorController.setValueOnly(mapping.colorFront);
    }
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(display.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    switch (display.show) {
        case 'mapping spheres':
            mapping.drawSpheres();
            break;
        case 'mapping bubbles':
            mapping.drawBubbles();
            break;
        case 'mapping discs':
            mapping.drawSpheresAsDiscs();
            break;
        case 'image spheres and mapping bubbles':
            mapping.drawImageSpheresMappingBubbles();
            writeIterations();
            break;
        case 'image spheres only':
            mapping.drawImageSpheresOnly();
            writeIterations();
            break;
        case 'image and mapping spheres as discs':
            mapping.drawImageSpheresAsDiscs();
            writeIterations();
            break;
        case 'points on poincare sphere':
            basics.startDrawingPoints();
            mapping.drawEquatorBack();
            mapping.drawStereographicPointsInBack();
            mapping.drawPointsInBack();
            output.pixels.show();
            poincare.drawSphere();
            basics.startDrawingPoints();
            mapping.drawEquatorFront();
            mapping.drawStereographicPointsInFront();
            mapping.drawPointsInFront();
            output.pixels.show();
            break;
        case 'points on poincare bubble':
            basics.startDrawingPoints();
            mapping.drawEquatorBack();
            mapping.drawStereographicPointsInBack();
            mapping.drawPointsInBack();
            output.pixels.show();
            poincare.drawLowerBubble();
            poincare.drawUpperBubble();
            basics.startDrawingPoints();
            mapping.drawEquatorFront();
            mapping.drawStereographicPointsInFront();
            mapping.drawPointsInFront();
            output.pixels.show();
            break;
        case 'points in mapping bubbles':
            mapping.drawPointsMappingBubbles();
            break;
        case 'points only':
            basics.startDrawingPoints();
            mapping.drawEquatorBack();
            mapping.drawStereographicPointsInBack();
            mapping.drawPointsInBack();
            mapping.drawEquatorFront();
            mapping.drawPointsInFront();
            mapping.drawStereographicPointsInFront();
            output.pixels.show();
            break;
    }
}

display.create = create;
display.transformSort = transformSort;
display.draw = draw;

output.drawCanvasChanged = draw;
output.drawImageChanged = draw;

create();
transformSort();
draw();