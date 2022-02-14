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
    const initConfig = utils.center(1);
    utils.transition = utils.irreversibleTransition;
    utils.weights.push(utils.neumann(1, 1))
    utils.weights.push(utils.moore(1,1));
    utils.weights.push(utils.moore(1,1));
    utils.initialState(initConfig);
};

setups.hexagon = function() {
    const size = 100;
    const initConfig = utils.center(1);
    utils.transition = utils.reversibleTransitionAdditive;
    utils.weights.push(utils.hexagon(2, 1));
    utils.initialState(initConfig);
};