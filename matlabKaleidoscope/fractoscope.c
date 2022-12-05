/*==========================================================
 * fractoscope: Creates a fractal tiling with a pseudo-quadrangle of two lines and two circles 
 *
 * fractoscope(map, k, inside, outside);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y 
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional input: 3 integers, k, inside, outside. 
 *     k is order of dihedral symmetry at center, pi/k the angle between the
 *     straight mirror lines (x-axis and oblique line), 
 *     k is limited, k <= 100 (enforced).
 *     for inside>0 points at the inside of the fractal shape are mapped (default=1)
 *     for inside<=0 points inside are invalid
 *     same for outside (default=0)
 *     
 *
 * returns nothing and modifies the map argument if used as a procedure:
 *   fractoscope(map, k, inside, outside);
 *
 * returns a modified map and does not change the map argument if used as a function:
 *  newMap = fractoscope(map, k, inside, outside);
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
    int iterations;
    int nX, nY, nXnY, nXnY2, nXnY3, index, i;
    float inverted, x, y;
    float *inMap, *outMap;
    bool returnsMap, success;
    int k, k2;
    int inside, outside;
    float gamma, iGamma2, kPlus05;
    float sines[200], cosines[200], dAngle;
    int rotation;
    float sine, cosine, h;
    int maxIterations;
    float h1, r1, r12, x1;
    float r2, r22, x2, y2;
    float dx, dy, d2, d, factor;

    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("fractoscope:nrhs","A map input plus 1 geometry param required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("fractoscope:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("fractoscope:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("fractoscope:nlhs","Has zero or one return parameter.");
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
    // defaults
    inside = 1;
    outside = 0;
    // get parameter values if present
    if(nrhs >= 3) {
            inside = (int) mxGetScalar(prhs[2]);
    }
    if(nrhs >= 4) {
            outside = (int) mxGetScalar(prhs[3]);
    }
    /* limit k */
    if (k > 100){
        k = 100;
    }
    /* limit for iteration*/    
    maxIterations = 100;
   
    /* k<=2  identity map*/
    if (k <= 2){
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
    
    /* define the inverting circles*/
    /* hyperbolic radius corresponding to the outer inverting circle*/
    h1 = 1;
    /* the outer inverting circle lies at (x1,0) with radius r1*/
    r1 = h1 * tanf(PI / k);
    r12 = r1 * r1;
    x1 = h1 / cosf(PI / k);
    /* the second circle is at (x2, y2) with radius r2*/
    r2 = (x1 - r1) * tanf(PI / k);
    r22 = r2 * r2;
    x2 = x1 - r1;
    y2 = r2;
    
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
            success = true;
            /* inversion at first circle*/
            dx = x - x1;
            d2 = dx * dx + y * y;
            if (d2 < r12){
                factor = r12 / d2;
                x = x1 + factor * dx;
                y = factor * y;
                inverted = 1 - inverted;
                success = false;
            }
            if (!success){
            /* dihedral symmetry*/
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
                    } 
                }
            }
            
            /* inversion at second circle*/
            dx = x - x2;
            dy = y - y2;
            d2 = dx * dx + dy * dy;
            if (d2 < r22){
                factor = r22 / d2;
                x = x2 + factor * dx;
                y = y2 + factor * dy;
                inverted = 1 - inverted;
                success = false;
            }
            
            if (!success){
            /* dihedral symmetry*/
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
                    } 
                }
            }

            iterations+=1;
        }
        /* fail after doing maximum repetitions*/
        /* check regions, if success*/
        if (success) {
            if (x <= x2){
                success = (inside > 0);
            }
            else {
                /* outside: make an inversion to get a finite map*/
                success = (outside > 0);
                if (success){
                    d2 = x * x + y * y;
                    factor = h1 * h1 / d2;
                    x = factor * x;
                    y = factor * y;
                }
            }
        }
        if (success) {
            outMap[index] = x;
            outMap[index + nXnY] = y;
            outMap[index + nXnY2] = inverted;
        } else {
            outMap[index] = INVALID;
            outMap[index + nXnY] = INVALID;
            outMap[index + nXnY2] = INVALID;
        }
    }
}
