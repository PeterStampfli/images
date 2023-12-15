/*==========================================================
 * using real numbers for components to transform a map
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * bulatov band, depending on its period
 * basicBulatovBand(map,period)
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
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float x, y;
    float period, nPeriods, piA2, iTanPiA4, exp2x, base;
    float *inMap, *outMap;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("transformMap:nrhs","A map input and period required.");
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
    period = (float) mxGetScalar(prhs[1]);
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
    piA2 = PI / 2;
    iTanPiA4 = 1.0f / tanf(PI / 4);
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
                outMap[index + nXnY2] = INVALID;  
            }
            continue;
        }
        y = inMap[index + nXnY];
        if (fabsf(y) > 1){
            outMap[index] = INVALID;
            outMap[index + nXnY] = INVALID;
            outMap[index + nXnY2] = INVALID;
            continue;  
        }
        x = inMap[index];
        nPeriods = floorf(x / period);
        x = piA2 * (x - period * nPeriods);
        y *= piA2;
        exp2x = expf(x);
        base = iTanPiA4 / (exp2x + 1.0f / exp2x + 2 * cosf(y));
        outMap[index] = (exp2x - 1.0f / exp2x) * base;
        outMap[index + nXnY] = 2 * sinf(y) * base;
        outMap[index + nXnY2] = inverted;
    }
}