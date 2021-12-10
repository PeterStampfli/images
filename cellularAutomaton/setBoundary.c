/*==========================================================
 * set boundary of cell array
 * the boundary has a width of two
 *
 * Input:
 * first the cell array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
 *
 * optional:
 * outer, default=0
 * value for cells at outer border
 * inner, default=outer
 * value for cells at inner border
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
    int inner, outer;
    int index, end;
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
        outer = (int) mxGetScalar(prhs[1]);
    } else {
        outer = 0;
    }
    if (nrhs >= 3){
        inner = (int) mxGetScalar(prhs[2]);
    } else {
        inner = outer;
    }
    /* doing the inner boundary*/
    end = 2 * size - 2;
    for (index = size+1; index <= end; index++){
        cells[index] = inner;
    }
    end = size * size - size - 2;
    for (index = size * size - 2 * size + 1; index <= end; index++){
        cells[index] = inner;
    }
    end = size * size - 2 * size + 1;
    for (index = 1 + size; index <= end; index += size){
        cells[index] = inner;
    }
    end = size * size - size - 2;
    for (index = 2 * size-2; index <= end; index += size){
        cells[index] = inner;
    }
    end = size - 1;
    for (index = 0; index <= end; index++){
        cells[index] = outer;
    }
    end = size - 1;
    for (index = 0; index <= end; index++){
        cells[index] = outer;
    }
    end = size * size - 1;
    for (index = end - size + 1; index <= end; index++){
        cells[index] = outer;
    }
    end = size * size - size;
    for (index = 0; index <= end; index += size){
        cells[index] = outer;
    }
    end = size * size - 1;
    for (index = size - 1; index <= end; index += size){
        cells[index] = outer;
    }
}