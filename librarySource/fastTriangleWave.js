/*
fast approximations to Fourier expansions of a triangle wave, or other periodic functions
period of 2*PI
*/

function FastWave() {
    "use strict";
    this.tableCosLike = [];
    this.tableSinLike = [];
}

(function() {
    "use strict";

    /*
    make a table for a periodic function with a power of 2 number of intervalls
    period length is 2pi
    */
    FastWave.prototype.makeTable = function(log2NIntervals, theFunction) {
        var nIntervals = Math.round(Math.pow(2, log2NIntervals));
        this.nIntervalsM1 = nIntervals - 1;
        this.tabFactor = nIntervals / 2 / Math.PI;
        this.tableSinLike = fastMakeTable(0, 2 * Math.PI, nIntervals, theFunction);
    };

    /*
    the (static) triangle function, scaled to maximum value =1
    period 2Pi, sin-like , is 0 for x=0
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

    /*
    the (static) triangle function, scaled to maximum value =1
    period 2Pi, cos-like , is 1 for x=0
    */
    FastWave.triangleCosLike = function(x) {
        return FastWave.triangleSinLike(x + 0.5 * Math.PI);
    };

    /*
    set the number of harmonics
    */
    var nHarmonics;
    FastWave.setNHarmonics = function(n) {
        nHarmonics = n;
    };

    /*
    fourier expansion of the triangle function
    normalized (Oscillating between -1 and 1), sin-like
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

    /*
    fourier expansion of the triangle function
    normalized (Oscillating between -1 and 1), cos-like
    */
    FastWave.triangleExpansionCosLike = function(x) {
        return FastWave.triangleExpansionSinLike(x + 0.5 * Math.PI);
    };

    /* make the tables
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
     * fast sin(x)-like function from interpolation
     * @function fastSin
     * @param {float} x
     * @return {float} the sine function value at x
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
