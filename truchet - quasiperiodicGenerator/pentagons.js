/* jshint esversion: 6 */

export const pentagons = {
    "name": "pentagon",
    "order": 10,
    "maxGeneration": 5,
    "drawGeneration": 4,
    "center": [0, 1],
    "initial": "pentagon",
    "tiles": {
        "pentagon": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1, 0, 1]
            ],
            "substitution": [{
                "name": "pentagon",
                "size": 0.382
            }, {
                "name": "pentagon",
                "size": 0.382,
                "origin": [1],
                "orientation": 2
            }, {
                "name": "pentagon",
                "size": 0.382,
                "origin": [1, 0, 1],
                "orientation": 4
            }, {
                "name": "pentagon",
                "size": 0.382,
                "origin": [1, 0, 1, 0, 1],
                "orientation": 6
            }, {
                "name": "pentagon",
                "size": 0.382,
                "origin": [1, 0, 1, 0, 1, 0, 1],
                "orientation": 8
            }, {
                "name": "pentagon",
                "size": 0.382,
                "origin": [0, 0.618],
                "orientation": 1
            }]
        }

    }
};