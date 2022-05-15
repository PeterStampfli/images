/*==========================================================
 * regular polygon with nCorners,
 * the corners are on circle with radius 1, center at origin
 * mirrorsymmetric at y-axis,
 * one side of polygon is parallel to x-axis and lies below it (y<0)
 * is mapped to unit circle
 *
 * Input:
 * input map
 *  the map has for each pixel (h,k):
 *  map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * number of corners of the regular polygon
 *
 * optional parameters:
 *  offset, default is 0
 *  an additional angle, rotates the kaleidoscopic pattern
 *  typical values: 0 or pi/nCorners (has effect of exchanging m and n)
 *  winding number, default is 1
 *  mapping goes from polygon to circle times winding number
 *  typical values: 1, 0.5 maps polygon to half circle, 2
 *
 * modifies the map, returns nothing if used as a procedure
 * transform(map, ...);
 * does not change the map and returns a modified map if used as  a function
 * newMap = transform(map, ....);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <stdbool.h>
#define PI 3.14159f
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000.0f

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, x, y;
    float *inMap, *outMap;
    bool returnsMap = false;
    int nCorners;
    float offset, winding;
    float sines[200],cosines[200];
    float nCornersPlus05, dAngle, iDAngle;
    float piDivNCorners, cosPiDivNCorners, piDivNCornersDivTan;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("polygonToCircle:nrhs","At least map input and number of corners required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("polygonToCircle:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("polygonToCircle:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("polygonToCircle:nlhs","Has zero or one return parameter.");
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
    /* parameters*/
    nCorners = (int) mxGetScalar(prhs[1]);
    if (nCorners < 3){
        mexErrMsgIdAndTxt("polygonToCircle:nCorners","The number of corners has to be larger than 2.");
    }
    if (nrhs >= 3){
        offset = (float) mxGetScalar(prhs[2]);
    } else {
        offset = 0.0f;
    }
    if (nrhs >= 4){
        winding = (float) mxGetScalar(prhs[3]);
    } else {
        winding = 1.0f;
    }
    nCornersPlus05 = nCorners + 0.5f;
    dAngle = 2.0f * PI / nCorners;
    iDAngle = 1.0f / dAngle;
    piDivNCorners = PI/nCorners;
    cosPiDivNCorners = cosf(piDivNCorners);
    piDivNCornersDivTan = piDivNCorners / tanf(piDivNCorners);
    int nCorners2 = 2 * nCorners;
    for (int i = 0; i < nCorners2; i++){
        sines[i] = sinf(i*dAngle);
        cosines[i] = cosf(i*dAngle);
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
                outMap[index + nXnY2] = INVALID;
            }
            continue;
        }
        /* rotate by 90 degrees counterclockwise, x=-y,y=x*/
        /* the polygon is now symmetric to x-axis*/
        /* one side lies at positive x, perpendicular to x-axis*/
        y = inMap[index];
        x = - inMap[index + nXnY];
        /* rotate to sector: - pi/nCorners < angle(x,y) < pi/nCorners*/
        /* find multiple of ratation by 2pi/nCorners*/
        /* y=0,x>0 goes to effectively 0*/
        int rotation = (int) floorf(atan2f(y, x) * iDAngle + nCornersPlus05);
        if (rotation != nCorners){
            float cosine = cosines[rotation];
            float sine = sines[rotation];
            float h = cosine * x + sine * y;
            y = -sine * x + cosine * y;
            x = h;
        }
        /* the relevant polygon side lies at x=cos(pi/nCorners), corner points with distance 1 to center*/
        /* limiting the valid range for x*/
        if (x > cosPiDivNCorners) {
            outMap[index] = INVALID;
            outMap[index + nXnY] = INVALID;
            outMap[index + nXnY2] = INVALID;
            continue;
        }
        /* map x in [0, cosPiDivNCorners] to radius in [0, 1]*/
        float r=x/cosPiDivNCorners;
        /* each side of the polygon corresponds to an angle of range dAngle=2pi/nCorners*/
        /* we have to undo the rotation by amount rotation*dAngle*/
        /* an additional angle corresponding to y in [-x*tan(pi/N),is in [-pi/nCorners, +pi/nCorners]*/
        float phi= offset + winding * (y / x * piDivNCornersDivTan +rotation*dAngle);
        /* alternatively: phi=atan2f(y,x)+rotation*dAngle;*/
        /* note that the sector [-pi/nCorners, +pi/nCorners] is also used in the kaleidoscope*/
        /* for k = nCorners*/
        outMap[index] = cosf(phi)*r;
        outMap[index + nXnY] = sinf(phi)*r;
        outMap[index + nXnY2] = inverted;
    }
}