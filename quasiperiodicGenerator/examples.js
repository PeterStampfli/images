/* jshint esversion: 6 */

import {
    guiUtils
} from "../libgui/modules.js";

import {
    main
} from './modules.js';

export const examples = {};

examples.init = function(gui) {
    examples.current = examples.ammannBeenker;
    examples.selectionController = gui.add({
        type: 'selection',
        params: examples,
        property: 'current',
        labelText:'structure',
        options: {
            'Ammann-Beenker Tiling': examples.ammannBeenker,
            'Sierpinsky triangle':examples.sierpinsky,
            'fractal tree':examples.tree
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
            guiUtils.saveTextAsFile(text, name);
        }
    });
};

examples.add = function(name, object) {
    examples.selectionController.uiElement.addOption(name, object);
    examples.selectionController.setValueOnly(object);
};

//==============================================

examples.ammannBeenker = {
    "comment": "this is a comment, you can add more such fields, they have no effect",
    "name": "ammann-beenker",
    "attention": "this is only an mock-up, not yet tested",

    "order": 8,
    "inflation": 2.414,
    "minSize": 0,
    "maxGeneration": 5,

    "tiles": {
        "rhomb": {
            color: '#0000ff',
            "shape": [
                [],
                [1],
                [1, 1],
                [0, 1]
            ],
            "substitution": [{
                "name": "rhomb",
                "orientation": 0,
                "origin": [0],
                size: 1
            }, {
                "name": "rhomb",
                "orientation": 0,
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
                [1, 0, 0 ,- 1]
            ],
            "substitution": [{
                "name": "rhomb",
                "orientation": 0,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 1,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 2,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 3,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 4,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 5,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 6,
                "origin": []
            }, {
                "name": "rhomb",
                "orientation": 7,
                "origin": []
            }]
        }

    }
};

examples.sierpinsky={
    "name": "Sierpinsky triangle",
    "order": 6,
    "inflation": 2,
    "maxGeneration":5,
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
            },
            {
                "name": "triangle",
                "orientation": 0,
                "origin": [1]
            },
            {
                "name": "triangle",
                "orientation": 0,
                "origin": [0,1]
            }]
        }
    }
}

examples.tree={
    "name": "tree",

    "order": 8,
    "inflation": 1,
    "maxGeneration": 8,

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
                },
                {
                    "name": "final",
                    "orientation": 0,
                    "origin": []
                }
            ]
        },
        "final": {
            "shape": [
                [],
                [0, 0, 1]
            ],
            "color": "#000000",
            "substitution": [{
                "name": "final",
                "orientation": 0,
                "origin": []
            }]
        }
    }
}