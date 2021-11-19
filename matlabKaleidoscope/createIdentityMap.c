/*==========================================================
 * for the initialization of maps creates an identity map as a single precision array
 * for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * (c-indices, starting with 0, row index first)
 *
 * depending on:
 * mPixels - number of (mega)pixels, in units of 1'000'000, default = 1
 * xMin - lower value of x-coordinates, default = -1
 * xMax - upper value of x-coordinates, default = -xMin
 * yMin - lower Value of y-coordinates, default = xMin
 * yMax - upper Value of y-coordinates, default = -yMin
 * all are double precision scalar (Matlab default)
 *
 * returns the map
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    float nPixels, xMin, xMax, yMin, yMax;
    int nX, nY, j, k, index, nXnY;
    float dx, dy, dxdy, x, y;
    float *output;
    static mwSize dims[3];
    /* check that output is possible*/
    if (nlhs != 1) {
        mexErrMsgIdAndTxt("createIdentityMap:nlhs","One output array for the map required.");
    }
    /* do variable inputs*/
    if (nrhs >= 1){
        nPixels = (float) mxGetScalar(prhs[0]);
    } else {
        nPixels = 1.0f;
    }
    nPixels *= 1000000;
    if (nrhs >= 2){
        xMin = (float) mxGetScalar(prhs[1]);
    } else {
        xMin = -1;
    }
    if (nrhs >= 3){
        xMax = (float) mxGetScalar(prhs[2]);
    } else {
        xMax = - xMin;
    }
    if (nrhs >= 4){
        yMin = (float) mxGetScalar(prhs[3]);
    } else {
        yMin = xMin;
    }
    if (nrhs >= 5){
        yMax = (float) mxGetScalar(prhs[4]);
    } else {
        yMax = - yMin;
    }
    /* get array dimensions*/
    dx = xMax - xMin;
    dy = yMax - yMin;
    dxdy = dx / dy;
    nX = (int) sqrt(nPixels * dxdy);
    nY = (int) sqrt(nPixels / dxdy);
    dx /= nX;
    dy /= nY;
    /* create array*/
    /* attention: row first - corresponds to y dimension*/
    dims[0] = nY;
    dims[1] = nX;
    dims[2] = 3;
    plhs[0]=mxCreateNumericArray(3, dims, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
    output = mxGetSingles(plhs[0]);
#else
    output = (float *) mxGetPr(plhs[0]);
#endif
    /* make the array*/
    nXnY = nX * nY;
    index = 0;
    x = xMin + 0.5f * dx;
    for (j = 0; j < nX; j++){
        y = yMin + 0.5f * dy;
        for (k = 0; k < nY; k++){
            output[index] = x;
            output[index + nXnY] = y;
            output[index + 2 * nXnY] = 0;
            index+=1;
            y += dy;
        }
        x += dx;
    }
}