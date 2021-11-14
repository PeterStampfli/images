/*==========================================================
 * whatever
 *
 *========================================================*/

#include "mex.h"
#include <math.h>

/* The computational routine */
void doSomething(double *output,const int action, const double *input)
{
    
    printf("guten tag.%d %f\n",action,input[0]);
    output[0]=234;
    output[1]=567;
    output[2]=9;
}

/* The gateway function */
void mexFunction( int nlhs, mxArray *plhs[],
                  int nrhs, const mxArray *prhs[])
{
    double *output, *input;
    int action;
    /* check for proper number of arguments (else crash)*/
    if(nrhs!=2) {
        mexErrMsgIdAndTxt("gutenTag:nrhs","Two inputs required.");
    }
    if(nlhs!=1) {
        mexErrMsgIdAndTxt("gutenTag:nlhs","One output required.");
    }
       /* make sure the first input argument is scalar */
    if(   mxGetNumberOfElements(prhs[0])!=1 ) {
        mexErrMsgIdAndTxt("gutenTag:notScalar","Input action must be a scalar.");
    }
    action = (int) mxGetScalar(prhs[0]);
      
    #if MX_HAS_INTERLEAVED_COMPLEX
    input = mxGetDoubles(prhs[1]);
    #else
    input = mxGetPr(prhs[1]);
    #endif

    plhs[0]=mxCreateNumericMatrix(1,3,mxDOUBLE_CLASS,mxREAL);

    #if MX_HAS_INTERLEAVED_COMPLEX
    output = mxGetDoubles(plhs[0]);
    #else
    output = mxGetPr(plhs[0]);
    #endif
    doSomething(output,action,input);
}
