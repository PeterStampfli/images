/* jshint esversion: 6 */

import {
    guiUtils
} from "../libgui/modules.js";

import {
    main,
    sevenFold,
    fourteenFold
} from './modules.js';

import {
    penroseRhombus
} from './penroseRhombus.js';

import {
    dragon
} from './dragon.js';

import {
    snowstorm
} from './snowstorm.js';

import {
    pentagons
} from './pentagons.js';

import {
    fiveFoldPentagons
} from './fiveFoldPentagons.js';

import {
    tenFoldPentagons
} from './tenFoldPentagons.js';

import {
    eightfoldOctagons
} from './eightfoldOctagons.js';

// reading JSON files
//=====================================================================

// built in examples, loading others, and selecting them
//==========================================================

export const examples = {};

examples.init = function(gui) {
    // first make the button to load json code for a tiling/fractal   
    // reading the file, parsing and adding the result
    const fileReader = new FileReader();
    var file;

    fileReader.onload = function() {
        let result = fileReader.result;
        try {
            result = JSON.parse(result);
        } catch (err) {
            alert('JSON syntax error in: ' + file.name + '\n\ncheck with https://jsonchecker.com/');
            return;
        }
        let name = file.name.split('.')[0];
        if ('name' in result) {
            name = result.name;
        }
        examples.add(name, result);
        main.newStructure();
        main.create();
        main.draw();
    };

    fileReader.onerror = function() {
        alert("Failed to read file!\n\n" + reader.error);
    };

    // make the button
    const openButton = main.gui.add({
        type: 'button',
        buttonText: 'open file with structure data'
    });
    openButton.addHelp('Open a *.json file with data for a tiling or fractal. Keyboard shortcut with the "=" - key.');
    openButton.uiElement.asFileInput('.json');
    openButton.uiElement.onFileInput = function(files) {
        file = files[0];
        fileReader.readAsText(file);
    };
    // use "=" hotkey to (re)load definition
    document.addEventListener('keyup', function(event) {
        if (event.key === '=') {
            openButton.uiElement.onClick();
        }
    }, false);

    // make the selection for tilings/fractals, and the button for downloading json code
    examples.current = sevenFold;
    examples.current = examples.ammannBeenker;
    examples.selectionController = gui.add({
        type: 'selection',
        params: examples,
        property: 'current',
        labelText: 'structure',
        options: {
            'Penrose rhombus': penroseRhombus,
            'five-fold pentagons': fiveFoldPentagons,
            'ten-fold pentagons': tenFoldPentagons,
            "Theo's seven-fold": sevenFold,
            "Theo's fourteen-fold": fourteenFold,
            'Ammann-Beenker Tiling': examples.ammannBeenker,
            'eight-fold octagons': eightfoldOctagons,
            'fractal tree': examples.tree,
            'dragon curve': dragon,
            'Sierpinsky triangle': examples.sierpinsky,
            'fractal pentagons': pentagons,
            "Koch's snowstorm": snowstorm
        },
        onChange: function() {
            main.newStructure();
            main.create();
            main.draw();
        }
    });
    examples.selectionController.add({
        type: 'button',
        buttonText: 'download',
        onClick: function() {
            const name = examples.selectionController.uiElement.getName();
            const text = JSON.stringify(examples.selectionController.getValue(), null, 2);
            guiUtils.saveTextAsFile(text, name, 'json');
        }
    }).addHelp('Choose the tiling or fractal among some examples and the definitions you have opened. You can download the choosen data.');
};

examples.add = function(name, object) {
    // uiElement is SelectValues object
    const selectValues = examples.selectionController.uiElement;
    const index = selectValues.findIndex(name);
    if (index < 0) {
        selectValues.addOption(name, object);
    } else {
        selectValues.values[index] = object;
    }
    examples.selectionController.setValueOnly(object);
};

//==============================================

