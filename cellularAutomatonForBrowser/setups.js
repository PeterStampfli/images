/* jshint esversion: 6 */

import {
    utils,
    colors,
    main
} from "./modules.js";

export const setups={};

setups.reset=function(){

setups.hexagon();

};

//=========
setups.neumann = function() {
    const average = false;
    const maxAverage = 20;
    const initConfig = utils.center(1);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.irreversibleTransition;
    utils.image = utils.linearImage;
    utils.weights.push(utils.neumann(1, 1))
    utils.weights.push(utils.moore(1,1));
    utils.weights.push(utils.moore(1,1));
    utils.squareLattice(average);
    utils.initialState(initConfig);
};

setups.hexagon = function() {
    const size = 100;
    const average = false;
    const maxAverage = 20;
    const initConfig = utils.center(1);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.reversibleTransitionAdditive;
    utils.image = utils.cubicImage;
    utils.weights.push(utils.hexagon(2, 1));
    utils.hexagonLattice(average);
    utils.initialState(initConfig);
};