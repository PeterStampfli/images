/* jshint esversion: 6 */

export const snowstorm={
    "name": "Koch's snowstorm",
    "order": 6,
    "inflation": 3,
    "maxGeneration": 6,
    "drawGeneration": 4,
    "center": [0, 1],
    "initial": "hexagon",
    "tiles": {
        "hexagon": {
            "shape": [
                [],
                [1],
                [1, 1],
                [1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1, 1]
            ],
            "substitution": [{
                "name": "hexagon",
                "origin": [1]
            }, {
                "name": "hexagon",
                "origin": [2, 1]
            }, {
                "name": "hexagon",
                "origin": [2,2, 1]
            }, {
                "name": "hexagon",
                "origin": [2,2,2, 1]
            }, {
                "name": "hexagon",
                "origin": [2,2,2,2, 1]
            }, {
                "name": "hexagon",
                "origin": [2,2,2,2,2, 1]
            }]
        }
    }
};