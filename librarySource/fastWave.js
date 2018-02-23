/**
 * fast approximations to periodic function, period of 2*PI
 * @constructor FastWave
 */

function FastWave() {
    "use strict";
    this.tableCosLike = [];
    this.tableSinLike = [];
    this.cosLikeResult = 0;
    this.sinLikeResult = 0;
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
     * Fourier expansion of the triangle function, using the number of harmonics set before, 
     *normalized (Oscillating between -1 and 1),  sin-like , is 0 for x=0
     * uses straight triangle function if nHarmonics<1
     * @function FastWave.triangleExpansionSinLike
     * @param {float} x
     * @return {float} the triangle function value
     */
    FastWave.triangleExpansionSinLike = function(x) {
        var sign = 1;
        var sum = 0;
        var tIP1;
        var maximum = 0;
        if (nHarmonics < 1) {
            return FastWave.triangleSinLike(x);
        } else {
            for (var i = 0; i < nHarmonics; i++) {
                tIP1 = 2 * i + 1;
                sum += sign * Math.sin(tIP1 * x) / tIP1 / tIP1;
                sign = -sign;
                maximum += 1 / tIP1 / tIP1;
            }
            return sum / maximum;
        }
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
    var nHarmonics = 0;
    var nIntervals = Math.round(Math.pow(2, 12));
    var nIntervalsM1 = nIntervals - 1;
    var tabFactor = nIntervals / 2 / Math.PI;
    FastWave.prototype.makeTriangleExpansionTable = function(n) {
        nHarmonics = n;
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

    /**
     * fast linear interpolation of cos-like periodic function, is 0 for x=0
     * @function FastWave#cosLike
     * @param {float} x
     * @return {float} the function value at x
     */
    FastWave.prototype.cosLike = function(x) {
        var index;
        x *= tabFactor;
        index = Math.floor(x);
        x -= index;
        index = index & nIntervalsM1;
        return this.tableCosLike[index] * (1 - x) + this.tableCosLike[index + 1] * x;
    };


    /**
     * pair of fast cos-like and sin-like function values from interpolation, result in this.sinLikeResult and this.cosLikeResult
     * @function FastWave#cosSinLike
     * @param {float} x
     */
    FastWave.prototype.cosSinLike = function(x) {
        var index;
        x *= sinTabFactor;
        index = Math.floor(x);
        x -= index;
        index = index & nSinIntervalsM1;
        this.cosLikeResult = this.tableCosLike[index] * (1 - x) + this.tableCosLike[index + 1] * x;
        this.sinLikeResult = this.tableSinLike[index] * (1 - x) + this.tableSinLike[index + 1] * x;
    };


}());
