/*==========================================================
 * mirrorsMap: map a logarithmic spiral to a band
 *             center of spiral is origin
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional parameter: periodX, periodY
 *     displacement vector components for a full turn around the center of the spiral
 *      (with constant radius, changing phi from 0 to 2pi)
 *     should be a "invariant translation" of the map used in output  
 *
 * modifies the map, returns nothing if used as a procedure
 * transform(map, ...);
 * does not change the map and returns a modified map if used as  a function
 * newMap = transform(map, ....);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <complex.h>
#include <tgmath.h>
#include <stdbool.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float *inMap, *outMap;
    float lnR, phi, periodX, periodY, x, y;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 3) {
        mexErrMsgIdAndTxt("mirrorsMap:nrhs","A map input and (scalar) periodX and periodY required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("mirrorsMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("mirrorsMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("mirrorsMap:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
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
    /* period scaled by 2 pi*/
    periodX = ((float) mxGetScalar(prhs[1]))/6.283;
    periodY = ((float) mxGetScalar(prhs[2]))/6.283;  
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
        x = inMap[index];
        y = inMap[index + nXnY];
        phi = atan2f(y,x);
        lnR = 0.5 * logf(x * x + y * y);
        x = phi * periodX - lnR * periodY;
        y = phi * periodY + lnR * periodX;
        outMap[index] = x;
        outMap[index + nXnY] = y;
        outMap[index + nXnY2] = inverted;
    }
}
