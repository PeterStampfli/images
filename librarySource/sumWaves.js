/**
 * fast sum of waves for generating quasiperiodic wallpapers
 * @namespace sumWaves
 */
/* jshint esversion:6 */


sumWaves = {};



(function() {
    "use strict";

    const unitVectorsX = [];
    const unitVectorsY = [];
    const positionTimesUnitvectors = [];

    /**
     * dimension of embedding space
     * @name sumWaves.dimSpace
     */

    /**
     * rotational symmetry
     * @name sumWaves.rotSymmetry
     */

    /**
     * set the rotational symmetry
     * fixes parameters, array lengths, data and sums
     * @method sumWaves.setRotationalSymmetry
     * @param {integer} rotSymmetry
     */
    sumWaves.setRotationalSymmetry = function(rotSymmetry) {
        sumWaves.rotSymmetry = rotSymmetry;
        sumWaves.oddRotSymmetry = ((rotSymmetry & 1) === 1);
        var factor;
        if (sumWaves.oddRotSymmetry) {
            sumWaves.dimSpace = rotSymmetry;
            factor = 2 * Math.PI / sumWaves.dimSpace;
        } else {
            sumWaves.dimSpace = Math.floor(rotSymmetry / 2);
            factor = Math.PI / sumWaves.dimSpace;
        }
        if (unitVectorsX.length < sumWaves.dimSpace) {
            unitVectorsX.length = sumWaves.dimSpace;
            unitVectorsY.length = sumWaves.dimSpace;
            positionTimesUnitvectors.length = sumWaves.dimSpace;
        }
        for (var i = 0; i < sumWaves.dimSpace; i++) {
            unitVectorsX[i] = Math.cos(factor * i);
            unitVectorsY[i] = Math.sin(factor * i);
            console.log(i + " " + unitVectorsX[i] + " " + unitVectorsY[i]);
        }
    };

    /**
     * prepare scalar products between position and unitVectors
     * @method sumWaves.calculatePositionTimesUnitvectors
     * @param {float} x
     * @param {float} y
     */
    sumWaves.calculatePositionTimesUnitvectors = function(x, y) {
        for (var i = 0; i < sumWaves.dimSpace; i++) {
            positionTimesUnitvectors[i] = x * unitVectorsX[i] + y * unitVectorsY[i];
        }
    };


    /**
     * sum of cosine wave package with single nonzero k-component
     * @method sumWaves.cosines1
     * @param {float} k - wavevector component
     * @return {float} sum (cos(kx))
     */
    sumWaves.cosines1 = function(k) {
        let sum = 0;
        for (var i = 0; i < sumWaves.dimSpace; i++) {
            sum += Fast.cos(k * positionTimesUnitvectors[i]);
        }
        return sum;
    };



    /**
     * sum of alternating cosine wave package with single nonzero k-component
     * for 2-color symmetry with even rotational symmetry
     * @method sumWaves.alternatingCosines1
     * @param {float} k - wavevector component
     * @return {float} sum (cos(kx))
     */
    sumWaves.alternatingCosines1 = function(k) {
        let sum = 0;
        for (var i = 0; i < sumWaves.dimSpace; i += 2) {
            sum += Fast.cos(k * positionTimesUnitvectors[i]) - Fast.cos(k * positionTimesUnitvectors[i + 1]);
        }
        return sum;
    };

    /**
     * sum of sine wave package with single nonzero k-component
     * @method sumWaves.cosines1
     * @param {float} k - wavevector component
     * @return {float} sum (sin(kx))
     */
    sumWaves.sines1 = function(k) {
        let sum = 0;
        for (var i = 0; i < sumWaves.dimSpace; i++) {
            sum += Fast.sin(k * positionTimesUnitvectors[i]);
        }
        return sum;
    };

    /**
     * sum of cosine wave package with two nonzero k-components for odd rotational symmetry
     * @method sumWaves.cosines2Odd
     * @param {float} k1 - wavevector component
     * @param {float} k2 - wavevector component
     * @return {float} sum (cos(k1x+k2x))
     */
    sumWaves.cosines2Odd = function(k1, k2) {
        let sum = Fast.cos(k1 * positionTimesUnitvectors[sumWaves.dimSpace - 1] + k2 * positionTimesUnitvectors[0]);
        for (var i = 1; i < sumWaves.dimSpace; i++) {
            sum += Fast.cos(k1 * positionTimesUnitvectors[i - 1] + k2 * positionTimesUnitvectors[i]);
        }
        return sum;
    };

    /**
     * sum of sine wave package with two nonzero k-components for odd rotational symmetry
     * @method sumWaves.sines2Odd
     * @param {float} k1 - wavevector component
     * @param {float} k2 - wavevector component
     * @return {float} sum (cos(k1x+k2x))
     */
    sumWaves.sines2Odd = function(k1, k2) {
        let sum = Fast.sin(k1 * positionTimesUnitvectors[sumWaves.dimSpace - 1] + k2 * positionTimesUnitvectors[0]);
        for (var i = 1; i < sumWaves.dimSpace; i++) {
            sum += Fast.sin(k1 * positionTimesUnitvectors[i - 1] + k2 * positionTimesUnitvectors[i]);
        }
        return sum;
    };


    /**
     * sum of cosine wave package with two nonzero k-components for even rotational symmetry
     * @method sumWaves.cosines2Even
     * @param {float} k1 - wavevector component
     * @param {float} k2 - wavevector component
     * @return {float} sum (cos(k1x+k2x))
     */
    sumWaves.cosines2Even = function(k1, k2) {
        let sum = Fast.cos(k1 * positionTimesUnitvectors[sumWaves.dimSpace - 1] - k2 * positionTimesUnitvectors[0]);
        for (var i = 1; i < sumWaves.dimSpace; i++) {
            sum += Fast.cos(k1 * positionTimesUnitvectors[i - 1] + k2 * positionTimesUnitvectors[i]);
        }
        return sum;
    };


    /**
     * sum of sine wave package with two nonzero k-components for even rotational symmetry
     * for 2-color symmetry
     * @method sumWaves.cosines2Even
     * @param {float} k1 - wavevector component
     * @param {float} k2 - wavevector component
     * @return {float} sum (cos(k1x+k2x))
     */
    sumWaves.sines2Even = function(k1, k2) {
        let sum = Fast.sin(k1 * positionTimesUnitvectors[sumWaves.dimSpace - 1] - k2 * positionTimesUnitvectors[0]);
        for (var i = 1; i < sumWaves.dimSpace; i++) {
            sum += Fast.sin(k1 * positionTimesUnitvectors[i - 1] + k2 * positionTimesUnitvectors[i]);
        }
        return sum;
    };



}());
