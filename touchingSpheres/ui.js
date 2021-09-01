/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    basics
} from "./basics.js";

import {
    poincare
} from "./poincare.js";

import {
    mapping
} from "./mapping.js";

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

mapping.config = mapping.tetrahedron;

gui.add({
    type: 'selection',
    params: mapping,
    property: 'config',
    options: {
        tetrahedron: mapping.tetrahedron
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
}).add({
    type: 'number',
    params: mapping,
    property: 'additionalPoints',
    labelText: 'morePoints',
    min: 0,
    step: 1,
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

gui.add({
    type: 'selection',
    params: basics,
    property: 'view',
    options: ['normal', 'stereographic'],
    onChange: function() {
        switch (basics.view) {
            case 'normal':
                viewInterpolation.hide();
                break;
            case 'stereographic':
                viewInterpolation.show();
                break;
        }
        transformSort();
        draw();
    }
});

const viewInterpolation = gui.add({
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
viewInterpolation.hide();

const tiltController = gui.add({
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
tiltController.add({
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

const display = {};
display.show = 'test';
display.lineWidth = 2;
display.textColor = '#ffffff';
display.textOn = true;

gui.add({
    type: 'selection',
    params: display,
    property: 'show',
    options: [
        'mapping spheres',
        'mapping discs',
        'image spheres and mapping bubbles',
        'image spheres only',
        'image and mapping spheres as discs',
        'test'
    ],
    labelText: 'display',
    onChange: function() {
        draw();
    }
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
    type: 'color',
    params: mapping,
    property: 'imageSphereColor',
    labelText: 'img spheres',
    onChange: function() {
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping,
    property: 'specialColor',
    labelText: 'multi',
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
    labelText: 'of iteration',
    onChange: function() {
        draw();
    }
});
mapping.drawGenController.add({
    type: 'number',
    params: basics,
    property: 'alphaBubble',
    min: 1,
    step: 1,
    max: 255,
    labelText: 'alpha',
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
    type:'color',
    params:mapping,
    property:'pointColorFront',
    labelText:'point front',
    onChange: function() {
        draw();
    }
});

gui.add({
    type:'color',
    params:mapping,
    property:'pointColorBack',
    labelText:'point back',
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
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(display.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    switch (display.show) {
        case 'mapping spheres':
            mapping.drawSpheres();
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
        case 'test':
            basics.startDrawingPoints();
            mapping.drawPointsInBack();
            mapping.drawPointsInFront();
            output.pixels.show();
            break;
    }
    // poincare.drawCircle();
    // mapping.drawSpheresAsDiscs();
}

output.drawCanvasChanged = draw;
output.drawImageChanged = draw;

create();
transformSort();
draw();