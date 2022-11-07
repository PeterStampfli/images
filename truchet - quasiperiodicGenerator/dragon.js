/* jshint esversion: 6 */

export const dragon={
    "name": "dragon",
    "range": 2,
    "center": [0.5, 0],
    "order": 8,
    "maxGeneration": 15,
    "drawGeneration": 11,
    "fill": false,
    "outline": false,
    "tiles": {
        "line": {
            "shape": [
                [],
                [1]
            ],
            "marker":[0.5,0,-0.1],
            "substitution": [{
                "name": "line",
                "orientation": 3,
                "origin": [0.5,0,-0.5],
                "size": 0.707
            }, {
                "name": "line",
                "orientation": 1,
                "origin": [0.5,0,-0.5],
                "size": 0.707
            }]
        }
    }
};