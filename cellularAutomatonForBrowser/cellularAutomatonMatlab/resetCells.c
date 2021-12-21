/*==========================================================
 * reset cell array to constant value
 *
 * Input:
 * first the cell array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
 *
 * optional:
 * value, default=0
 *
 *  cd /home/peter/images/cellularAutomaton
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int size, sizeSq, *cells;
    int value;
    int index;
    if(nrhs == 0) {
        mexErrMsgIdAndTxt("setBoundary:nrhs","A cell array input required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("setBoundary:dims","The cell array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    size = dims[0];
    sizeSq = size * size;
    /* get the cell array*/
#if MX_HAS_INTERLEAVED_COMPLEX
    cells = mxGetInt32s(prhs[0]);
#else
    cells = (int *) mxGetPr(prhs[0]);
#endif
    if (nrhs >= 2){
        value = (int) mxGetScalar(prhs[1]);
    } else {
        value = 0;
    }
    for (index = 0; index < sizeSq; index++){
        cells[index] = value;
    }
}