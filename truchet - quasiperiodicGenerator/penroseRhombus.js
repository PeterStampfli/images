/* jshint esversion: 6 */

export const penroseRhombus = {
    "name": "Penrose rhombus",

    "range": 3,
    "center": [0, 0],

    "order": 10,
    "inflation": 1.618,
    "maxGeneration": 5,

    "drawGeneration": 4,

    "initial": "decagon",

    "tiles": {
        "ALeft": {
            "shape": [
                [],
                [0, 0, 1],
                [0, 0, 1, -1]
            ],
            "overprint": [
                [],
                [0, 0, 1, -1]
            ],
            "border": [],
            "marker": [0, 0.15],
            "color": "#0000ff",
            "substitution": [{
                "name": "ALeft",
                "origin": [1, 0, 0, 0, 1],
                "orientation": 7
            }, {
                "name": "BLeft",
                "origin": [1],
                "orientation": 3
            }]
        },
        "ARight": {
            "shape": [
                [],
                [0, 0, 0, -1],
                [0, 0, 1, -1]
            ],
            "overprint": [
                [],
                [0, 0, 1, -1]
            ],
            "border": [],
            "marker": [0, 0, 0, 0, -0.15],
            "color": "#0000ff",
            "substitution": [{
                "name": "ARight",
                "origin": [1, -1],
                "orientation": 3
            }, {
                "name": "BRight",
                "origin": [1],
                "orientation": 7
            }]
        },
        "A": {
            "shape": [
                [],
                [0, 0, 0, -1],
                [0, 0, 1, -1],
                [0, 0, 1]
            ],
            "color": "#0000ff",
            "composition": [{
                "name": "ALeft"
            }, {
                "name": "ARight",
                "orientation": 0
            }]
        },
        "BLeft": {
            "shape": [
                [],
                [0, 1],
                [0, 1, 0, 0, -1]
            ],
            "overprint": [
                [],
                [0, 1, 0, 0, -1]
            ],
            "angle": 1,
            "border": [],
            "marker": [0.15, 0.15],
            "color": "#00ff00",
            "substitution": [{
                "name": "BRight",
                "origin": [0, 1, 0, 0, -1],
                "orientation": 5
            },{
                "name": "BLeft",
                "origin": [1, 1, 0, 0, -1],
                "orientation": 4
            }, {
                "name": "ARight",
                "origin": [0, 1],
                "orientation": 1
            }]
        },
        "BRight": {
            "shape": [
                [],
                [0, 0, 0, 0, -1],
                [0, 1, 0, 0, -1]
            ],
            "overprint": [
                [],
                [0, 1, 0, 0, -1]
            ],
            "angle": 1,
            "border": [],
            "marker": [0.15, 0, 0, 0, -0.15],
            "color": "#00ff00",
            "substitution": [{
                "name": "BLeft",
                "origin": [0, 1, 0, 0, -1],
                "orientation": 5
            }, {
                "name": "BRight",
                "origin": [1, 1, 0, 0, -1],
                "orientation": 6
            }, {
                "name": "ALeft",
                "origin": [0, 0, 0, 0, -1],
                "orientation": 9
            }]
        },
        "B": {
            "shape": [
                [],
                [0, 0, 0, 0, -1],
                [0, 1, 0, 0, -1],
                [0, 1]
            ],
            "color": "#00ff00",
            "composition": [{
                "name": "BLeft"
            }, {
                "name": "BRight",
                "orientation": 0
            }]
        },
        "decagon": {
            "shape": [
                [0, 1],
                [0, 1, 0, 1],
                [0, 0, 0, 1],
                [0, 0, 0, 1, 0, 1],
                [0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 1, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]
            ],
            "color": "#ff00ff",
            "composition": [{
                "name": "B"
            }, {
                "name": "B",
                "orientation": 2
            }, {
                "name": "B",
                "orientation": 4
            }, {
                "name": "B",
                "orientation": 6
            }, {
                "name": "B",
                "orientation": 8
            }]
        }
    }
};