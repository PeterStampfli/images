/* jshint esversion: 6 */

export const eightfoldOctagons = {
    "name": "eightfold octagons",

    "order": 8,
    "inflation": 3.414,
    "maxGeneration": 4,
    "drawGeneration": 3,
    "initial": "octagon",

    "range": 3,

    "tiles": {
        "rhomb": {
            "color": "#2000e0",
            "angle": 1,
            "shape": [
                [],
                [1],
                [1, 1],
                [0, 1]
            ],
            "substitution": [{
                "name": "rhomb"
            }, {
                "name": "hSquare",
                "origin": [1, 1, 0, -1],
                "orientation": 3
            }, {
                "name": "hSquare",
                "origin": [0, 1]
            }, {
                "name": "octagon",
                "origin": [1.707, 1.707]
            }, {
                "name": "hSquare",
                "origin": [2, 2, 1],
                "orientation": -1
            }, {
                "name": "rhomb",
                "origin": [2, 2, 1, -1]
            }, {
                "name": "hSquare",
                "origin": [3, 2, 1, -1],
                "orientation": 4
            }]
        },
        "hSquare": {
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
            "angle": 1,
            "substitution": [{
                "name": "rhomb"
            }, {
                "name": "hSquare",
                "origin": [1, 1, 0, -1],
                "orientation": 3
            }, {
                "name": "hSquare",
                "origin": [0, 1]
            }, {
                "name": "rhomb",
                "origin": [2, 1, 0, -1],
                "orientation": 2
            }, {
                "name": "rhomb"
            }, {
                "name": "square",
                "origin": [1, 1]
            }, {
                "name": "hSquare",
                "origin": [1, 1, 1]
            }, {
                "name": "rhomb",
                "origin": [2, 1, 1],
                "orientation": 1
            }, {
                "name": "hSquare",
                "origin": [2, 2, 1],
                "orientation": 5
            }]
        },
        "square": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [0, 0, 1]
            ],
            "angle": 2,
            "composition": [{
                "name": "hSquare"
            }, {
                "name": "hSquare",
                "origin": [1, 0, 1],
                "orientation": 4
            }]
        },
        "oct8": {
            "color": "#ce5c00",
            "angle": 1,
            "shape": [
                [],
                [1.207],
                [0.707, 0.707],
                [0, 1.207]
            ],
            "border": [
                [1.207],
                [0.707, 0.707],
                [0, 1.207]
            ],
            "overprint": [
                [1.207],
                [],
                [0, 1.207]
            ],
            "substitution": [{
                "name": "rhomb"
            }, {
                "name": "hSquare",
                "origin": [1, 1, 0, -1],
                "orientation": 3
            }, {
                "name": "hSquare",
                "origin": [0, 1]
            }, {
                "name": "square",
                "origin": [1, 1, 0, -1]
            }, {
                "name": "rhomb"
            }, {
                "name": "square",
                "origin": [1, 1, 1, -1],
                "orientation": 1
            }, {
                "name": "hSquare",
                "origin": [2, 2, 0, -1],
                "orientation": -3
            }, {
                "name": "rhomb",
                "origin": [2, 2, 1, -1],
                "orientation": 3
            }, {
                "name": "rhomb"
            }, {
                "name": "rhomb"
            }]
        },
        "octagon": {
            "color": "#00ff00",
            "shape": [
                [0.707, 0.707],
                [0, 0.707, 0.707],
                [0, 0, 0.707, 0.707],
                [-0.707, 0, 0, 0.707],
                [-0.707, -0.707],
                [0, -0.707, -0.707],
                [0, 0, -0.707, -0.707],
                [0.707, 0, 0, -0.707]
            ],
            "composition": [{
                "name": "oct8"
            }, {
                "name": "oct8"
            }, {
                "name": "oct8"
            }, {
                "name": "oct8"
            }, {
                "name": "oct8"
            }, {
                "name": "oct8"
            }, {
                "name": "oct8"
            }, {
                "name": "oct8"
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
}