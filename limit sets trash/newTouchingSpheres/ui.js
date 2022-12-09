/* jshint esversion: 6 */

import {
    ParamGui
} from "../libgui/modules.js";

import {
    view,
    main,
    mapping,
    color
} from './modules.js';

export const ui = {};

ui.setup = function() {
    // setting up the canvas and its gui
    const gui = new ParamGui({
        name: 'touching spheres',
        closed: false,
        booleanButtonWidth: 40
    });
    ui.gui = gui;

    // creating and view selection

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
            main.create();
            main.transformSort();
            main.draw();
    }
});


gui.add({
    type: 'boolean',
    params: mapping.on,
    property: 0,
    labelText: 'mappings',
    onChange: function() {
            main.create();
            main.transformSort();
            main.draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 1,
    labelText: '',
     onChange: function() {
            main.create();
            main.transformSort();
            main.draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 2,
    labelText: '',
    onChange: function() {
            main.create();
            main.transformSort();
            main.draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 3,
    labelText: '',
    onChange: function() {
            main.create();
            main.transformSort();
            main.draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 4,
    labelText: '',
    onChange: function() {
            main.create();
            main.transformSort();
            main.draw();
    }
});

    gui.add({
type:'number',
params:mapping,
property:'doGenerations',
labelText:'generate',
min:1,
step:1,
        onChange: function() {
            main.create();
            main.transformSort();
            main.draw();
        }
    });

    ui.drawGenerationController=gui.add({
        type:'number',
        params:mapping,
        property:'drawGeneration',
        labelText:'draw',
            onChange: function() {
            main.draw();
        }    
    });

    // view transforms

    const controllerAlpha = gui.add({
        type: 'number',
        params: view,
        property: 'alpha',
        labelText: 'Euler: alpha',
        min: -180,
        max: 180,
        onChange: function() {
            main.transformSort();
            main.draw();
        }
    });
    controllerAlpha.cyclic();

    const controllerBeta = controllerAlpha.add({
        type: 'number',
        params: view,
        property: 'beta',
        min: -180,
        max: 180,
        onChange: function() {
            main.transformSort();
            main.draw();
        }
    });
    controllerBeta.cyclic();

    const controllerGamma = controllerBeta.add({
        type: 'number',
        params: view,
        property: 'gamma',
        min: -180,
        max: 180,
        onChange: function() {
            main.transformSort();
            main.draw();
        }
    });
    controllerGamma.cyclic();


ui.viewInterpolationController = gui.add({
    type: 'number',
    params: view,
    property: 'interpolation',
    min: 0,
    max: 1,
    labelText: 'st.project',
    onChange: function() {
            main.transformSort();
            main.draw();
    }
});

ui.rotationController = gui.add({
    type: 'number',
    params: view,
    property: 'rotationAngle',
    labelText: 'rotation',
    min: -180,
    max: 180,
    onChange: function() {
            main.transformSort();
            main.draw();
    }
}).cyclic();

ui.tiltController = gui.add({
    type: 'number',
    params: view,
    property: 'tiltAngle',
    labelText: 'tilt',
    min: -180,
    max: 180,
    onChange: function() {
main.transformSort();
            main.draw();
    }
}).cyclic();

gui.add({
    type:'color',
    params:color,
    property:'front',
       onChange: function() {
            main.draw();
    } 
});

gui.add({
    type:'color',
    params:color,
    property:'center',
       onChange: function() {
            main.draw();
    } 
});

gui.add({
    type:'color',
    params:color,
    property:'back',
       onChange: function() {
            main.draw();
    } 
});

gui.add({
type:'boolean',
params:main,
property:'textOn',
labelText:'text',
    onChange: function() {
            main.draw();
    }
}).add({
    type:'color',
    params:main,
    property:'textColor',
    labelText:'',
       onChange: function() {
            main.draw();
    } 
});

};