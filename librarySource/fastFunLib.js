/*
approximating functions with linear table interpolation
*/
var fastMakeTable;
var fastSin, fastCos, fastCosSin;
var fastExp, fastLog, fastAtan2;
var fastGauss, fastOriginalGauss;

(function() {
    "use strict";
    

/*
make the table, length is number of intervalls plus 2 for interpolation and data at end of interval
*/

/**
* @method makeTable
*/

fastMakeTable=function(start,end,nIntervals,theFunction){
	var table=[];
	var step=(end-start)/nIntervals;
	var x=start;
	table.length=nIntervals+2;
	for (var i=0;i<nIntervals+2;i++){
		table[i]=theFunction(x);
		x+=step;
	}
	return table;
};
    
    
 


/*
make a table for a sin function with a power of 2 number of intervalls
and for a cos function too
period length is 2pi
*/

    var nIntervals=Math.round(Math.pow(2,12));
    var nSinIntervalsM1=nIntervals-1;
    var sinTabFactor=nIntervals/2/Math.PI;
    var sinTable=fastMakeTable(0,2*Math.PI,nIntervals,Math.sin);
    var cosTable=fastMakeTable(0,2*Math.PI,nIntervals,Math.cos);


/*
interpolate periodic function directly
assuming that table is a sine-like function you get this sine-like function
*/
fastSin=function(x){
    var index;
    x*=sinTabFactor;
    index=Math.floor(x);
    x-=index;
    index=index&nSinIntervalsM1;
    return sinTable[index]*(1-x)+sinTable[index+1]*x;
};


/*
interpolate periodic function directly
assuming that table is a sine-like function you get this sine-like function
*/
fastCos=function(x){
    var index;
    x*=sinTabFactor;
    index=Math.floor(x);
    x-=index;
    index=index&nSinIntervalsM1;
    return cosTable[index]*(1-x)+cosTable[index+1]*x;
};

 var cosSin=[0,0];
fastCosSin=function(x){
    var index;
    x*=sinTabFactor;
    index=Math.floor(x);
    x-=index;
    index=index&nSinIntervalsM1;
    cosSin[0]=cosTable[index]*(1-x)+cosTable[index+1]*x;
    cosSin[1]=sinTable[index]*(1-x)+sinTable[index+1]*x;
    return cosSin;
};

	// the exponential function
	var expMaxArgument=Math.floor(Math.log(Number.MAX_VALUE))+1;
	var expMinArgument=Math.floor(Math.log(Number.MIN_VALUE));
	var expTabIntPartMaxIndex=expMaxArgument-expMinArgument;

	var expTabIntPart=fastMakeTable(expMinArgument,expMaxArgument,expTabIntPartMaxIndex,Math.exp);	
nIntervals=1000;
	var expTabFracFactor=nIntervals;
	var expTabFracPart=fastMakeTable(0,1,nIntervals,Math.exp);

fastExp=function(x){
	var indexToIntPart,indexToFractPart;
	indexToIntPart=Math.floor(x);
	x=expTabFracFactor*(x-indexToIntPart);
	indexToFractPart=Math.floor(x);
	x-=indexToFractPart;
	return expTabIntPart[Math.max(0,Math.min(expTabIntPartMaxIndex,indexToIntPart-expMinArgument))]*
	       (expTabFracPart[indexToFractPart++]*(1-x)+expTabFracPart[indexToFractPart]*x);
}	;





/*
setup table for log function: values between 1 and 2
*/
nIntervals=1000;
	var logTabFactor=nIntervals;
	var logTable=fastMakeTable(1,2,nIntervals,Math.log);


/*
fast log, fallback to native log for large value, using inversion for small values
slower than native log for chrome, twice times faster for firefox
*/
fastLog=function(x){
    var index;
    var ln=0;
    var iX;
    var iDiv=1;
    if (x<=0){
        return NaN;
    }
    if (x<1){
        return -this.log(1/x);
    }
    if (x>=2147483647){                  // 2**31-1
        return Math.log(x);
    }
    iX=Math.floor(x);
    if (iX>=65536){
        iX=iX>>16;
        iDiv=iDiv<<16;
        ln=11.090354;
    }
    if (iX>=256){
        iX=iX>>8;
        iDiv=iDiv<<8;
        ln+=5.545177;
    }
    if (iX>=16){
        iX=iX>>4;
        iDiv=iDiv<<4;
        ln+=2.772588;
    }
    if (iX>=4){
        iX=iX>>2;
        iDiv=iDiv<<2;
        ln+=1.386294;
    }
    if (iX>=2){
        iX=iX>>1;
        iDiv=iDiv<<1;
        ln+=0.693147;
    }
    x=(x/iDiv-1)*logTabFactor;
    index=Math.floor(x);
    x-=index;
    return ln+logTable[index]*(1-x)+logTable[index+1]*x;
};


/*
make the table for the atan function
*/


nIntervals=1000;
	var atanTabFactor=nIntervals;
	var atanTable=fastMakeTable(0,1,nIntervals,Math.atan);

/*
fast atan2
*/

fastAtan2= function(y,x){
    var index;
    if (x>=0){
        if (y>0) {
            if (x>y) {
                x=atanTabFactor*y/x;
                index=Math.floor(x);
                x-=index;
                return atanTable[index]*(1-x)+atanTable[index+1]*x;
            }
            else {
                x=atanTabFactor*x/y;
                index=Math.floor(x);
                x-=index;
                return 1.5707963268-(atanTable[index]*(1-x)+atanTable[index+1]*x);
            }
        }
        else {
            if (x>-y){
                x=-atanTabFactor*y/x;
                index=Math.floor(x);
                x-=index;
                return -(atanTable[index]*(1-x)+atanTable[index+1]*x);
            }
            else {
                x=-atanTabFactor*x/y;
                index=Math.floor(x);
                x-=index;
                return -1.5707963268+atanTable[index]*(1-x)+atanTable[index+1]*x;
            }
        }
    }
    else {
        if (y>=0){
            if (x<-y){
                x=-atanTabFactor*y/x;
                index=Math.floor(x);
                x-=index;
                return 3.1415926536-(atanTable[index]*(1-x)+atanTable[index+1]*x);
            }
            else {
                x=-atanTabFactor*x/y;
                index=Math.floor(x);
                x-=index;
                return 1.5707963268+atanTable[index]*(1-x)+atanTable[index+1]*x;
            }
        }
        else {
            if (x<y){
                x=atanTabFactor*y/x;
                index=Math.floor(x);
                x-=index;
                return -3.1415926536+atanTable[index]*(1-x)+atanTable[index+1]*x;
            }
            else {
                x=atanTabFactor*x/y;
                index=Math.floor(x);
                x-=index;
                return -1.5707963268-(atanTable[index]*(1-x)+atanTable[index+1]*x);
            }
        }
    }
};


/*
the gauss function
*/
fastOriginalGauss=function(x){
    return Math.exp(-x*x);
};

/*
make the table for the gauss function exp(-x**2), x<4
*/

	nIntervals=2000;
    var gaussTabFactor=0.25*nIntervals;
    var gaussTable=fastMakeTable(0,4,nIntervals,fastOriginalGauss);




}());