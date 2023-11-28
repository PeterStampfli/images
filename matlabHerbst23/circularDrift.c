/*==========================================================
 * using real numbers for components to transform a map
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * adds an x-dependent drift to the map   (x,y) => (x+x_0*strength,y)
 * xDrift(map,strength,xMin,xMax,yMin,yMax)
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <complex.h>
#include <tgmath.h>
#include <stdbool.h>
#define PI 3.14159f
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims, *aDims;
    int i, nParams;
    int nX, nY, nXnY, nXnY2, index, j, k;
    float inverted, strength, drift;
    float xMin, xMax, yMin, yMax, dx, dy;
    float x, y;
    float *inMap, *outMap;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 6) {
        mexErrMsgIdAndTxt("circularDrift:nrhs","A map input, strength, xMin, xMax, yMin and yMax required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("transformMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("transformMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("transformMap:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif   
    /* get period */
    strength = (float) mxGetScalar(prhs[1]);
    /* get dimensions */
    xMin = (float) mxGetScalar(prhs[2]);
    xMax = (float) mxGetScalar(prhs[3]);
    yMin = (float) mxGetScalar(prhs[4]);
    yMax = (float) mxGetScalar(prhs[5]);
    /* left hand side */
    if (nlhs == 0){
        outMap = inMap;
    } else {
        /* create output map*/
        returnsMap = true;
        plhs[0]=mxCreateNumericArray(3, dims, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
        outMap = mxGetSingles(plhs[0]);
#else
        outMap = (float *) mxGetPr(plhs[0]);
#endif
    }
    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    /* increments */
    dx = (xMax - xMin) / (nX - 1);
    dy = (yMax - yMin) / (nY - 1);
    index = 0;
    /* beware of row first indexing order, the inner loop chnges the y-value*/
    /* making it independent of number of pixels -  resolution*/
    x = xMin;
    for (j = 0; j < nX; j++){
        y = yMin;
        for (k = 0; k < nY; k++){
            outMap[index] = inMap[index] - strength * y ;
            outMap[index + nXnY] = inMap[index + nXnY] + strength * x ;
            y += dy;
            index+=1;
        }
        x += dx;
    }
}