/* jshint esversion: 6 */

export const fiveFoldPentagons = {
    "name": "five-fold pentagons",

    "range": 1.3,
    "center": [0.3, 0.7],

    "order": 10,
    "inflation": 3.618,
    "maxGeneration": 4,

    "drawGeneration": 3,

    "initial": "pentagon",

    "tiles": {
        "AHalf": {
            "shape": [
                [1],
                [],
                [0, 1]
            ],
            "overprint": [
                [1],
                [0, 1]
            ],
            "angle": 1,
            "border": [],
            "color": "#0000ff",
            "substitution": [{
                "name": "A"
            }, {
                "name": "BHalf",
                "origin": [1, 1, 0, 0, -1],
                "orientation": 4
            }, {
                "name": "BHalf",
                "origin": [0, 1]
            }, {
                "name": "AHalf",
                "origin": [1, 1, 1]
            }, {
                "name": "AHalf",
                "origin": [1, 1, 0, 0, -1]
            }, {
                "name": "pentagon",
                "origin": [1, 2, 0, 0, -1],
                "orientation": 3
            }]
        },
        "A": {
            "shape": [
                [1],
                [],
                [0, 1],
                [1, 1],
                [1]
            ],
            "angle": 1,
            "border": [],
            "color": "#0000ff",
            "composition": [{
                "name": "AHalf"
            }, {
                "name": "AHalf",
                "origin": [1, 1],
                "orientation": 5
            }]
        },
        "BHalf": {
            "shape": [
                [],
                [1],
                [1, 0, 1]
            ],
            "overprint": [
                [],
                [1, 0, 1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ffff00",
            "substitution": [{
                "name": "BHalf"
            }, {
                "name": "B",
                "origin": [1, 1, 0, 0, -1]
            }, {
                "name": "B"
            }, {
                "name": "BHalf"
            }, {
                "name": "A",
                "origin": [1],
                "orientation": 1
            }, {
                "name": "AHalf",
                "origin": [1, 1, 1, 0, -1],
                "orientation": 3
            }, {
                "name": "B",
                "origin": [2, 1, 1, 0, -1],
                "orientation": 3
            }, {
                "name": "A",
                "origin": [2, 2, 1, 1, -1],
                "orientation": 5
            }, {
                "name": "BHalf"
            }, {
                "name": "BHalf",
                "origin": [1, 2, 1, 1, -1]
            }]
        },
        "B": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [0, 0, 1]
            ],
            "angle": 2,
            "color": "#ffff00",
            "composition": [{
                "name": "BHalf"
            }, {
                "name": "BHalf",
                "origin": [1, 0, 1],
                "orientation": 5
            }]
        },
        "pentagon": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [1, 0, 1, 0, 1],
                [0, 0, 0, 1]
            ],
            "color": "#ff8800",
            "substitution": [{
                "name": "B",
                "origin": [1, 1, 1, 1],
                "orientation": 1
            }, {
                "name": "B"
            }, {
                "name": "B"
            }, {
                "name": "B"
            }, {
                "name": "B"
            }, {
                "name": "B",
                "origin": [1],
                "orientation": 1
            }, {
                "name": "B",
                "origin": [2, 1, 1, 0, -1],
                "orientation": 3
            }, {
                "name": "B",
                "origin": [2, 2, 2, 1],
                "orientation": 5
            }, {
                "name": "B",
                "origin": [1, 1, 2, 2, 1],
                "orientation": 7
            }, {
                "name": "B",
                "origin": [0, 0, 1, 1, 1],
                "orientation": 9
            }, {
                "name": "B",
                "origin": [1, 1, 0, 0, -1]
            }, {
                "name": "A"
            }, {
                "name": "A"
            }, {
                "name": "BHalf"
            }, {
                "name": "B",
                "origin": [2, 2, 1, 1, -1],
                "orientation": 2
            }, {
                "name": "A"
            }, {
                "name": "A"
            }, {
                "name": "BHalf"
            }, {
                "name": "B",
                "origin": [1, 2, 2, 2],
                "orientation": 4
            }, {
                "name": "A"
            }, {
                "name": "A"
            }, {
                "name": "BHalf"
            }, {
                "name": "B",
                "origin": [0, 1, 1, 2, 1],
                "orientation": 6
            }, {
                "name": "A"
            }, {
                "name": "A"
            }, {
                "name": "BHalf"
            }, {
                "name": "B",
                "origin": [0, 0, 0, 1],
                "orientation": 8
            }, {
                "name": "A"
            }, {
                "name": "A"
            }, {
                "name": "BHalf"
            }]
        }
    }
};