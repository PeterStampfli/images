/*
fast approximations to Fourier expansions of a triangle wave, or other periodic functions
period of 2*PI
*/

/**
 * fast approximations to periodic function, period of 2*PI
 * @constructor FastWave
 */

function FastWave() {
    "use strict";
    this.tableCosLike = [];
    this.tableSinLike = [];
}

(function() {
    "use strict";

    /**
     * the (static) triangle function, scaled to maximum value =1, period 2Pi, sin-like , is 0 for x=0
     * @function FastWave.triangleSinLike
     * @param {float} x
     * @return {float} the triangle function value
     */
    FastWave.triangleSinLike = function(x) {
        var factor = 2 / Math.PI;
        x -= 2 * Math.PI * Math.floor(x * 0.5 / Math.PI);
        if (x < 0.5 * Math.PI) {
            return factor * x;
        } else if (x < 1.5 * Math.PI) {
            return factor * (Math.PI - x);
        } else {
            return factor * (x - 2 * Math.PI);
        }
    };

    /**
     * the (static) triangle function, scaled to maximum value =1, period 2Pi, cos-like , is 1 for x=0
     * @function FastWave.triangleCosLike
     * @param {float} x
     * @return {float} the triangle function value
     */
    FastWave.triangleCosLike = function(x) {
        return FastWave.triangleSinLike(x + 0.5 * Math.PI);
    };

    /**
     * set the number of (odd) harmonics for Fourier expansion
     * @function  FastWave.setNHarmonics
     * @param {integer} n - the number of harmonics, default=1
     */
    var nHarmonics=1;
    FastWave.setNHarmonics = function(n) {
        nHarmonics = n;
    };

    /**
    * Fourier expansion of the triangle function, using the number of harmonics set before, normalized (Oscillating between -1 and 1),  sin-like , is 0 for x=0
* @function FastWave.triangleExpansionSinLike
     * @param {float} x
     * @return {float} the triangle function value
    */
    FastWave.triangleExpansionSinLike = function(x) {
        var sign = 1;
        var sum = 0;
        var tIP1;
        var maximum = 0;
        for (var i = 0; i < nHarmonics; i++) {
            tIP1 = 2 * i + 1;
            sum += sign * Math.sin(tIP1 * x) / tIP1 / tIP1;
            sign = -sign;
            maximum += 1 / tIP1 / tIP1;
        }
        return sum / maximum;
    };


    /**
    * Fourier expansion of the triangle function, normalized (Oscillating between -1 and 1),  cos-like , is 1 for x=0
* @function FastWave.triangleExpansionCosLike
     * @param {float} x
     * @return {float} the triangle function value
    */
    FastWave.triangleExpansionCosLike = function(x) {
        return FastWave.triangleExpansionSinLike(x + 0.5 * Math.PI);
    };

    /** make the interpolation tables for the Fourier expansion of the triangle functions, sin and cos-like
* @function FastWave#makeTriangleExpansionTable
* @param {integer} n - number of odd harmonics
     */
    var nIntervals = Math.round(Math.pow(2, 12));
    var nIntervalsM1 = nIntervals - 1;
    var tabFactor = nIntervals / 2 / Math.PI;
   FastWave.prototype.makeTriangleExpansionTable = function(n) {
        FastWave.setNHarmonics(n);
        this.tableSinLike = fastMakeTable(0, 2 * Math.PI, nIntervals, FastWave.triangleExpansionSinLike);
        this.tableCosLike = fastMakeTable(0, 2 * Math.PI, nIntervals, FastWave.triangleExpansionCosLike);
    };

    /**
    * fast linear interpolation of sin-like periodic function, is 0 for x=0
     * @function FastWave#sinLike
     * @param {float} x
     * @return {float} the function value at x
     */
    FastWave.prototype.sinLike = function(x) {
        var index;
        x *= tabFactor;
        index = Math.floor(x);
        x -= index;
        index = index & nIntervalsM1;
        return this.tableSinLike[index] * (1 - x) + this.tableSinLike[index + 1] * x;
    };



}());
