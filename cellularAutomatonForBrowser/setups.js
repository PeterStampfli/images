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
    const size = 200;
    const nColors = 2;
    const nStates = 4;
    const average = false;
    const maxAverage = 20;
    const minView = 4;
    const maxView = 200;
    const initConfig = utils.center(1);
    utils.setSize(size);
    utils.setNStates(nStates);
    colors.random(nColors);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.irreversibleTransition;
    utils.image = utils.linearImage;
    utils.weights.push(utils.neumann(1, 1))
    utils.weights.push(utils.moore(1,1));
    utils.weights.push(utils.moore(1,1));
    utils.setViewLimits(minView, maxView);
    utils.squareLattice(average);
    utils.initialState(initConfig);
};

setups.hexagon = function() {
    const size = 100;
    const nColors = 3;
    const nStates = 3;
    const average = false;
    const maxAverage = 20;
    const minView = 4;
    const maxView = 150;
    const initConfig = utils.center(1);
    utils.setSize(size);
    utils.setNStates(nStates);
    colors.random(nColors);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.reversibleTransitionAdditive;
    utils.image = utils.cubicImage;
    utils.weights.push(utils.rotateHexagon(2, 1));
    utils.setViewLimits(minView, maxView);
    utils.hexagonLattice(average);
    utils.initialState(initConfig);
};