/*==========================================================
 * transform a map
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * and more parameters, depending on the transform
 *
 * modifies the map, returns nothing as it is a procedure
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, x, y;
    float *map;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs == 0) {
        mexErrMsgIdAndTxt("transformMap:nrhs","A map input required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("transformMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("transformMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no output is expected*/
    if (nlhs > 0) {
        mexErrMsgIdAndTxt("transformMap:nlhs","No output. This is a procedure.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    map = mxGetSingles(prhs[0]);
#else
    map = (float *) mxGetPr(prhs[0]);
#endif
    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    for (index = 0; index < nXnY; index++){
        inverted = map[index + nXnY2];
        /* do only transform if pixel is valid*/
        if (inverted < -0.1f) {
            continue;
        }
        x = map[index+nXnY];
        y = map[index];
        /* do some transformation*/
        
        map[index+nXnY] = x;
        map[index] = y;
        map[index + nXnY2] = inverted;
    }
}