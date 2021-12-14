/*==========================================================
 * make that boundary of cell array is periodic cell array
 * the boundary has a width of two
 *
 * Input:
 * first the cell array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
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
    int index, end;
    int shift, shiftSize;
    if(nrhs == 0) {
        mexErrMsgIdAndTxt("periodicBoundary:nrhs","A cell array input required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("periodicBoundary:dims","The cell array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    size = dims[0];
    sizeSq = size * size;
    shift = size - 4;
    shiftSize = shift * size;
    /* get the cell array*/
#if MX_HAS_INTERLEAVED_COMPLEX
    cells = mxGetInt32s(prhs[0]);
#else
    cells = (int *) mxGetPr(prhs[0]);
#endif
    /*up and down*/
    /*first row*/
    end = size - 3;
    for (index = 2; index <= end; index++){
        cells[index] = cells[index + shiftSize];
    }
    /*second row*/
    end = 2 * size - 3;
    for (index = size+2; index <= end; index++){
        cells[index] = cells[index + shiftSize];
    }
    /*before last row*/
    end = size * size - size - 3;
    for (index = size * size - 2 * size + 2; index <= end; index++){
        cells[index] = cells[index - shiftSize];
    }
 /*last row*/
    end = size * size - 3;
    for (index = end - size + 2; index <= end; index++){
        cells[index] = cells[index - shiftSize];
    }    
    /*first column*/
 end = size * size - size;
    for (index = 0; index <= end; index += size){
        cells[index] = cells[index + shift];
    }
 /*second column*/
    end = size * size - size+1;
    for (index = 1; index <= end; index += size){
        cells[index] = cells[index + shift];
    }
    /*before last column*/
    end = size * size - 2;
    for (index = size-2; index <= end; index += size){
        cells[index] = cells[index - shift];
    }
   /*last column*/
    end = size * size - 1;
    for (index = size - 1; index <= end; index += size){
        cells[index] = cells[index - shift];
    }
}