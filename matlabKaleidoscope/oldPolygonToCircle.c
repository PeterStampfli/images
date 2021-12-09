/* PTC_polygonToCircle*/

/*==========================================================
 * regular polygon with nCorners,
 * the corners are on circle with radius 1, center at origin
 * is mapped to unit circle, or a multiple
 *
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * and number of corners
 * and winding number, optional, default is 1
 * mapping goes to circle times winding number
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
#define INVALID -1000

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, x, y;
    float *inMap, *outMap;
    bool returnsMap = false;
    int nCorners;
    float winding;
    float sines[200],cosines[200];
    float dAngle, piDivNCorners, pi2DivNCorners, nCornersDiv2Pi,nCornersPlus;
    float cosPiDivNCorners, sinPiDivNCorners, tanPiDivNCorners, piNDivTanPiNCorners;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("polygonToCircle:nrhs","A map input and number of corners required.");
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
    /* prepare things*/
    nCorners = (int) mxGetScalar(prhs[1]);
    if (nrhs > 2){
        winding = (float) mxGetScalar(prhs[2]);
    } else {
        winding = 1;
    }
    if (nCorners < 3){
        mexErrMsgIdAndTxt("polygonToCircle:nCorners","The number of corners has to be larger than 2.");
    }
    piDivNCorners = PI/nCorners;
    pi2DivNCorners = 2.0f * PI/nCorners;
    nCornersDiv2Pi = 0.5f * nCorners / PI;
    nCornersPlus = 0.5f + nCorners * 1.25f;
    cosPiDivNCorners = cosf(piDivNCorners);
    sinPiDivNCorners = sinf(piDivNCorners);
    tanPiDivNCorners = tanf(piDivNCorners);
    piNDivTanPiNCorners = piDivNCorners / tanPiDivNCorners;
    
    PRINTF(piDivNCorners);
    PRINTF(cosPiDivNCorners);
    PRINTF(sinPiDivNCorners);
    
    
    /* the rotations of the dihedral group, order k*/
    if (nCorners > 100){
        mexErrMsgIdAndTxt("poincareDiscMapping:nCorners","Initialization, nCorners has to be smaller or equal to 100.");
    }
    /* generate rotation"matrix"*/
    dAngle = 2.0f * PI / nCorners;
    int nCorners2 = 2 * nCorners;
    for (int i = 0; i < nCorners2; i++){
        sines[i] = sinf(i*dAngle);
        cosines[i] = cosf(i*dAngle);
        PRINTI(i);
        PRINTF(sines[i]);
        PRINTF(cosines[i]);
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
        x = inMap[index];
        y = inMap[index + nXnY];
        /* first find rotation by multiples of 2PI/nCorners such that */
        /* the point is inside a sector at angles of +/- PI/nCorners to the negative y-axis*/
        /* this sector is defined by limiting angles -PI/2-PI/nCorners and -PI/2+PI/nCorners*/
        /* the angle of point (x,y) to the lower limiting y-axis is atan2(y,x) + PI/2 + PI/nCorners + 2 PI */
        /* with a range of 3PI/2 + PI/nCorners ... 7PI/2 + PI/nCorners */
        /* dividing by 2PI/nCorners gives the index m to the rotation "matrices", rounding down */
        /* m=atan2(y,x)*(nCorners/2PI) + 0.5 +nCorners*(5/4) */
        int m = (int) floorf(atan2f(y,x) * nCornersDiv2Pi + nCornersPlus);
        /* rotate to sector -pi/2-pi/n<angle<-pi/2+pi/n*/
        m=2;
        if (m != nCorners){
            float cosine = cosines[m];
            float sine = sines[m];
            float h = cosine * x + sine * y;
            y = -sine * x + cosine * y;
            x = h;
        }
        /* the side of the polygon to its center has a distance of*/
        /* cos(PI/nCorners) as corners have a distance of unit to the center*/
        /* test if point is inside polygon, else set invalid*/
         if (y < -cosPiDivNCorners) {
                outMap[index] = INVALID;
                outMap[index + nXnY] = INVALID;
                outMap[index + nXnY2] = INVALID;
            continue;
        }
        /* y defines the radial position*/
        float r = - y / cosPiDivNCorners;
        r=sqrtf(x*x+y*y);
        /* x defines the angular position*/
        /* the angle is proportional to x*/
        /* for each side of the polygon it varies by 2pi/nCorners*/
        /* if x/y=tan(pi/N) then the contribution is pi/N*/
        /* in addition, we have to undo the rotation by m*(2PI/nCorners)*/
        /* that depends on the side m of the polygon*/
        /* note that the reference angle is -pi/2*/
        /* the winding number multiplies the angle*/
        float phi = - 0.5 * PI + m * pi2DivNCorners - x / y /tanPiDivNCorners*piDivNCorners;
        phi = - 0.5 * PI + m * pi2DivNCorners + atan2f(y,x);
     //    phi = - 0.5 * PI + m * pi2DivNCorners - x / y * piNDivTanPiNCorners;
        outMap[index] = cosf(phi)*r;
        outMap[index + nXnY] = sinf(phi)*r;
        outMap[index + nXnY2] = inverted;
    }
}