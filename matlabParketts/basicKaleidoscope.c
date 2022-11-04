/*==========================================================
 * BasicKaleidoscope: Creates a tiling with a basic triangle and reflections at its sides. 
 * The triangle's corner angles are integer fractions of 180 degrees.
 * This makes dihedral groups. Depending on the corner angles we get elliptic, hyperbolic or euclidic geometry.
 * For hyperbolic geometry we get a Poincare disc representation of the tiling with radius 1.
 * For elliptic geometry we get a stereographic projection of the tiled sphere. The projection of the equator has radius 1. 
 *
 * basicKaleidoscope(map, k, m , n);
 * basicKaleidoscope(map, k, m , n, maxRange);
 * basicKaleidoscope(map, k, m , n, maxRange, minRange);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y 
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional input: 3 integers, k, m, n. 
 *     Determine the symmetries and the basic triangle.
 *     k is order of dihedral symmetry at center, pi/k the angle between the
 *     straight mirror lines (x-axis and oblique line), 
 *     k is limited, k <= 100 (enforced).
 *     m is order of dihedral symmetry arising at the oblique line
 *     and the third side of the triangle (circle or straight line), angle pi/n
 *     n is order of dihedral symmetry arising at x-axis and the third side of
 *     the triangle (circle or straight line), angle pi/n
 *
 *     if one or more of the m or n are 1 or smaller then the basicKaleidoscope
 *     does a a simple dihedral group of order k (because these values do not give a triangle.)
 *
 *     if k is smaller than 1 then the basicKaleidoscope does nothing (identity map)
 *
 *     hyperbolic case: the radius of the Poincare disc is equal to 1
 *     elliptic case: the radius of the equator in stereographic projection is equal to 1
 *
 * optional parameters: 
 *    maxRange (maximum number of iterations, default value is 1000)
 *    minRange (minimum number of iterations, values > 0 make a hole, default is 0)
 *
 * returns nothing and modifies the map argument if used as a procedure:
 *   basicKaleidoscope(map, k, m, n);
 *
 * returns a modified map and does not change the map argument if used as a function:
 *  newMap = basicKaleidoscope(map, k, m, n);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <stdbool.h>
#define PI 3.14159f
#define INVALID -10000
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int maxIterations, minIterations, iterations;
    int nX, nY, nXnY, nXnY2, nXnY3, index, i;
    float inverted, x, y;
    float *inMap, *outMap;
    bool returnsMap, success;
    int k, m, n, k2;
    enum geometryType {elliptic, euklidic, hyperbolic};
    enum geometryType geometry;
    float alpha, beta ,gamma, iGamma2, kPlus05, angleSum;
    float sines[200], cosines[200], dAngle;
    int rotation;
    float sine, cosine, h;
    float mirrorX, mirrorNormalX, mirrorNormalY;
    float circleCenterX, circleCenterY, circleRadius2;
    float centerX, centerY, factor;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 4) {
        mexErrMsgIdAndTxt("basicKaleidoscope:nrhs","A map input plus 3 geometry params required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("basicKaleidoscope:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("basicKaleidoscope:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("basicKaleidoscope:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
    if (nlhs == 0){
        returnsMap = false;
        outMap = inMap;
    } else {
        /* create output map*/
        returnsMap = true;
        plhs[0] = mxCreateNumericArray(3, dims, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
        outMap = mxGetSingles(plhs[0]);
#else
        outMap = (float *) mxGetPr(plhs[0]);
#endif
    }
    /* get geometry parameters*/
    k = (int) mxGetScalar(prhs[1]);
    m = (int) mxGetScalar(prhs[2]);
    n = (int) mxGetScalar(prhs[3]);
    /* limit k */
    if (k > 100){
        k = 100;
    }
    /* limits for iteration*/    
    if (nrhs >= 5){
        maxIterations = (int) mxGetScalar(prhs[4]);
    } else {
        maxIterations = 100;
    }
    if (nrhs >= 6){
        minIterations = (int) mxGetScalar(prhs[5]);
    } else {
        minIterations = 0;
    }
    
    /* k<1  identity map*/
    if (k < 1){
        if (returnsMap){
            nXnY3 = 3 * dims[0] * dims[1];
            for (index = 0; index < nXnY3; index++){
                outMap[index] = inMap[index];
            }
        }
        return;
    }
    
    /* the rotations of the dihedral group, order k*/
    dAngle = 2.0f * PI / k;
    k2 = 2 * k;
    for (i = 0; i < k2; i++){
        sines[i] = sinf(i*dAngle);
        cosines[i] = cosf(i*dAngle);
    }
    gamma = PI / k;
    iGamma2 = 0.5f / gamma;
    kPlus05 = k + 0.5f;

    /* catch case that there is no triangle*/
    /* m<=1 or n<=1: simple dihedral group of order k*/
    if ((m < 2)||(n<2)){
        /* do the map*/
        /* row first order*/
        nX = dims[1];
        nY = dims[0];
        nXnY = nX * nY;
        nXnY2 = 2 * nXnY;
        for (index = 0; index < nXnY; index++){
            inverted = inMap[index + nXnY2];
            /* do only transform if pixel is valid*/
            if (inverted < -0.1f) {
                if (returnsMap){
                    /* set element only if new output map*/
                    outMap[index] = INVALID;
                    outMap[index + nXnY] = INVALID;
                    outMap[index + nXnY2] = INVALID;           }
                continue;
            }
            x = inMap[index];
            y = inMap[index + nXnY];
            /* make dihedral map to put point in first sector*/
            rotation = (int) floorf(atan2f(y, x) * iGamma2 + kPlus05);
            cosine = cosines[rotation];
            sine = sines[rotation];
            h = cosine * x + sine * y;
            y = -sine * x + cosine * y;
            x = h;
            if (y < 0){
                y = -y;
                inverted = 1 - inverted;
            }
            outMap[index] = x;
            outMap[index + nXnY] = y;
            outMap[index + nXnY2] = inverted;
        }        
        return;
    }
    
    /* we have a triangle*/
    alpha = PI / n;
    beta = PI / m;
    angleSum = 1.0f / k + 1.0f / n + 1.0f / m;
    if (angleSum > 1.001){
        geometry = elliptic;
    }
    else if (angleSum > 0.999){
        geometry = euklidic;
    }
    else{
        geometry = hyperbolic;
    }

    /* define the inverting circle/mirror line*/
    switch (geometry){
        case hyperbolic:
            /* hyperbolic geometry with inverting circle*/
            /* calculation of center for circle radius=1*/
            centerY = cosf(alpha);
            centerX = centerY / tanf(gamma) + cosf(beta) / sinf(gamma);
            /* hyperbolic geometry: renormalize for poincare radius=1*/
            factor = 1 / sqrt(centerX * centerX + centerY * centerY - 1);
            circleCenterX = factor * centerX;
            circleCenterY = factor * centerY;
            circleRadius2 = factor * factor;
            break;
        case elliptic:
            /* calculation of center for circle radius=1*/
            centerY = - cosf(alpha);
            centerX = - (centerY / tanf(gamma) + cosf(beta) / sinf(gamma));
            /* renormalize to get equator radius of 1 in stereographic projection*/
            factor = 1 / sqrt(1-centerX*centerX-centerY*centerY);
            circleCenterX = factor * centerX;
            circleCenterY = factor * centerY;
            circleRadius2 = factor * factor;
            break;
        case euklidic:
            /* euklidic geometry with mirror line*/
            /* mirror position is arbitrary, mirror line passes through (mirrorX,0)*/
            mirrorX = 0.5f;
            /* normal vector to the mirror line, pointing outside*/
            mirrorNormalX = sinf(alpha);
            mirrorNormalY = cosf(alpha);
            break;
    }
    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    for (index = 0; index < nXnY; index++){
        inverted = inMap[index + nXnY2];
        /* do only transform if pixel is valid*/
        if (inverted < -0.1f) {
            if (returnsMap){
                /* set element only if new output map*/
                outMap[index] = INVALID;
                outMap[index + nXnY] = INVALID;
                outMap[index + nXnY2] = INVALID;           }
            continue;
        }
        x = inMap[index];
        y = inMap[index + nXnY];
        /* invalid if outside of poincare disc for hyperbolic kaleidoscope*/
        if ((geometry == hyperbolic) && (x * x + y * y >= 1)){
            outMap[index] = INVALID;
            outMap[index + nXnY] = INVALID;
            outMap[index + nXnY2] = INVALID;
            continue;
        }
        /* make dihedral map to put point in first sector*/
        /* and thus be able to use inversion/mirror as first step in iterated mapping*/
        rotation = (int) floorf(atan2f(y, x) * iGamma2 + kPlus05);
        cosine = cosines[rotation];
        sine = sines[rotation];
        h = cosine * x + sine * y;
        y = -sine * x + cosine * y;
        x = h;
        if (y < 0){
            y = -y;
            inverted = 1 - inverted;
        }
        /* repeat inversion and dihedral group until success*/
        success = false;
        iterations = 0;
        while ((!success) && (iterations < maxIterations)){
            float dx, dy, d2, d, factor;
            switch (geometry){
                case hyperbolic:
                    /* inversion inside-out at circle*/
                    /* if no mapping we have finished*/
                    dx = x - circleCenterX;
                    dy = y - circleCenterY;
                    d2 = dx * dx + dy * dy;
                    /* d2 always larger than zero, because only points inside th Poincare disc*/
                    /* are considered, center of inverting sphere lies outside */
                    if (d2 < circleRadius2){
                        inverted = 1 - inverted;
                        factor = circleRadius2 / d2;
                        x = circleCenterX + factor * dx;
                        y = circleCenterY + factor * dy;
                    }
                    else {
                        success = true;
                    }
                    break;
                case elliptic:
                    /* inversion outside-in at circle,*/
                    /* if no mapping we have finished*/
                    dx = x - circleCenterX;
                    dy = y - circleCenterY;
                    d2 = dx * dx + dy * dy;
                    if (d2 > circleRadius2){
                        inverted = 1 - inverted;
                        factor = circleRadius2 / d2;
                        x = circleCenterX + factor * dx;
                        y = circleCenterY + factor * dy;
                    } else {
                        success = true;
                    }
                    break;
                case euklidic:
                    /* reflect point at mirror line if it is at the right hand side*/
                    /* if no mapping we have finished*/
                    d = (x - mirrorX) * mirrorNormalX + y * mirrorNormalY;
                    if (d > 0){
                        inverted = 1 - inverted;
                        d = d + d;
                        x = x - d * mirrorNormalX;
                        y = y - d * mirrorNormalY;
                    } else {
                        success = true;
                    }
                    break;
            }
            /* dihedral symmetry, if no mapping we have finished*/
            rotation = (int) floorf(atan2f(y, x) * iGamma2 + kPlus05);
            if (rotation != k){
                /* we have a rotation and can't return*/
                cosine = cosines[rotation];
                sine = sines[rotation];
                h = cosine * x + sine * y;
                y = -sine * x + cosine * y;
                x = h;
                if (y < 0){
                    y = -y;
                    inverted = 1 - inverted;
                }
            } else {
                /* no rotation*/
                if (y < 0){
                    /* mirror symmetry at the x-axis, not finished*/
                    y = -y;
                    inverted = 1 - inverted;
                } else {
                    /* no mapping, it's finished*/
                    success = true;
                }
            }
            iterations+=1;
        }
        /* fail after doing maximum repetitions or less than minimum iterations*/
        if ((success) && (iterations > minIterations)) {
            /* be safe: do not get points outside the poincare disc*/
            if ((geometry == hyperbolic) && (x * x + y * y >= 1)){
                outMap[index + nXnY2] = -1;
            } else {
                outMap[index] = x;
                outMap[index + nXnY] = y;
                outMap[index + nXnY2] = inverted;
            }
        } else {
            outMap[index] = INVALID;
            outMap[index + nXnY] = INVALID;
            outMap[index + nXnY2] = INVALID;
        }
    }
}