examples.ammannBeenker = {
    "comment": "this is a comment, you can add more such fields, they have no effect",
    "name": "ammann-beenker",

    "order": 8,
    "inflation": 2.414,
    "maxGeneration": 4,
    "drawGeneration": 1,
    "initial": "star",

    "range": 2,

    "tiles": {
        "rhomb": {
            "color": "#0000ff",
            "shape": [
                [],
                [1],
                [1, 1],
                [0, 1]
            ],
            "angle": 1,
            "marker": [0.2, 0.2],
            "substitution": [{
                "name": "rhomb"
            }, {
                "name": "rhomb",
                "origin": [1, 1, 1, -1]
            }, {
                "name": "rhomb",
                "orientation": 6,
                "origin": [1, 1, 1]
            }, {
                "name": "RSquare",
                "orientation": 3,
                "origin": [1, 1, 0, -1]
            }, {
                "name": "RSquare",
                "orientation": 7,
                "origin": [1, 1, 1]
            }, {
                "name": "LSquare",
                "orientation": 0,
                "origin": [0, 1]
            }, {
                "name": "LSquare",
                "orientation": 4,
                "origin": [2, 1, 1, -1]
            }]
        },
        "RSquare": {
            "shape": [
                [],
                [1],
                [1, 0, 1]
            ],
            "border": [],
            "overprint": [
                [],
                [1, 0, 1]
            ],
            "substitution": [{
                "name": "rhomb",
                "orientation": 0,
                "origin": [0]
            }, {
                "name": "rhomb",
                "orientation": 2,
                "origin": [1, 1, 0, -1]
            }, {
                "name": "LSquare",
                "orientation": 0,
                "origin": [0, 1]
            }, {
                "name": "RSquare",
                "orientation": 3,
                "origin": [1, 1, 0, -1]
            }, {
                "name": "RSquare",
                "orientation": 5,
                "origin": [1, 2, 1]
            }]
        },
        "LSquare": {
            "shape": [
                [],
                [1],
                [1, 0, 1]
            ],
            "border": [],
            "overprint": [
                [],
                [1, 0, 1]
            ],
            "substitution": [{
                "name": "rhomb",
                "orientation": 7,
                "origin": [0, 1]
            }, {
                "name": "rhomb",
                "orientation": 1,
                "origin": [1, 1]
            }, {
                "name": "LSquare",
                "orientation": 3,
                "origin": [0, 1, 0, -1]
            }, {
                "name": "RSquare",
                "orientation": 0,
                "origin": [0, 1]
            }, {
                "name": "LSquare",
                "orientation": 5,
                "origin": [1, 2]
            }]
        },
        "star": {
            "color": "#ff8800",
            "shape": [
                [1],
                [1, 1],
                [0, 1],
                [0, 1, 1],
                [0, 0, 1],
                [0, 0, 1, 1],
                [0, 0, 0, 1],
                [0, 0, 0, 1, 1],
                [-1],
                [-1, -1],
                [0, -1],
                [0, -1, -1],
                [0, 0, -1],
                [0, 0, -1, -1],
                [0, 0, 0, -1],
                [1, 0, 0, -1]
            ],
            "composition": [{
                "name": "rhomb"
            }, {
                "name": "rhomb"
            }, {
                "name": "rhomb"
            }, {
                "name": "rhomb",
                "orientation": 3
            }, {
                "name": "rhomb",
                "orientation": 4
            }, {
                "name": "rhomb",
                "orientation": 5
            }, {
                "name": "rhomb",
                "orientation": 6
            }, {
                "name": "rhomb",
                "orientation": 7
            }]
        }
    }
};

examples.sierpinsky = {
    "name": "Sierpinsky triangle",
    "order": 6,
    "inflation": 2,
    "maxGeneration": 5,
    "tiles": {
        "triangle": {
            "shape": [
                [],
                [1],
                [0, 1]
            ],
            "substitution": [{
                "name": "triangle",
                "orientation": 0,
                "origin": [0]
            }, {
                "name": "triangle",
                "orientation": 0,
                "origin": [1]
            }, {
                "name": "triangle",
                "orientation": 0,
                "origin": [0, 1]
            }]
        }
    }
};

examples.tree = {
    "center": [0, 2],
    "range": 5,
    "name": "tree",
    "order": 8,
    "maxGeneration": 8,
    "drawGeneration": 5,
    "fill": false,
    "outline": false,
    "drawing": "lower in back",
    "tiles": {
        "line": {
            "shape": [
                [],
                [0, 0, 1]
            ],
            "substitution": [{
                "name": "line",
                "orientation": 7,
                "origin": [0, 0, 1],
                "size": 0.707
            }, {
                "name": "line",
                "orientation": 1,
                "origin": [0, 0, 1],
                "size": 0.707
            }]
        }
    }
};