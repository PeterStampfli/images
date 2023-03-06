/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main
} from "./main.js";

export const squareLattice = {};

// length of side of squares, number of tiles in each direction, radius for determining center tile(s)
squareLattice.side = 5;
squareLattice.nTiles = 3;
squareLattice.zeroRadius = 0.1;

// drawing for debugging, creating the automaton tiles is similar
squareLattice.draw = function() {
    if (main.drawTileLines) {
        SVG.groupAttributes.fill = 'none';
        SVG.groupAttributes.stroke = main.tileLineColor;
        SVG.createGroup(SVG.groupAttributes);
        const scale = main.scale;
        const side = scale * squareLattice.side;
        const n = Math.floor(squareLattice.nTiles / 2);
        for (let i = -n; i <= n; i++) {
            const x = (i - 0.5) * side;
            for (let j = -n; j <= n; j++) {
                // lower left corner
                const y = (j - 0.5) * side;

                const corners = [x, y, x + side, y, x + side, y + side, x, y + side];
                SVG.createPolygon(corners);

            }
        }
    }
};