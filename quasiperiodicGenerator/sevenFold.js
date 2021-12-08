/* jshint esversion: 6 */

export const sevenFold = {
    "name": "sevenfold tiling #5",

    "range": 6,
    "center": [0, 0],

    "order": 14,
    "inflation": 5.04892,
    "maxGeneration": 3,
    "drawGeneration": 1,

    "initial": "ABStar",

    "rotation": 0,

    "tiles": {
        "a1Right": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 0, 0, 1]
            ],
           "overprint": [
                [],
                [1, 0, 0, 0, 0, 0, 1]
            ],
            "angle": 3,
            "border": [],
            "color": "#ff0000",
            "marker": [0, 0, 0, 0.15],
            "substitution": [{
                "name": "b2"
            }, {
                "name": "b2Right"
            }, {
                "name": "c1Left",
                "origin": [1]
            }, {
                "name": "c1",
                "origin": [0, 0, 1]
            }, {
                "name": "a2Right",
                "origin": [0, 0, 1, 0, 1]
            }, {
                "name": "c1Right",
                "origin": [1, 0, 1, 0, 1],
                "orientation": -3
            }, {
                "name": "c1",
                "origin": [1, 1, 1],
                "orientation": -6
            }, {
                "name": "b1Left",
                "origin": [2, 1, 1, 0, 0, -1],
                "orientation": 6
            }, {
                "name": "a1"
            }, {
                "name": "b1Right",
                "origin": [1, 1, 1, 0, 0, -1, -1],
                "orientation": 6
            }]
        },
        "a1Left": {
            "shape": [
                [],
                [0, 0, 0, 1],
                [0, 0, 0, 1, -1]
            ], "overprint": [
                [],
                [0, 0, 0, 1, -1]
            ],
            "angle": 3,
            "border": [],
            "color": "#ff0000",
            "marker": [0.15],
            "substitution": [{
                "name": "b2Left"
            }, {
                "name": "b2"
            }, {
                "name": "a2Left",
                "origin": [0, 1, 0, 0, 0, 0, -1]
            }, {
                "name": "c1",
                "origin": [0, 1],
                "orientation": -1
            }, {
                "name": "c1Right",
                "origin": [0, 0, 0, 1],
                "orientation": 1
            }, {
                "name": "c1Left",
                "origin": [0, 1, 0, 1, 0, 0, -1],
                "orientation": 4
            }, {
                "name": "c1",
                "origin": [0, 1, 1, 1],
                "orientation": 5
            }, {
                "name": "a1",
                "origin": [0, 1, 1, 2, 0, 1],
                "orientation": 4
            }, {
                "name": "b1Right"
            }, {
                "name": "b1Left",
                "origin": [0, 1, 1, 1, 1, 1],
                "orientation": 10
            }]
        },
        "a1": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 1]
            ],
            "angle": 6,
            "color": "#ff0000",
            "marker": [0, 0, 0, 0.15],
            "composition": [{
                "name": "a1Right"
            }, {
                "name": "a1Left"
            }]
        },
        "a2Right": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 0, 0, 1]
            ], "overprint": [
                [],
                [1, 0, 0, 0, 0, 0, 1]
            ],
            "angle": 3,
            "border": [],
            "color": "#555555",
            "marker": [0, 0, 0, 0.15],
            "substitution": [{
                "name": "a1",
                "origin": [0, 1],
                "orientation": 8
            }, {
                "name": "b1Left",
                "origin": [1]
            }, {
                "name": "c2Left",
                "origin": [0, 1, 0, 0, 0, 1],
                "orientation": 10
            }, {
                "name": "c2",
                "origin": [0, 1, 0, 1],
                "orientation": 10
            }, {
                "name": "b3",
                "origin": [0, 1, 0, 1, 0, 1],
                "orientation": 10
            }, {
                "name": "b3Right"
            }, {
                "name": "a1Right",
                "origin": [1, 1, 0, 1],
                "orientation": 10
            }, {
                "name": "c1",
                "origin": [1, 1, 1],
                "orientation": 9
            }, {
                "name": "c1Right",
                "origin": [1, 1, 1, 0, 0, -1, -1],
                "orientation": 5
            }, {
                "name": "c1",
                "origin": [1, 1, 1],
                "orientation": 9
            }, {
                "name": "b2Left",
                "origin": [2, 1, 1, 0, 0, -1, -1],
                "orientation": 6
            }]
        },
        "a2Left": {
            "shape": [
                [],
                [0, 0, 0, 1],
                [0, 0, 0, 1, -1]
            ], "overprint": [
                [],
                [0, 0, 0, 1, -1]
            ],
            "angle": 3,
            "border": [],
            "color": "#555555",
            "marker": [0.15],
            "substitution": [{
                "name": "a1",
                "origin": [0, 0, 1],
                "orientation": 3
            }, {
                "name": "c2Right",
                "origin": [0, 0, 1, 0, 0, -1],
                "orientation": 5
            }, {
                "name": "b3Left",
                "origin": [1, 0, 1, 0, 0, -1],
                "orientation": 4
            }, {
                "name": "b3"
            }, {
                "name": "c2",
                "origin": [1, 0, 1],
                "orientation": 3
            }, {
                "name": "a1Left",
                "origin": [1, 0, 1, 1],
                "orientation": 4
            }, {
                "name": "b1Right",
                "origin": [0, 0, 0, 1],
                "orientation": 2
            }, {
                "name": "c1",
                "origin": [0, 1, 1, 1],
                "orientation": 4
            }, {
                "name": "c1Left",
                "origin": [0, 1, 1, 1, 1, 1],
                "orientation": 10
            }, {
                "name": "b2Right",
                "origin": [0, 1, 1, 2, 1, 1],
                "orientation": 10
            }]
        },
        "a2": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 1]
            ],
            "angle": 6,
            "color": "#555555",
            "marker": [0, 0, 0, 0.15],
            "composition": [{
                "name": "a2Right"
            }, {
                "name": "a2Left"
            }]
        },
        "b1Right": {
            "shape": [
                [],
                [1],
                [1, 0, 1]
            ],      "overprint": [
                [],
                [1, 0, 1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ffff00",
            "marker": [0, 0.3],
            "substitution": [{
                "name": "b2Right"
            }, {
                "name": "c1Left",
                "origin": [1]
            }, {
                "name": "c1",
                "origin": [1, 0, 1, 0, 0, -1],
                "orientation": 1
            }, {
                "name": "b1",
                "origin": [1, 1, 1, 0, 0, -1, -1],
                "orientation": 4
            }, {
                "name": "b1Right"
            }, {
                "name": "a1Right",
                "origin": [1, 1, 1],
                "orientation": -2
            }, {
                "name": "c1Right",
                "origin": [1, 1, 1, 0, 1, -1],
                "orientation": -1
            }, {
                "name": "c1",
                "origin": [1, 1, 1, 1, 1, -1, -1],
                "orientation": -4
            }, {
                "name": "b1Right"
            }, {
                "name": "c1",
                "origin": [2, 1, 1, 0, 1, -1, -1],
                "orientation": 7
            }, {
                "name": "a1"
            }, {
                "name": "b1",
                "origin": [2, 1, 1, 1, 0, -1, -1],
                "orientation": 2
            }, {
                "name": "b1Left",
                "origin": [2, 1, 2, 0, 0, -1, -1],
                "orientation": 2
            }, {
                "name": "a1"
            }, {
                "name": "c1",
                "origin": [2, 2, 2, 1, 0, -1, -1],
                "orientation": 4
            }, {
                "name": "c1Right",
                "origin": [3, 2, 2, 1, 1, -1, -1],
                "orientation": 7
            }, {
                "name": "b2Left",
                "origin": [3, 2, 3, 1, 1, -1, -1],
                "orientation": -6
            }]
        },
        "b1Left": {
            "shape": [
                [],
                [0, 1],
                [0, 1, 0, 0, 0, 0, -1]
            ], "overprint": [
                [],
                [0, 1, 0, 0, 0, 0, -1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ffff00",
            "marker": [0.3],
            "substitution": [{
                "name": "b2Left"
            }, {
                "name": "c1Right",
                "origin": [0, 1],
                "orientation": -1
            }, {
                "name": "c1",
                "origin": [0, 1, 0, 1, 0, 0, -1],
                "orientation": -4
            }, {
                "name": "a1Left",
                "origin": [1, 1, 0, 0, 0, 0, -1]
            }, {
                "name": "b1Left",
                "origin": [1, 1, 1, 1, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "b1"
            }, {
                "name": "c1Left",
                "origin": [1, 1, 0, 1, -1, 0, -1]
            }, {
                "name": "a1",
                "origin": [1, 2, 1, 1, -1, 0, -1],
                "orientation": -2
            }, {
                "name": "c1"
            }, {
                "name": "b1Left",
                "origin": [1, 1, 1, 1, -1, -1, -1]
            }, {
                "name": "c1"
            }, {
                "name": "b1",
                "origin": [1, 2, 1, 1, 0, -1, -1],
                "orientation": -3
            }, {
                "name": "a1",
                "origin": [1, 2, 1, 1, 0, 0, -2],
                "orientation": 6
            }, {
                "name": "b1Right"
            }, {
                "name": "c1",
                "origin": [2, 2, 1, 1, 0, -1, -2],
                "orientation": 7
            }, {
                "name": "c1Left",
                "origin": [2, 3, 1, 1, -1, -1, -2],
                "orientation": 6
            }, {
                "name": "b2Right",
                "origin": [2, 3, 1, 1, -1, -1, -3],
                "orientation": 6
            }]
        },
        "b1": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [0, 0, 1]
            ],
            "angle": 2,
            "color": "#ffff00",
            "marker": [0, 0.3],
            "composition": [{
                "name": "b1Right"
            }, {
                "name": "b1Left"
            }]
        },
        "b2Right": {
            "shape": [
                [],
                [1],
                [1, 0, 1]
            ],"overprint": [
                [],
                [1, 0, 1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ff8800",
            "marker": [0, 0.3],
            "substitution": [{
                "name": "b3Left"
            }, {
                "name": "c2Right",
                "origin": [0, 1],
                "orientation": -1
            }, {
                "name": "a1Left",
                "origin": [0, 1, 0, 0, 0, 0, -1]
            }, {
                "name": "c1",
                "origin": [0, 1, 0, 1, -1, 0, -1]
            }, {
                "name": "c1",
                "origin": [1, 2, 0, 1, -1, 0, -1],
                "orientation": 4
            }, {
                "name": "a1",
                "origin": [1, 1, 0, 1, 0, 0, -1],
                "orientation": 1
            }, {
                "name": "b1Right",
                "origin": [0, 2, 0, 1, 0, 0, -1]
            }, {
                "name": "b2",
                "origin": [1, 2, 0, 1, -1, 0, -2],
                "orientation": 2
            }, {
                "name": "b2"
            }, {
                "name": "b2Right"
            }, {
                "name": "c1",
                "origin": [1, 2, 0, 1, 0, 0, -2],
                "orientation": 2
            }, {
                "name": "c1Left",
                "origin": [1, 2, 1, 1, -1, 0, -2],
                "orientation": 2
            }, {
                "name": "c1Left",
                "origin": [1, 2, 1, 2, 0, 0, -2],
                "orientation": 8
            }, {
                "name": "c1"
            }, {
                "name": "b1Left",
                "origin": [2, 2, 2, 2, 0, 0, -2],
                "orientation": 8
            }, {
                "name": "a1"
            }, {
                "name": "b1Right",
                "origin": [2, 3, 1, 2, 0, 0, -2],
                "orientation": 8
            }]
        },
        "b2Left": {
            "shape": [
                [],
                [0, 1],
                [0, 1, 0, 0, 0, 0, -1]
            ], "overprint": [
                [],
                [0, 1, 0, 0, 0, 0, -1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ff8800",
            "marker": [0.3],
            "substitution": [{
                "name": "b3Right"
            }, {
                "name": "c2Left",
                "origin": [1]
            }, {
                "name": "a1Right",
                "origin": [1, 0, 1],
                "orientation": -2
            }, {
                "name": "c1",
                "origin": [1, 0, 1, 0, 1, -1],
                "orientation": -3
            }, {
                "name": "c1",
                "origin": [2, 1, 1, 0, 1, -1],
                "orientation": 7
            }, {
                "name": "b2Left",
                "origin": [2, 1, 2, 0, 1, -1],
                "orientation": 8
            }, {
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "c1",
                "origin": [2, 1, 2, 0, 0, -1],
                "orientation": 9
            }, {
                "name": "c1Right",
                "origin": [2, 1, 2, 0, 1, -1, -1],
                "orientation": 11
            }, {
                "name": "b1Left",
                "origin": [2, 0, 1, 0, 0, -1]
            }, {
                "name": "a1",
                "origin": [1, 1, 1, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "c1",
                "origin": [2, 1, 2, 0, 0, -2, -1],
                "orientation": 1
            }, {
                "name": "c1Right"
            }, {
                "name": "a1",
                "origin": [2, 2, 2, 0, 0, -2, -2]
            }, {
                "name": "b1Right"
            }, {
                "name": "b1Left",
                "origin": [3, 2, 2, 0, 0, -2, -1],
                "orientation": 6
            }]
        },
        "b2": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [0, 0, 1]
            ],
            "angle": 2,
            "color": "#ff8800",
            "marker": [0, 0.3],
            "composition": [{
                "name": "b2Right"
            }, {
                "name": "b2Left"
            }]
        },
        "b3Right": {
            "shape": [
                [],
                [1],
                [1, 0, 1]
            ], "overprint": [
                [],
                [1, 0, 1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ffffff",
            "marker": [0, 0.3],
            "substitution": [{
                "name": "b1Left"
            }, {
                "name": "c2Left",
                "origin": [0, 1, 0, 1, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "c2"
            }, {
                "name": "b2Right"
            }, {
                "name": "a1",
                "origin": [1, 1, 1, 0, 0, 0, -1],
                "orientation": 3
            }, {
                "name": "c2Right",
                "origin": [1, 1, 1, 0, 0, -1, -1],
                "orientation": 5
            }, {
                "name": "b3Left",
                "origin": [2, 1, 1, 0, 0, -1, -1],
                "orientation": 2
            }, {
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "c2",
                "origin": [2, 1, 1, 0, 0, 0, -1],
                "orientation": 3
            }, {
                "name": "a1",
                "origin": [2, 1, 1, 1, 0, 0, -1],
                "orientation": 1
            }, {
                "name": "c2",
                "origin": [2, 1, 1, 1, 0, -1, -1],
                "orientation": 1
            }, {
                "name": "a1Left",
                "origin": [2, 2, 1, 1, 0, -1, -1],
                "orientation": 2
            }, {
                "name": "b1Right",
                "origin": [1, 2, 1, 1, 0, 0, -1]
            }, {
                "name": "c1",
                "origin": [2, 2, 2, 1, 0, 0, -1],
                "orientation": 9
            }, {
                "name": "c1Right"
            }, {
                "name": "b2Right",
                "origin": [2, 3, 2, 2, 0, 0, -2],
                "orientation": 8
            }]
        },
        "b3Left": {
            "shape": [
                [],
                [0, 1],
                [0, 1, 0, 0, 0, 0, -1]
            ],"overprint": [
                [],
                [0, 1, 0, 0, 0, 0, -1]
            ],
            "angle": 1,
            "border": [],
            "color": "#ffffff",
            "marker": [0.3],
            "substitution": [{
                "name": "b1Right"
            }, {
                "name": "b2Left",
                "origin": [1, 0, 1, 0, 0, -1],
                "orientation": 0
            }, {
                "name": "c2"
            }, {
                "name": "c2Right"
            }, {
                "name": "a1",
                "origin": [1, 1, 1, 0, 0, 0, -1],
                "orientation": 6
            }, {
                "name": "b3",
                "origin": [1, 2, 1, 1, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "b3"
            }, {
                "name": "b3Right"
            }, {
                "name": "c2Left",
                "origin": [1, 1, 1, 1, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "c2",
                "origin": [1, 2, 1, 0, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "c2",
                "origin": [1, 2, 1, 1, 0, -1, -1],
                "orientation": 10
            }, {
                "name": "a1",
                "origin": [1, 2, 1, 0, 0, -1, -1],
                "orientation": 8
            }, {
                "name": "a1Right",
                "origin": [2, 2, 1, 1, 0, -1, -1],
                "orientation": 10
            }, {
                "name": "b1Left",
                "origin": [2, 1, 1, 0, 0, -1, -1]
            }, {
                "name": "c1Left",
                "origin": [2, 2, 1, 0, 0, -1, -2]
            }, {
                "name": "c1"
            }, {
                "name": "b2Left",
                "origin": [3, 2, 2, 0, 0, -2, -2],
                "orientation": 6
            }]
        },
        "b3": {
            "shape": [
                [],
                [1],
                [1, 0, 1],
                [0, 0, 1]
            ],
            "angle": 2,
            "color": "#ffffff",
            "marker": [0, 0.3],
            "composition": [{
                "name": "b3Right"
            }, {
                "name": "b3Left"
            }]
        },
        "c1Right": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 1]
            ],"overprint": [
                [],
                [1, 0, 0, 0, 1]
            ],
            "angle": 2,
            "border": [],
            "color": "#00ff00",
            "marker": [0, 0, 0.2],
            "substitution": [{
                "name": "b2"
            }, {
                "name": "c1Left",
                "origin": [1]
            }, {
                "name": "c1Right",
                "origin": [0, 0, 1]
            }, {
                "name": "c1",
                "origin": [1, 1, 1],
                "orientation": 8
            }, {
                "name": "c1",
                "origin": [1, 1, 1]
            }, {
                "name": "c1",
                "origin": [1, 0, 1, 0, 1],
                "orientation": -3
            }, {
                "name": "b1Right"
            }, {
                "name": "c1",
                "origin": [1, 1, 1, 1, 1],
                "orientation": -4
            }, {
                "name": "c1Left",
                "origin": [2, 1, 1, 1, 2],
                "orientation": -5
            }, {
                "name": "b2",
                "origin": [2, 1, 2, 1, 2],
                "orientation": -5
            }, {
                "name": "c1Right",
                "origin": [2, 1, 2, 1, 1],
                "orientation": -5
            }, {
                "name": "c1",
                "origin": [2, 1, 1, 1, 1, 0, -1],
                "orientation": 6
            }, {
                "name": "b1Right",
                "origin": [1, 1, 1, 0, 0, -1, -1],
                "orientation": 6
            }, {
                "name": "b1",
                "origin": [2, 1, 1, 0, 0, -1],
                "orientation": 5
            }, {
                "name": "a1"
            }, {
                "name": "a1"
            }, {
                "name": "b1",
                "origin": [2, 1, 1, 0, 0, 0, -1],
                "orientation": 4
            }, {
                "name": "b1Left",
                "origin": [2, 1, 1, 0, 1, -1, -1],
                "orientation": 4
            }, {
                "name": "a1"
            }]
        },
        "c1Left": {
            "shape": [
                [],
                [0, 0, 1],
                [0, 0, 1, 0, 0, -1]
            ], "overprint": [
                [],
                [0, 0, 1, 0, 0, -1]
            ],
            "angle": 2,
            "border": [],
            "color": "#00ff00",
            "marker": [0.2],
            "substitution": [{
                "name": "b2"
            }, {
                "name": "c1Left",
                "origin": [1]
            }, {
                "name": "c1Right",
                "origin": [0, 0, 1]
            }, {
                "name": "c1",
                "origin": [1, 1, 1],
                "orientation": 4
            }, {
                "name": "c1",
                "origin": [1, 1, 1],
                "orientation": -2
            }, {
                "name": "b1Left",
                "origin": [1, 1, 1, 1, 1],
                "orientation": 9
            }, {
                "name": "a1",
                "origin": [1, 1, 2, 0, 1],
                "orientation": 3
            }, {
                "name": "b1"
            }, {
                "name": "a1"
            }, {
                "name": "b1",
                "origin": [1, 1, 2, 1],
                "orientation": 10
            }, {
                "name": "a1",
                "origin": [1, 1, 2, 1, 1, -1],
                "orientation": 5
            }, {
                "name": "b1Right"
            }, {
                "name": "c1",
                "origin": [1, 1, 2, 1, 0, -1, -1],
                "orientation": 6
            }, {
                "name": "b1Left",
                "origin": [1, 0, 1, 0, 0, -1]
            }, {
                "name": "c1"
            }, {
                "name": "c1",
                "origin": [1, 1, 1, 0, 0, -1, -1],
                "orientation": 2
            }, {
                "name": "c1Right",
                "origin": [1, 1, 2, 0, 0, -2, -1],
                "orientation": 5
            }, {
                "name": "c1Left",
                "origin": [2, 1, 2, 0, 0, -1, -1],
                "orientation": 5
            }, {
                "name": "b2",
                "origin": [2, 1, 2, 0, 0, -2, -1],
                "orientation": 5
            }]
        },
        "c1": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 1],
                [0, 0, 0, 0, 1]
            ],
            "angle": 4,
            "color": "#00ff00",
            "marker": [0, 0, 0.2],
            "composition": [{
                "name": "c1Right"
            }, {
                "name": "c1Left"
            }]
        },
        "c2Right": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 1]
            ], "overprint": [
                [],
                [1, 0, 0, 0, 1]
            ],
            "angle": 2,
            "border": [],
            "color": "#0000ff",
            "marker": [0, 0, 0.2],
            "substitution": [{
                "name": "b3Left"
            }, {
                "name": "b3Right"
            }, {
                "name": "c2",
                "origin": [0, 1],
                "orientation": -1
            }, {
                "name": "a1Left",
                "origin": [0, 1, 0, 0, 0, 0, -1]
            }, {
                "name": "a1Right",
                "origin": [0, 1, 0, 1],
                "orientation": -1
            }, {
                "name": "c1",
                "origin": [0, 1, 0, 1, -1, 0, -1]
            }, {
                "name": "b1",
                "origin": [0, 1, 0, 1, 0, 1, -1],
                "orientation": -2
            }, {
                "name": "c1Right"
            }, {
                "name": "c1",
                "origin": [1, 2, 0, 1, 0, 1, -1],
                "orientation": 4
            }, {
                "name": "c1"
            }, {
                "name": "c1"
            }, {
                "name": "b1Left",
                "origin": [1, 2, 0, 2, 1, 1, -1],
                "orientation": 9
            }, {
                "name": "a1",
                "origin": [1, 2, 1, 1, 1, 1, -1],
                "orientation": 3
            }, {
                "name": "b1"
            }, {
                "name": "a1"
            }, {
                "name": "b1Right",
                "origin": [1, 2, 1, 2, 0, 1, -1],
                "orientation": 10
            }, {
                "name": "c1",
                "origin": [1, 2, 0, 1, -1, 0, -1],
                "orientation": 4
            }, {
                "name": "b2",
                "origin": [1, 2, 0, 1, -1, 0, -2],
                "orientation": 4
            }, {
                "name": "b2Right"
            }, {
                "name": "c1Left",
                "origin": [1, 2, 0, 1, 0, 0, -2],
                "orientation": 4
            }]
        },
        "c2Left": {
            "shape": [
                [],
                [0, 0, 1],
                [0, 0, 1, 0, 0, -1]
            ],"overprint": [
                [],
                [0, 0, 1, 0, 0, -1]
            ],
            "angle": 2,
            "border": [],
            "color": "#0000ff",
            "marker": [0.2],
            "substitution": [{
                    "name": "b3Left"
                }, {
                    "name": "b3Right"
                }, {
                    "name": "c2",
                    "origin": [0, 1],
                    "orientation": -1
                }, {
                    "name": "a1Left",
                    "origin": [0, 1, 0, 0, 0, 0, -1]
                }, {
                    "name": "a1Right",
                    "origin": [0, 1, 0, 1],
                    "orientation": -1
                }, {
                    "name": "c1Left",
                    "origin": [0, 1, 0, 1, -1, 0, -1]
                }, {
                    "name": "b1"
                }, {
                    "name": "c1",
                    "origin": [0, 1, 0, 1, 0, 1, -1],
                    "orientation": -2
                }, {
                    "name": "c1",
                    "origin": [0, 2, 1, 1, 0, 1, -1],
                    "orientation": -6
                }, {
                    "name": "b2Left",
                    "origin": [0, 2, 1, 2, 0, 1, -1],
                    "orientation": 9
                }, {
                    "name": "b2"
                }, {
                    "name": "c1Right",
                    "origin": [0, 2, 1, 2, 0, 0, -1],
                    "orientation": -4
                }, {
                    "name": "c1",
                    "origin": [0, 2, 1, 1, -1, 0, -1]
                }, {
                    "name": "c1"
                }, {
                    "name": "c1"
                }, {
                    "name": "b1",
                    "origin": [1, 2, 1, 1, -1, -1, -1],
                    "orientation": 5
                }, {
                    "name": "a1"
                }, {
                    "name": "a1"
                }, {
                    "name": "b1Right",
                    "origin": [0, 2, 1, 1, -1, -1, -2],
                    "orientation": 6
                }, {
                    "name": "b1Left",
                    "origin": [1, 2, 1, 1, -1, 0, -2],
                    "orientation": 5
                }

            ]
        },
        "c2": {
            "shape": [
                [],
                [1],
                [1, 0, 0, 0, 1],
                [0, 0, 0, 0, 1]
            ],
            "angle": 4,
            "color": "#0000ff",
            "marker": [0, 0, 0.2],
            "composition": [{
                "name": "c2Right"
            }, {
                "name": "c2Left"
            }]
        },
        "ABStar": {
            "shape": [
                [1, 1],
                [1, 1, 1],
                [0, 1, 1],
                [0, 1, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 1, 1, 1],
                [0, 0, 0, 1, 1],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 1, 1],
                [-1, 0, 0, 0, 0, 1, 1],
                [-1, 0, 0, 0, 0, 0, 1],
                [-1, -1, 0, 0, 0, 0, 1],
                [-1, -1, 0, 0, 0, 0, 0],
                [-1, -1, -1, 0, 0, 0, 0],
                [0, -1, -1, 0, 0, 0, 0],
                [0, -1, -1, -1, 0, 0, 0],
                [0, 0, -1, -1, 0, 0, 0],
                [0, 0, -1, -1, -1, 0, 0],
                [0, 0, 0, -1, -1, 0, 0],
                [0, 0, 0, -1, -1, -1, 0],
                [0, 0, 0, 0, -1, -1, 0],
                [0, 0, 0, 0, -1, -1, -1],
                [0, 0, 0, 0, 0, -1, -1],
                [1, 0, 0, 0, 0, -1, -1],
                [1, 0, 0, 0, 0, 0, -1],
                [1, 1, 0, 0, 0, 0, -1]
            ],
            "color": "#00dd00",
            "composition": [{
                "name": "a1",
                "origin": [1],
                "orientation": 1
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [0, 1]
            }, {
                "name": "a1",
                "origin": [0, 0, 1],
                "orientation": 3
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [0, 0, 0, 1],
                "orientation": 2
            }, {
                "name": "a1",
                "origin": [0, 0, 0, 0, 1],
                "orientation": 5
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [0, 0, 0, 0, 0, 1],
                "orientation": 4
            }, {
                "name": "a1",
                "origin": [0, 0, 0, 0, 0, 0, 1],
                "orientation": 7
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [-1],
                "orientation": 6
            }, {
                "name": "a1",
                "origin": [0, -1],
                "orientation": 9
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [0, 0, -1],
                "orientation": 8
            }, {
                "name": "a1",
                "origin": [0, 0, 0, -1],
                "orientation": 11
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [0, 0, 0, 0, -1],
                "orientation": 10
            }, {
                "name": "a1",
                "origin": [0, 0, 0, 0, 0, -1],
                "orientation": 13
            }, {
                "name": "a1"
            }, {
                "name": "b1"
            }, {
                "name": "b1",
                "origin": [0, 0, 0, 0, 0, 0, -1],
                "orientation": 12
            }]
        },
        "B2C1Star": {
            "color": "#000088",
            "shape": [
                [1, 0, 1, 0, 0, -1],
                [1, 0, 1],
                [1, 0, 1, 0, 1],
                [0, 0, 1, 0, 1],
                [0, 0, 1, 0, 1, 0, 1],
                [0, 0, 0, 0, 1, 0, 1],
                [0, -1, 0, 0, 1, 0, 1],
                [0, -1, 0, 0, 0, 0, 1],
                [0, -1, 0, -1, 0, 0, 1],
                [0, -1, 0, -1],
                [0, -1, 0, -1, 0, -1],
                [0, 0, 0, -1, 0, -1],
                [1, 0, 0, -1, 0, -1],
                [1, 0, 0, 0, 0, -1]
            ],
            "composition": [{
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "b2"
            }, {
                "name": "c1",
                "origin": [1],
                "orientation": -2
            }, {
                "name": "c1",
                "origin": [0, 0, 1],
                "orientation": 0
            }, {
                "name": "c1",
                "origin": [0, 0, 0, 0, 1],
                "orientation": 2
            }, {
                "name": "c1",
                "origin": [0, 0, 0, 0, 0, 0, 1],
                "orientation": 4
            }, {
                "name": "c1",
                "origin": [0, -1],
                "orientation": 6
            }, {
                "name": "c1",
                "origin": [0, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "c1",
                "origin": [0, 0, 0, 0, 0, -1],
                "orientation": 10
            }]
        },
        "B3C2Star": {
            "color": "#000088",
            "shape": [
                [1, 0, 1, 0, 0, -1],
                [1, 0, 1],
                [1, 0, 1, 0, 1],
                [0, 0, 1, 0, 1],
                [0, 0, 1, 0, 1, 0, 1],
                [0, 0, 0, 0, 1, 0, 1],
                [0, -1, 0, 0, 1, 0, 1],
                [0, -1, 0, 0, 0, 0, 1],
                [0, -1, 0, -1, 0, 0, 1],
                [0, -1, 0, -1],
                [0, -1, 0, -1, 0, -1],
                [0, 0, 0, -1, 0, -1],
                [1, 0, 0, -1, 0, -1],
                [1, 0, 0, 0, 0, -1]
            ],
            "composition": [{
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "b3"
            }, {
                "name": "c2",
                "origin": [1],
                "orientation": -2
            }, {
                "name": "c2",
                "origin": [0, 0, 1],
                "orientation": 0
            }, {
                "name": "c2",
                "origin": [0, 0, 0, 0, 1],
                "orientation": 2
            }, {
                "name": "c2",
                "origin": [0, 0, 0, 0, 0, 0, 1],
                "orientation": 4
            }, {
                "name": "c2",
                "origin": [0, -1],
                "orientation": 6
            }, {
                "name": "c2",
                "origin": [0, 0, 0, -1],
                "orientation": 8
            }, {
                "name": "c2",
                "origin": [0, 0, 0, 0, 0, -1],
                "orientation": 10
            }]
        },
        "B1C2Star": {
            "color": "#000088",
            "shape": [
                [1, 0, 1, 0, 0, -1],
                [1, 0, 1],
                [1, 0, 1, 0, 1],
                [0, 0, 1, 0, 1],
                [0, 0, 1, 0, 1, 0, 1],
                [0, 0, 0, 0, 1, 0, 1],
                [0, -1, 0, 0, 1, 0, 1],
                [0, -1, 0, 0, 0, 0, 1],
                [0, -1, 0, -1, 0, 0, 1],
                [0, -1, 0, -1],
                [0, -1, 0, -1, 0, -1],
                [0, 0, 0, -1, 0, -1],
                [1, 0, 0, -1, 0, -1],
                [1, 0, 0, 0, 0, -1]
            ],
            "composition": [{
                "name": "b1"
            }, {
                "name": "b1"
            }, {
                "name": "b1"
            }, {
                "name": "b1"
            }, {
                "name": "b1"
            }, {
                "name": "b1"
            }, {
                "name": "b1"
            }, {
                "name": "c2",
                "origin": [1, 0, 1, 0, 0, -1],
                "orientation": 5
            }, {
                "name": "c2",
                "origin": [1, 0, 1, 0, 1],
                "orientation": 7
            }, {
                "name": "c2",
                "origin": [0, 0, 1, 0, 1, 0, 1],
                "orientation": 9
            }, {
                "name": "c2",
                "origin": [0, -1, 0, 0, 1, 0, 1],
                "orientation": 11
            }, {
                "name": "c2",
                "origin": [0, -1, 0, -1, 0, 0, 1],
                "orientation": -1
            }, {
                "name": "c2",
                "origin": [0, -1, 0, -1, 0, -1],
                "orientation": 1
            }, {
                "name": "c2",
                "origin": [1, 0, 0, -1, 0, -1],
                "orientation": 3
            }]
        }
    }
};