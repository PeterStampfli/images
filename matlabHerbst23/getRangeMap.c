/*==========================================================
 * getRangeMap: get range of a map, debugging
 * 
 * [xMin, xMax, yMin, yMax] = getRangeMap(map);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *
 *     invalid points:
 *     (x,y) = (INVALID,INVALID)
 *
 *     structure data is not used
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * alternative
 *
 * [xMin, xMax, yMin, yMax] = getRangeMap(x,y);
 *
 * Input:
 * x- and y-coordinates for each pixel in 2d arrays
 *
 * return xMin, xMax, yMin, yMax of valid points (with map(h,k,2)>=0)
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#define INVALID -10000
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims, *xDims, *yDims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, x, y;
    float *map, *xArray, *yArray;
    float xMin, xMax, yMin, yMax;
    double *xMinOut, *xMaxOut, *yMinOut, *yMaxOut;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs == 0) {
        mexErrMsgIdAndTxt("getRangeMap:nrhs","A map input required.");
    }
    /* check that 4 output are expected*/
    if (nlhs != 4) {
        mexErrMsgIdAndTxt("getRangeMap:nlhs","Has 4 output parameters.");
    }
    if(nrhs == 1) {
        /* check number of dimensions of the map*/
        if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
            mexErrMsgIdAndTxt("getRangeMap:mapDims","The map has to have three dimensions.");
        }
        dims = mxGetDimensions(prhs[0]);
        if(dims[2] < 2) {
            mexErrMsgIdAndTxt("getRangeMap:map3rdDimension","The map's third dimension has to be two or larger for (x,y) planes.");
        }
        /* get the map*/
    #if MX_HAS_INTERLEAVED_COMPLEX
        map = mxGetSingles(prhs[0]);
    #else
        map = (float *) mxGetPr(prhs[0]);
    #endif
        nX = dims[1];
        nY = dims[0];
        nXnY = nX * nY;
        xMin = 1e6;
        xMax = -1e6;
        yMin = 1e6;
        yMax = -1e6;
        for (index = 0; index < nXnY; index++){
            /* exclude INVALID points*/
            if (map[index] != INVALID) {
                xMin = fminf(xMin,x);
                x = map[index];
                y = map[index + nXnY];
                xMin = fminf(xMin,x);
                xMax = fmaxf(xMax,x);
                yMin = fminf(yMin,y);
                yMax = fmaxf(yMax,y);
            }
        }
    }
    else {
        if((mxGetNumberOfDimensions(prhs[0]) !=2 )||(mxGetNumberOfDimensions(prhs[0]) !=2 )) {
            mexErrMsgIdAndTxt("getRangeMap:mapDims","The arrays for x- and y-coordinates need two dimensions.");
        }
        xDims = mxGetDimensions(prhs[0]);
        yDims = mxGetDimensions(prhs[1]);

        /* get the maps*/
    #if MX_HAS_INTERLEAVED_COMPLEX
        xArray = mxGetSingles(prhs[0]);
        yArray = mxGetSingles(prhs[1]);
    #else
        xArray = (float *) mxGetPr(prhs[0]);
        yArray = (float *) mxGetPr(prhs[1]);
    #endif
        nX = xDims[1];
        nY = xDims[0];
        nXnY = nX * nY;
        if ((nX != yDims[1])||(nY != yDims[0])){
            mexErrMsgIdAndTxt("getRangeMap:mapDims","The arrays for x- and y-coordinates have not the same sizes.");  
        }
       
        
    }
    /* create output*/
    /* Create 1-by-1 matrices for the return arguments */
    plhs[0] = mxCreateDoubleMatrix(1, 1, mxREAL);
    plhs[1] = mxCreateDoubleMatrix(1, 1, mxREAL);
    plhs[2] = mxCreateDoubleMatrix(1, 1, mxREAL);
    plhs[3] = mxCreateDoubleMatrix(1, 1, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
    xMinOut = mxGetDoubles(plhs[0]);
    xMaxOut = mxGetDoubles(plhs[1]);
    yMinOut = mxGetDoubles(plhs[2]);
    yMaxOut = mxGetDoubles(plhs[3]);
#else
    xMinOut = mxGetPr(plhs[0]);
    xMaxOut = mxGetPr(plhs[1]);
    yMinOut = mxGetPr(plhs[2]);
    yMaxOut = mxGetPr(plhs[3]);
#endif
    *xMaxOut = (double) xMax;
    *xMinOut = (double) xMin;
    *yMaxOut = (double) yMax;
    *yMinOut = (double) yMin;
}
