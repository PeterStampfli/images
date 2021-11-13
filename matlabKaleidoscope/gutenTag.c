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
    action = (int) mxGetScalar(prhs[0]);
    input=  mxGetDoubles(prhs[1]);   // use -R2018a
    plhs[0]=mxCreateNumericMatrix(1,3,mxDOUBLE_CLASS,mxREAL);
    output= mxGetDoubles(plhs[0]);

   doSomething(output,action,input);
}
