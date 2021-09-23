/* jshint esversion: 6 */

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
        options:{'Ammann-Beenker Tiling':examples.ammannBeenker},
        onChange: function() {
console.log(examples.current);
        }
    });
};


//==============================================

examples.ammannBeenker = {
    "comment": "this is a comment, you can add more such fields, they have no effect",
    "name": "ammann-beenker",
    "attention": "this is only an mock-up, not yet tested",

    "order": 8,
    "inflation": 2.414,


    "tiles": {
        "rhomb": {
            "shape": [
                [1],
                [1, 1],
                [0, 1]
            ],
            "substitution": [{
                "name": "rhomb",
                "orientation": 0,
                "origin": [0]
            }, {
                "name": "rhomb",
                "orientation": 0,
                "origin": [1, 1, 1]
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
                [1],
                [1, 0, 1]
            ],
            "substitution": [{
                "name": "rhomb",
                "orientation": 0,
                "origin": [0]
            }, {
                "name": "rhomb",
                "orientation": 3,
                "origin": [1, 1, 0, -1]
            }, {
                "name": "LSquare",
                "orientation": 0,
                "origin": [0, 1]
            }, {
                "name": "RSquare",
                "orientation": 5,
                "origin": [1, 1]
            }, {
                "name": "LSquare",
                "orientation": 7,
                "origin": [1, 1, 1]
            }]
        },
        "LSquare": {
            "shape": [
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
                "origin": [1, 0, -1]
            }, {
                "name": "RSquare",
                "orientation": 0,
                "origin": [0, 1]
            }, {
                "name": "RSquare",
                "orientation": 5,
                "origin": [1, 2]
            }]
        }
    }
};