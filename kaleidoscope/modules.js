/* jshint esversion: 6 */

// aggregator
// import all from a common source
//===================================================

// NOTE: put dependencies in correct order
// what has to bb done loaded first has to be first

// seems that at first import of something here, all files are loaded in sequence

// so with modules that "export" global objects with
// window.something=something
// then this something does not needed to be loaded anywhere
// it is everythere present (after importing from this)
// has it to be the lowest export of all of them here?

// better not rely on this

// do not create globals without good cause

export {
    Circle
}
from "./circle.js";

export {
    circles
}
from "./circles.js";

export {
    Intersection
}
from "./intersection.js";

export {
    intersections
}
from "./intersections.js";

export {
    view
}
from "./view.js";

export {
    basic
}
from "./basic.js";

export {
    presets
}
from "./presets.js";

export {
    regions
}
from "./regions.js";

export {
    Corner
}
from "./corner.js";

export {
    Line
}
from "./line.js";

export {
    Polygon
}
from "./polygon.js";

export {
    Side
}
from "./side.js";

export {
    Fast
}
from "./fast.js";
