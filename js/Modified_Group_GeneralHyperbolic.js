
/*
  provides generators for general hyperbolic group 
*/



var theGroup // having a lot of trouble with the binding otherwise.
//var groupChangedCallback; // function to call if group was changed 

class Group_GeneralHyperbolic {
	
	
	constructor(){
            		
		theGroup = this;
     
            
            
                const me=this;
                
            
		//this.EPSILON = 1.e-10;
		
		this.paramGui = new dat.GUI()
		this.generalHyperbolicGroupGuiParams = []
		this.guiParams = [];
		this.guiParams["name"] = "oo";
		this.paramGui.add(this.guiParams,"name").onChange(
                    function(){
                        me.groupNameChanged();
                    }
                )//(Group_GeneralHyperbolic.groupChanged)
		this.paramGui.domElement.style.cssText = 'position: absolute;'
		this.errorLog = "";
		this.parN = 0;
		this.parCounts=[];
		this.atomList=[];
                this.defaultIncrement = 1.e-8;
    
		
		this.groupNameChanged();
		
		
		this.paramArray = [		
			{
				name:"aspect",
				type:DOUBLE_PARAMETER,
				value:0.5,
				minValue:0.01,
				maxValue:0.99,
				increment:this.defaultIncrement,
			},
		];
			
		this.paramMap = this.makeParamMap(this.paramArray);
		
		
	}
	
	
        groupParamsChanged(){
                this.updateTheGroupGeometry();	
                //there's a little dance here; the general group constructor is called in the renderer's
                // constructor, before render.onParamChanged is defined. 
                // However the constructor will call a render
                //if(render /*exists*/){render.onParamChanged()}
        if(this.groupChangedCallback !== undefined) this.groupChangedCallback();
        }

	
	groupNameChanged(){
            var okQ = this.updateTheGroup();
            if(okQ){this.groupParamsChanged()};
            // else what? Not really clear what the right behavior should be. 
            // the group doesn't change, but the symbol in the text box is wrong.
        }
	
        setOnGroupChanged(callback){
        //  groupChangedCallback = callback;
            this.groupChangedCallback = callback;
        }
    
	makeParamMap(array){
		var map = {};
		for(var i = 0; i < array.length; i++){
			map[array[i].name] = array[i];
		}
		return map;
	}
	
	//
	//  set values of group params to the given values from the input 
	//
	setParams(param){
		
		var map = this.paramMap;
		Object.keys(param).forEach(function(item){
			map[item].value = param[item];
		}	
		);
		
	}
	
	//
	// return map of parameters {paramName:paramValue}
	//
	getParams(){
		
		var p = {};
		var pa = this.paramArray;
		for(var i = 0; i < pa.length; i++){
			p[pa[i].name] = pa[i].value;
		}
		
		return p;
	}
	
	getParameter(name){
		return this.paramMap[name];
	}
	
	
	
	
	rebuildGui(text=""){ // this.guiParams[name] is presumed defined
		if(this.paramGuiFolder){this.paramGui.removeFolder(this.paramGuiFolder)}
		if(text==""){
			this.paramGuiFolder = this.paramGui.addFolder('Parameters for '+this.guiParams["name"]);
			this.paramGuiFolder.open()}
		else{
			this.paramGuiFolder = this.paramGui.addFolder(text)}
	}
	
	

	
	updateTheGroup()
	{	
		// re-initialize these global variables
		// this will be worked out as we proceed in Step 1
		this.parCounts=[];
		var pparCounts=this.parCounts; //because scope of this not clear in:
		keys.forEach(function(key){pparCounts[key]=0})
		this.parN =0;
		
		var orbifoldString = this.guiParams["name"];
		var hashed = hashOrbifoldString(orbifoldString);
		
		this.errorLog = hashed[0];
		if (this.errorLog != "")// is there an error?
		{	console.log(this.errorLog)
			this.rebuildGui(this.errorLog)
			return false; //not Ok 
		}
		
		this.parN = countParameters(hashed); 
		var rehashed = hashOrbifold(hashed, this.parCounts)
		this.outMessage = "orbifold area = 2pi*"+Number.parseFloat(hashed[5]).toFixed(2).slice(1,-1)+"\nManipulate the "+this.parN+" parameters at right to change the orbifold geometry."
		this.atomList = atomizeOrbifold(rehashed, this.parCounts);
		
	//	console.log(arrayToString(this.atomList))
		
		this.rebuildGui()
		
		var i=0;

		var me = this; 
		lengthKeys.forEach(function(key){
			for(i=1;i<=me.parCounts[key];i++)
			{   
				if(typeof me.guiParams[key+"_"+i.toString()+"_l"] == "undefined")
					{me.guiParams[key+"_"+i.toString()+"_l"] = 2}
				me.paramGuiFolder.add(me.guiParams,key+"_"+i.toString()+"_l",.4,4,me.defaultIncrement).onChange(
                                    function(){
                                    me.groupParamsChanged();
                                    }
                                );

			}
		})

		twistKeys.forEach(function(key){
			for(i=1;i<=me.parCounts[key];i++)
			{   if(typeof me.guiParams[key+"_"+i.toString()+"_t"]== "undefined")
					{me.guiParams[key+"_"+i.toString()+"_t"]=0}
				me.paramGuiFolder.add(me.guiParams,key+"_"+i.toString()+"_t",-.5,.5,me.defaultIncrement).onChange( 
                                    function(){
                                    me.groupParamsChanged();
                                    });
			}
		})
		
		return true; //is Ok
	
	}
	
	updateTheGroupGeometry(){
		this.assembledFD = assembleFundamentalDomain(this.atomList,this.parCounts);
		//console.log(arrayToString(this.assembledFD))
		this.generators = produceGenerators(this.assembledFD[0])
		//console.log(arrayToString(this.generators))
		
		var bounds=[];
		var i,ss;
		var fdpts= this.assembledFD[0][0];
		for(i=0;i<fdpts.length;i++){
			bounds.push(convertToSplane(centerOfGeodesicThrough(fdpts[i],fdpts[(i+1)%(fdpts.length)])))}
		var transforms=this.generators.map(gen=> gen.map(sp =>convertToSplane(sp)))
    
		this.FD={s:bounds,t:transforms};
//		console.log("sides "+arrayToString(bounds.map(x=>x.v))+"\ntransforms "+arrayToString(transforms.map(x=>x.map(x=>x.v))))
		
		
	}

	getGroup(){return this.FD}	
	
} // class Group_GeneralHyperbolic 


// this is not inside the class because dat.gui onChange() doesn't seem to play nice
// I'm missing how to manage this'es.

function groupNameChanged(){
    console.log("********************************groupnamechanged")
	var okQ = theGroup.updateTheGroup();
	if(okQ){groupParamsChanged()};
	// else what? Not really clear what the right behavior should be. 
	// the group doesn't change, but the symbol in the text box is wrong.
}

function groupParamsChanged(){
    console.log("**********************3params changed")
	theGroup.updateTheGroupGeometry();
	
	//there's a little dance here; the general group constructor is called in the renderer's
	// constructor, before render.onParamChanged is defined. 
	// However the constructor will call a render
	//if(render /*exists*/){render.onParamChanged()}
  if(groupChangedCallback !== undefined) groupChangedCallback();
}






//////////////////////////////////////////////////

//////////////////////////////////////////////////

// GEOMETRIZING AN ORBIFOLD

//////////////////////////////////////////////////

/* 
An orbifold is described by its topology: 
each handle is represented by an O (or o), each cross cap by an X (or x), and each boundary by a *
Cone points in the interior of an orbifold are denoted by a counting number >=2; 
and corner points on a boundary are similarly denoted, following *. 
Numbers >=10 are demarcated by parenthesis. 

As loosely described in Thurstons Geometry of Three-Manifolds, and at somewhat greater length in Adam Deaton's 
1994 Princeton University undergraduate thesis, we may geometrize an orbifold by first 
decomposing it into "atoms" hyperbolic triangles, hats and pillows, of the form *pqr, p*r, pqr, where 
the vertices may be cone or corners. Following Thurston, however, the angles may be imaginary, 
giving geodesics that are perpendicular to the sides of the triangle. Atoms are then unfolded into 
polygons, and then reassembled into a fundamental domain. 

However, in order to ensure the atoms have hyperbolic structure, some features must be combined, such as 
pairs of 2-fold cone points or corners. We will end up with edges of the types listed as "keys"

*/



var keys = ["handle", "cap", "conePt", "conePair", "tube", "mirror", "mirrorRedundant", 
			"cornerPair", "fold", "band", "slice", "cuttingEdge","conjCuttingEdge","edge"];

// these keys will have a length parameter; the length of an edge with any of these keys can be varied
var lengthKeys = ["handle", "cap","fold", "conePt", "conePair", "tube","band", "slice", "cornerPair"];

// these keys will have an additional twist parameter
var twistKeys = ["handle", "conePair", "tube"];


// Given a string putatively describing a hyperbolic orbifold, return
// [errorMessage, handlesN, crosscapsN, conepoints, kaleidoscopes, eulerchar]
//  errorMessage ="" is the string is ok;  
//  handlesN, crosscapsN are the numbers of handles and crosscaps respectively
// conepoints is an array of conepoint orders
// kaleidoscopes is an array of arrays of cornerpoint orders; 
// eulerchar is the orbifold Euler characteristic.
// For example,  43xo**33x2 => ["",1,2,[4,3,2],[[],[3,3]],-6.5833]
function hashOrbifoldString(orbifoldString)
{
    var substring = orbifoldString;
    var handlesN = 0;
    var crosscapsN = 0;
    var conepoints = [];
    var kaleidoscopes = [];
    var noErrorQ = true;
    var notOnKaleidoQ = true;
    var inParensQ = false;
    var currentN = 0;
    var errorMessage = "";
    var tempString = "";
    var digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    var tempCntr = 0;

    while (substring !== "" && noErrorQ)
    {
        s = substring[0];
        substring = substring.substr(1);
        if (inParensQ)//if we're somewhere after an opening "("
        {
            if (s === ')')// and we're now closing up a ")"
            {
                inParensQ = false;
                if (currentN === 0 || currentN === 1)//do we have a valid number?
                {
                    noErrorQ = false;
                    if (notOnKaleidoQ) {
                        errorMessage = 'Cone point of order ' + currentN
                    }
                    else {
                        errorMessage = 'Kaleidoscopic point of order ' + currentN
                    }
                }
            }

            else //otherwise, still in the parentheses, but check if we have a number
            if (digits.includes(s)) {
                currentN = currentN * 10 + Number(s)
            }
            else {
                errorMessage = 'Poorly formed expression'
            }
        }

        else // so we're not in parantheses:
        if (s === '(') {
            inParensQ = true;
        }
        else if (digits.includes(s)) {
            currentN = Number(s);
            if (currentN == 0 || currentN == 1)
            {
                noErrorQ = false;
                if (notOnKaleidoQ) {
                    errorMessage = 'Cone point of order ' + currentN
                }
                else {
                    errorMessage = 'Kaleidoscopic point of order ' + currentN
                }
            }
        }
        else if (s === 'x' || s === 'X') {
            notOnKaleidoQ = true;
            crosscapsN++;
        }
        else if (s === 'o' || s === 'O') {
            notOnKaleidoQ = true;
            handlesN++;
        }
        else if (s === '*') {
            notOnKaleidoQ = false;
            kaleidoscopes.push([]);
        }
        else {
            noErrorQ = false;
            errorMessage = 'Poorly formed expression';
        }


        if (currentN != 0 && noErrorQ && !inParensQ) {
            if (notOnKaleidoQ) {
                conepoints.push(currentN)
            }
            else {
                var lastScope = kaleidoscopes.pop();
                lastScope.push(currentN);
                kaleidoscopes.push(lastScope);
            }
        }
        if (!inParensQ) {
            currentN = 0
        }
    }


    if (noErrorQ && handlesN == 0 && crosscapsN == 0)
    {
        //still have some checking to do!
        if (conepoints.length == 0)
        {
            //verify that the kaleidos are in good shape
            if (kaleidoscopes.length == 0)
            {
                noErrorQ = false;
                errorMessage = "Empty orbifold!" 
            }
            else if (kaleidoscopes.length == 1)
            {
                var lastScope = kaleidoscopes[kaleidoscopes.length - 1];
                if (lastScope.length == 1)
                {
                    noErrorQ = false;
                    errorMessage =
                    "Single kaleidoscopic point -- not yet implemented" // *n
                }
                else if (lastScope.length == 2)
                {
                    if (!(lastScope[lastScope.length - 1] === lastScope[lastScope.length - 2]))
                    {
                        noErrorQ = false;
                        errorMessage = "Poorly formed orbifold" // a teardrop of the form *pq, p!=q
                    }
                }
            }
        }
        else if (kaleidoscopes.length == 0)
        {
            if (conepoints.length == 1)
            {
                noErrorQ = false;
                errorMessage =
                "Single rotation point -- not yet implemented"  // n
 
            }
            else if (conepoints.length == 2)
            {
                if (!(conepoints[conepoints.length - 1] == conepoints[conepoints.length - 2]))
                {
                    noErrorQ = false;
                    errorMessage = "Poorly formed orbifold" // a teardrop of the form pq, p!=q
                }
            }
        }
    }

    var eulerchar = NaN;

    if (errorMessage == "") {
        // let's calculate Euler characteristic 
        eulerchar = 2 - 2 * handlesN - crosscapsN - kaleidoscopes.length;
        conepoints.forEach(function(conept) {
            eulerchar = eulerchar - (1 - 1 / conept)
        });
        kaleidoscopes.forEach(function(kscope) {
            kscope.forEach(function(cornerpt) {
                eulerchar = eulerchar - .5 * (1 - 1 / cornerpt)
            })
        })


        if (eulerchar > -0.001) // the smallest negative orbifold is *237 of char -1/84
        {
            errorMessage = "Only hyperbolic symmetries supported for now"
        }

    }

    return [errorMessage, handlesN, crosscapsN, conepoints, kaleidoscopes, eulerchar]
}



function countParameters(hashedOrbifold) {
    // We work out the number of parameters; this information is stashed in theGroup.parN 
	// but is not really used, except in messages in the gui.

    var numParameters = -6 + 6 * hashedOrbifold[1] + 3 * hashedOrbifold[2] + 2 * hashedOrbifold[3].length +
    3 * hashedOrbifold[4].length;
    hashedOrbifold[4].forEach(function(kal) {
        numParameters = numParameters + kal.length
    })
    return numParameters

}

function hashOrbifold(hashedOrbifold,parCounts)
{
    //we assume that the orbifold is in the form outputted by hashOrbifoldString
    if (!(hashedOrbifold[0] === "")) {
        return hashedOrbifold[0]
    }

    //we will not worry about converting mixed handles and crosscaps to all crosscaps.

    /* As per Deaton's thesis, we will
    		a) convert pairs of 2-fold cone points to 'rot2 cone points'
            b) if there is a mirror and an extra 2-fold point, convert this to a fold
            c) open up all the handles and crosscaps
            d) create one kaleidoscope by cutting along "bands"
		This ensures that there will be a well-defined procedure for chopping the orbifold up into
		hyperbolic atoms.
    
    */

// We will return [newConePointList, nextnewKaleidoList], each an array of numbers and keys.
// parCounts will store the number of each kind of key, as well as the index of the last of that key added
// Ultimately, parCounts is part of the theGroup structure. 

    var newConePointList = [];
    var newKaleidoList = [];
    var i;

    //handles
    for (i = 1; i <= hashedOrbifold[1]; i++)
    {
        newConePointList.push(["handle", i]);
        newConePointList.push(["handle", /*-*/i]); 
			//we would need to know which is which if we are 
			//concerned about removing conjugate generators, and can encode this in the sign of the key
			//If this is used, be sure to take abs when finding matching edges to produce generators.
			//However, in the current version of the code, this is not necessary or helpful.
    }
    parCounts["handle"] = i - 1; // these will actually get two parameters, a twist and a length.

    //crosscaps
    for (i = 1; i <= hashedOrbifold[2]; i++)
    {
        newConePointList.push(["cap", i]);
    }
    parCounts["cap"] = i - 1; //working??

    // cone points, glomming pairs of 2-fold points together...
    var paired2Q = false;

    var i = 0;
    hashedOrbifold[3].forEach(function(conept) {

        if (conept != 2) {
            newConePointList.push(["conePt", conept])
        }
        else if (paired2Q) {
            i++;
            newConePointList.push(["conePair", i]);
            paired2Q = false
        }
        else {
            paired2Q = true;
        }
    })
    parCounts["conePair"] = i;
    parCounts["fold"] = 0;

    //... but if there's a leftover 2-fold cone point:
    if (paired2Q) {
        // and no mirror, put it on the cone list
        if (hashedOrbifold[4].length == 0) {
            newConePointList.push(["conePt", 2])
        }
        else // add a fold corner onto the newKaleidolist
        {
            newKaleidoList.push(["fold", 1]);
            parCounts["fold"] = 1;
        }
    }

    // now on to the bands

    // if there ARE any kaleidos to worry about
    if (hashedOrbifold[4].length > 0)
    {
        if (hashedOrbifold[4].length == 1 &&
        hashedOrbifold[4][0].length == 0 &&
        parCounts["fold"] == 0)
			// if there's really just one mirror, 
			// we need something to know it's there;
        {
            newKaleidoList.push("mirror"); 
            parCounts["mirror"] = 1;
        }
        //put the first one on the new list
/// It would be better to figure out how to distribute these across the orbifold ///
/// instead of stacking them all up on one edge.
/// *** There is definitely room for improvement
        {
            hashedOrbifold[4][0].forEach(function(corner) {
                newKaleidoList.push(["corner", corner])
            })// now add any others, together with bands
            i = 0;
            hashedOrbifold[4].slice(1).forEach(function(kaleido)
            {
                i++;
                newKaleidoList.push(["band", i])
                kaleido.forEach(function(corner) {
                    newKaleidoList.push(["corner", corner])
                });
            });
            parCounts["band"]=i;
            //now add the remaining bands
            for (i; i > 0; i--)
            {
                newKaleidoList.push(["band", i])
            }
        }
    }

    //now we need to go through and remove consecutive pairs of two fold rotations.
    // since there are bands at the end of this list, don't have to check first vs last.

    var nextnewKaleidoList = [];
    var paired2Q = false;
	parCounts["cornerPair"]=0;
    newKaleidoList.forEach(function(corner) {
        if (corner.length == 2 && corner[0] == "corner" && corner[1] == 2)
        {
            if (paired2Q) {
               	parCounts["cornerPair"]++;
                nextnewKaleidoList.push(["cornerPair", parCounts["cornerPair"]]);
                paired2Q = false;
            }
            else {
                paired2Q = true // and we're waiting for another 
            }
        }
        else {
            //we have anything else
            if (paired2Q) {
                nextnewKaleidoList.push(["corner", 2])
            }
         	nextnewKaleidoList.push(corner);
            paired2Q = false;
        }
    });
    if (paired2Q == true) {
        // we have an unmatched pair at the end
        nextnewKaleidoList.push(["corner", 2])
    }
    return [newConePointList, nextnewKaleidoList]
}



// now we atomize the orbifold, creating a list of atoms, of twelve flavors. We cut out pairs of cones
// using "tube"s and pairs of corners, or a cone and a piece of mirror using "slice"s; tubes have variable
// length and twist; slices have variable length. 

// There are a few options here that can be played with, if there are both mirrors and cones: 
// 1) can carve off all of the cone points _first_, and then cut to the mirror; this gives
//     a lot of twist parameters
// 2) can cut all the cones out to the mirrors, and then cut the mirrors. This gives very 
//     few twist parameters
// 3) can just do this all randomly.

// It's really not clear a priori what the right approach is, and it might be interesting to 
// experiment. For the time being, we're going with option #2
// Also: the new slices are put on the other end from what's sliced next; i.e. new slices
// are sliced last; this ensures a tree-like structure in the cutting. 


function atomizeOrbifold(hashedOrbifold,parCounts) {

    var atomList = [];
    var cones = hashedOrbifold[0]; // shorthand for the original lists 
    var kaleidos = hashedOrbifold[1];
    var noKaleidosQ = (kaleidos.length == 0) // are there any kaleidos
    var sliceN = 0;
    var tubeN = 0;

    while ( (cones.length > 0 || kaleidos.length > 0))
    {	// we have a few elemental cases to take care of:
		if(kaleidos.length==1 && kaleidos[0]=="mirror"){
		// If there is a single, uncornered kaleido, kaleidos == ["mirror"], 
		// since euler char is negative, the only possibility is that either there 
		// are more than two cones, in which case, the algorithm will work correctly, 
		// or exactly two cones, in which case we need to work by hand. There cannot be no 
		// cones or just one cone.
		kaleidos=[];
		if(cones.length==2){
			sliceN++;
			atomList.push([[["slice", sliceN]], [cones[0]]])
			atomList.push([[["slice", sliceN]], [cones[1]]])
			cones=[];	
			}
		}
		else if (kaleidos.length==1 && cones.length==1){
			atomList.push([kaleidos,cones])
			kaleidos =[];
			cones=[];
		}
        else if (!noKaleidosQ && cones.length > 0 
        )// remove a cone and slice to the kaleido
        {
            sliceN++;
            kaleidos.unshift(["slice", sliceN]);
            var cone = cones.pop();
            atomList.push([[["slice", sliceN]], [cone]])
        }
        else if (cones.length > 3)// so no kaleidos but lots of cones
        {
            tubeN++;
            var cone1 = cones.pop();
            var cone2 = cones.pop();
            cones.unshift(["tube", tubeN]);
            // let's put these in order: conePts need to go first.
            if (cone1[0] != "conePt")// then can't go wrong by swapping
            {
                var cc = cone1;
                cone1 = cone2;
                cone2 = cc;
            }
            atomList.push([[], [cone1, cone2, ["tube", tubeN]]])
        }
        else if (cones.length == 3)// remember-- we're in negative Euler char, so can't just have two
        {
            var cone0 = cones.pop();
            var cone1 = cones.pop();
            var cone2 = cones.pop();
            var cc;
            if (cone0[0] != "conePt")
            {
                cc = cone2;
                cone2 = cone0;
                cone0 = cc;
            }
            if (cone0[0] != "conePt")
            {
                cc = cone1;
                cone1 = cone0;
                cone0 = cc;
            }
			else if (cone1[0]!="conePt")
			{
				cc=cone1;
				cone1=cone2;
				cone2=cc;
			}
            // so now any legit conePts are first
            atomList.push([[], [cone0, cone1, cone2]])
        }
        else // no cone points 
        if (kaleidos.length > 3)
        {
            sliceN++;
            var kal0 = kaleidos.pop();
            var kal1 = kaleidos.pop();
            if (kal0[0] != "corner")
            {
                var kk = kal0;
                kal0 = kal1;
                kal1 = kk;
            }
            kaleidos.unshift(["slice", sliceN])
            atomList.push([[kal0, kal1, ["slice", sliceN]], []])
        }
        else if(kaleidos.length==3)// last three kaleidoscopic corners
		// this particularly is assuming negative euler char.
        {
            var kal0 = kaleidos.pop();
            var kal1 = kaleidos.pop();
            var kal2 = kaleidos.pop();
            if (kal0[0] != "corner") {
                var kk = kal2;
                kal2 = kal0;
                kal0 = kk;
            }
            if (kal0[0] != "corner") {
                var kk = kal1;
                kal1 = kal0;
                kal0 = kk;
            }
            atomList.push([[kal0, kal1, kal2], []])
        }
		 else {kaleidos = []}// this should never happen
		
    }
    parCounts["tube"] = tubeN;
    parCounts["slice"] = sliceN;
    return atomList
}


// As we prepare to unfold and geometrize the atoms, we define a couple of utilities.
// We will also make heavy use of mobius transformations preserving the unit disk, as described 
// further down in this file. 

// The length of the edge between p and q in a triangle with opposite angle r; 
// Angles may be real [x,0] (an angle) or imaginary [0,x] (a length) this geometry is mostly described in 
// Thurston's Geometry of Three Manifolds, and in Deaton's Thesis. Some details are missing. 

function edgeLength(p, q, r) {
    var cp,sp,cq,sq,cr,ll;
    if (p[0] != 0) {
        cp = cos(p[0]);
        sp = sin(p[0]);
    }
    else {
        cp = cosh(p[1]);
        sp = sinh(p[1]);
    }
    if (q[0] != 0) {
        cq = cos(q[0]);
        sq = sin(q[0]);
    }
    else {
        cq = cosh(q[1]);
        sq = sinh(q[1]);
    }
    if (r[0] != 0) {
        cr = cos(r[0]);
    }
    else {
        cr = cosh(r[1]);
    }
    ll = (cp * cq + cr) / (sp * sq);
    if ((p[0] == 0 && q[0] == 0) || (p[1] == 0 && q[1] == 0)) {
        return acosh(ll)
    }
    else {
        return asinh(ll)
    }
}


// this is an interface back to the gui, getting hold of the length and twist parameters 

function getLength(key) {
    if(theGroup.parCounts[key[0]]<abs(key[1])){return 1.1}
//	else if (guiParams = {}){return 2}
  	else{  
		return theGroup.guiParams[key[0]+"_"+abs(key[1]).toString()+"_l"];}
}

function getTwist(key) {
  	if(theGroup.parCounts[key[0]]<abs(key[1])){return 0}
//	else if (guiParams = {}){return 0}
  	else{  
		return theGroup.guiParams[key[0]+"_"+abs(key[1]).toString()+"_t"];}
}

function useMirrorQ(key) {
	// In an unfolded atom, some mirror lines are redundant and will not be used 
	if (["corner","fold","cornerPair","band","conjCuttingEdge"].indexOf(key[0]) < 0) {return "mirrorRedundant"}
	else {return "mirror"}
}

//
//  The main action: geometrizing our atoms
// 
function unfoldAtom(atom,parCounts) {
    var unfoldedAtom = [[], []];
    //var pi = pi;
    var pi2 = pi / 2;
    var O = [0, 0]; //capital o
    var I = [1, 0];

    // we have TWELVE cases to sort out. 
    // we assume we've gotten our features in order of real first, then imaginary 
    
    // the returned structure here is kind of dumb and probably could be improved:
    // [ vertices, edges]
    // each vertex [[real,im],cone], cone = 0 if not a rotation point
    // each edge is [type,number] or "mirror"


	// There are many other possibilities for how to cut open a pillow or hat
    var a,b,c,l,m,n,p,q,r,P,Q,R,w,y,z;

    // do we have a sheet
    if (atom[1].length == 0)
    {
        /* we have a sheet*/
        a = atom[0][0];
        b = atom[0][1];
        c = atom[0][2];
        if (atom[0][2][0] == "corner")
        {
            /* we have three real corners */
            p = [pi / a[1], 0];
            q = [pi / b[1], 0];
            r = [pi / c[1], 0];
			P = edgeLength(q, r, p);
            R = edgeLength(p, q, r);
            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, R);
            unfoldedAtom[0].push(y);
            unfoldedAtom[0].push(
            poincareTurtleMove(O, y, -pi/b[1], P))
            unfoldedAtom[1] = ["mirror", "mirror", "mirror"];

        }
        else if (atom[0][1][0] == "corner")
        {
            /* we have two real corners */
            p = [pi / a[1], 0];
            q = [pi / b[1], 0];
            r = [0, getLength(c)];
            P = edgeLength(q, r, p);
            R = edgeLength(p, q, r);

            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, R);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O, y, -pi / b[1], P);
            unfoldedAtom[0].push(z);
            z = poincareTurtleMove(y, z, -pi / 2, r[1]);
            unfoldedAtom[0].push(z);
            unfoldedAtom[1] = ["mirror", "mirror", c, useMirrorQ(c)]

        }
        else if (atom[0][0][0] == "corner")
        {
            /* we have one real corner */
            p = [pi / a[1], 0];
            q = [0, getLength(b)];
            r = [0, getLength(c)];
            P = edgeLength(q, r, p);
            R = edgeLength(p, q, r);

            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, R);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O, y, -pi / 2, q[1]);
            unfoldedAtom[0].push(z);
            w = poincareTurtleMove(y, z, -pi / 2, P);
            y = z;
            z = w;
            unfoldedAtom[0].push(z);
            z = poincareTurtleMove(y, z, -pi / 2, r[1]);
            unfoldedAtom[0].push(z);
            unfoldedAtom[1] = ["mirror", b, useMirrorQ(b), c, useMirrorQ(c)]
        }
        else
        {
            p = [0, getLength(a)];
            q = [0, getLength(b)];
            r = [0, getLength(c)];
            P = edgeLength(q, r, p);
            Q = edgeLength(r, p, q);
            R = edgeLength(p, q, r);

            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, R);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O, y, -pi / 2, q[1]);
            unfoldedAtom[0].push(z);
            
            w = poincareTurtleMove(y, z, -pi / 2, P);
            unfoldedAtom[0].push(w);
            y = z;
            z = w;
            
            w = poincareTurtleMove(y, z, -pi / 2, r[1]);
           	unfoldedAtom[0].push(w);
            y = z;
            z = w;
            
            w = poincareTurtleMove(y, z, -pi / 2, Q);
            unfoldedAtom[0].push(w);
            
            
            unfoldedAtom[1] = [useMirrorQ(a), b, useMirrorQ(b), c, useMirrorQ(c),a]

        }
    } //done with the sheets

    else if (atom[0].length == 0)
    {	/* we have a pillow*/
        a = atom[1][0];
        b = atom[1][1];
        c = atom[1][2];
        
        var A1, A2,a1,a2,M;
        
        if (atom[1][2][0] == "conePt") 
        {	// with three real cone points
           	p = [pi / a[1], 0];
            q = [pi / b[1], 0];
            r = [pi / c[1], 0];
            A2 = asin(sqrt(1/(1+Math.pow(cot(p[0])+cos(q[0])/sin(p[0])/cos(r[0]),2))))
            A1 = p[0]-A2;
            M = acosh(cos(q[0])/sin(A1));
            a1 = acosh(cos(A1)/sin(q[0]));
            a2 = acosh(cos(A2)/sin(r[0]));
            
            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, M);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O,y,-pi/2,a1);
            unfoldedAtom[0].push(z);
           
            w=poincareTurtleMove(y,z,-2*q[0],a1);
            unfoldedAtom[0].push(w);
            y=z;z=w;

			w=poincareTurtleMove(y,z,pi,a2)
			unfoldedAtom[0].push(w);
			y=z;z=w;
			
            w=poincareTurtleMove(y,z,-2*r[0],a2);
            unfoldedAtom[0].push(w);
			
			l= parCounts["cuttingEdge"]+1;
			m= parCounts["cuttingEdge"]+2;
			n= parCounts["cuttingEdge"]+3;
			parCounts["cuttingEdge"]+=3;
            unfoldedAtom[1]=[["cuttingEdge",l],["cuttingEdge",m],["cuttingEdge",m],
					["cuttingEdge",n],["cuttingEdge",n],["cuttingEdge",l]];
        }
        else if (atom[1][1][0] == "conePt")
        { // two real cone points, one imaginary
            
            p = [pi / a[1], 0];
            q = [pi / b[1], 0];
            r = [0, getLength(c)];
            A2 = asin(sqrt(1/(1+Math.pow(cot(p[0])+cos(q[0])/sin(p[0])/cosh(r[1]/2),2))))
            A1 = p[0]-A2;
            
            M = acosh(cos(q[0])/sin(A1));
            a1 = acosh(cos(A1)/sin(q[0]));
            a2 = asinh(cos(A2)/sinh(r[1]/2));
           
			unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, M);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O,y,-pi/2,a1);
            unfoldedAtom[0].push(z);
           
            w=poincareTurtleMove(y,z,-2*q[0],a1);
            unfoldedAtom[0].push(w);
            y=z;z=w;
            w=poincareTurtleMove(y,z,pi,a2);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,r[1]);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,a2);
            unfoldedAtom[0].push(w);
			l= parCounts["cuttingEdge"]+1;
			m= parCounts["cuttingEdge"]+2;
			n= parCounts["cuttingEdge"]+3;
			parCounts["cuttingEdge"]+=3;
            unfoldedAtom[1]=[["cuttingEdge",l],["cuttingEdge",m],["cuttingEdge",m],
					["cuttingEdge",n],c,["cuttingEdge",n],["cuttingEdge",l]];
        }
        else if (atom[1][0][0] == "conePt")
        {  // a pillow with one real corner and two imaginary ones
			p = [pi / a[1], 0];
            q = [0, getLength(b)];
            r = [0, getLength(c)];
            A2 = asin(sqrt(1/(1+Math.pow(cot(p[0])+cosh(q[1]/2)/sin(p[0])/cosh(r[1]/2),2))))
            A1 = p[0]-A2;
            
            M = acosh(cosh(q[1]/2)/sin(A1));
            a1 = asinh(cos(A1)/sinh(q[1]/2));
            a2 = asinh(cos(A2)/sinh(r[1]/2));
            
            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, M);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O,y,-pi/2,a1);
            unfoldedAtom[0].push(z);
            
            w=poincareTurtleMove(y,z,-pi/2,q[1]);
            unfoldedAtom[0].push(w);
            y=z;z=w;
           
            w=poincareTurtleMove(y,z,-pi/2,a1);
            unfoldedAtom[0].push(w);
            y=z;z=w;
            
            w=poincareTurtleMove(y,z,pi,a2);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,r[1]);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,a2);
            unfoldedAtom[0].push(w);
            
            l= parCounts["cuttingEdge"]+1;
			m= parCounts["cuttingEdge"]+2;
			n= parCounts["cuttingEdge"]+3;
			parCounts["cuttingEdge"]+=3;
            unfoldedAtom[1]=[["cuttingEdge",l],["cuttingEdge",m],b,["cuttingEdge",m],
					["cuttingEdge",n],c,["cuttingEdge",n],["cuttingEdge",l]];
        }
        else
        { // a pillow with three imaginary cones
            p = [0, getLength(a)];
            q = [0, getLength(b)];
            r = [0, getLength(c)];
            A2 = asinh(sqrt(1/(-1+Math.pow(coth(p[1]/2)+cosh(q[1]/2)/sinh(p[1]/2)/cosh(r[1]/2),2))))
            A1 = p[1]/2-A2;
            
            M = asinh(cosh(r[1]/2)/sinh(A2));
            a1 = asinh(cosh(A1)/sinh(q[1]/2));
            a2 = asinh(cosh(A2)/sinh(r[1]/2));
            
            unfoldedAtom[0].push(O);
            y = poincareTrans(O, O, I, M);
            unfoldedAtom[0].push(y);
            z = poincareTurtleMove(O,y,-pi/2,a1);
            unfoldedAtom[0].push(z);
            
            w=poincareTurtleMove(y,z,-pi/2,q[1]);
            unfoldedAtom[0].push(w);
            y=z;z=w;
           
            w=poincareTurtleMove(y,z,-pi/2,a1);
            unfoldedAtom[0].push(w);
            y=z;z=w;
            
            w=poincareTurtleMove(y,z,pi,a2);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,r[1]);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,a2);
            unfoldedAtom[0].push(w);
            
            y=z;z=w;
            w=poincareTurtleMove(y,z,-pi/2,M);
            unfoldedAtom[0].push(w);
           	l= parCounts["cuttingEdge"]+1;
			m= parCounts["cuttingEdge"]+2;
			n= parCounts["cuttingEdge"]+3;
			parCounts["cuttingEdge"]+=3;
			unfoldedAtom[1]=[["cuttingEdge",l],["cuttingEdge",m],b,["cuttingEdge",m],
						["cuttingEdge",n],c,["cuttingEdge",n],["cuttingEdge",l],a];

        }

    } //done with the pillows 

    else /* we have a hat */
    {
        a = atom[0][0];
        b = atom[1][0];
        
        if (atom[0][0][0] == "corner")
        {
            if (atom[1][0][0] == "conePt")
            {	// a real corner and a real cone
                p = [pi/2, 0];
                q = [pi / b[1], 0];
                r = [pi / a[1]/2, 0];
                 
                
                Q = edgeLength(r, p, q);
               	R = edgeLength(p, q, r);
                
            	unfoldedAtom[0].push(O);
				y = poincareTrans(O, O, I, Q);
                unfoldedAtom[0].push(y);
                
            	z = poincareTurtleMove(O,y,-pi/2,R);
            	unfoldedAtom[0].push(z);
                                      
            	w=poincareTurtleMove(y,z,-2*pi/b[1],R);
            	unfoldedAtom[0].push(w);
				parCounts["cuttingEdge"]++;
				l= parCounts["cuttingEdge"];
                
				unfoldedAtom[1]=["mirror",["cuttingEdge",l],["cuttingEdge",l],"mirrorRedundant"];
            }
            else {
                // a real corner and an imaginary cone
                p = [pi/2, 0];
                q = [0, getLength(b)/2];
                r = [pi / a[1]/2, 0];
                
                Q = edgeLength(r, p, q);
               	R = edgeLength(p, q, r);
                
                unfoldedAtom[0].push(O);
				y = poincareTrans(O, O, I, Q);
                unfoldedAtom[0].push(y);
                
            	z = poincareTurtleMove(O,y,-pi/2,R);
            	unfoldedAtom[0].push(z);
                                      
            	w=poincareTurtleMove(y,z,-pi/2,q[1]*2);
            	unfoldedAtom[0].push(w);
                
                
            	y=z;z=w;
            	w=poincareTurtleMove(y,z,-pi/2,R);
            	unfoldedAtom[0].push(w);
                
                parCounts["cuttingEdge"]++;
				l= parCounts["cuttingEdge"];
				unfoldedAtom[1]=["mirror",["cuttingEdge",l],b,["cuttingEdge",l],"mirrorRedundant"];
                
            }
        }

        else
        {
            if (atom[1][0][0] == "conePt")
            { 
               // an imaginary corner point and a real cone
                p = [pi/2,0];
                q = [pi/b[1],0];
                r = [0, getLength(a)/2];
                
                Q = edgeLength(r, p, q);
               	R = edgeLength(p, q, r);
                
                
                y = poincareTrans(O, O, I, r[1]);
                unfoldedAtom[0].push(y);
                
            	z = poincareTurtleMove(O,y,-pi/2,Q);
            	unfoldedAtom[0].push(z);
                                      
            	w=poincareTurtleMove(y,z,-pi/2,R);
            	unfoldedAtom[0].push(w);
                
                
            	y=z;z=w;
            	w=poincareTurtleMove(y,z,-2*pi/b[1],R);
            	unfoldedAtom[0].push(w);
                
                y=z;z=w;
            	w=poincareTurtleMove(y,z,-pi/2,Q);
            	unfoldedAtom[0].push(w);
                
             	parCounts["cuttingEdge"]++;
				l= parCounts["cuttingEdge"];
				unfoldedAtom[1]=
					[useMirrorQ(a),["cuttingEdge",l],["cuttingEdge",l],"mirrorRedundant",a];
				
            }
            else {
                p = [pi/2,0];
				q = [0, getLength(b)/2];
                r = [0, getLength(a)/2];
                
                Q = edgeLength(r, p, q);
               	R = edgeLength(p, q, r);
                
                y = poincareTrans(O, O, I, r[1]);
                unfoldedAtom[0].push(y);
                
            	z = poincareTurtleMove(O,y,-pi/2,Q);
            	unfoldedAtom[0].push(z);
                
                w=poincareTurtleMove(y,z,-pi/2,R);
            	unfoldedAtom[0].push(w); // old error b[1]
                
            	y=z;z=w;
            	w=poincareTurtleMove(y,z,-pi/2,q[1]*2);
            	unfoldedAtom[0].push(w);
                
            	y=z;z=w;
            	w=poincareTurtleMove(y,z,-pi/2,R);
            	unfoldedAtom[0].push(w);
                
                y=z;z=w;
            	w=poincareTurtleMove(y,z,-pi/2,Q);
            	unfoldedAtom[0].push(w);
                
				parCounts["cuttingEdge"]++;
				l= parCounts["cuttingEdge"];
				unfoldedAtom[1]=
					[useMirrorQ(a),["cuttingEdge",l],b,["cuttingEdge",l],"mirrorRedundant",a];
			}
        }

    } // done with the hats

    return unfoldedAtom
}


// As we reassemble these into a fundamental domain, we continually recenter, to keep 
// the domain from growing off into a numerically less stable regime, closer to the boundary of the 
// Poincare disk. 

// We're keeping this recentering very simplistic: just transform the Euclidean center
// of the vertices to the origin

function recenterDomain(domain)
{	var center = [0,0];
	var n = domain[0].length;
 
	domain[0].forEach(function(pt){
		center[0]+=pt[0]; center[1]+=pt[1];
	})
    
	center[0] = center[0]/n;
	center[1] = center[1]/n;
 
	var newDomain = domain;
	var i = 0;
	for (i = 0; i<domain[0].length; i++){
		newDomain[0][i]=
		poincareTransToO(domain[0][i],center)
	}
	return newDomain
}

function centerOfDomain(domain){
	var center = [0,0];
	var n = domain[0].length;

	domain[0].forEach(function(pt){
		center[0]+=pt[0]; center[1]+=pt[1];
	})

	center[0] = center[0]/n;
	center[1] = center[1]/n;
	
	return center
    
}

function moveDomain(domain,mob){
    var newDomain = domain;
    var i;
    for(i=0; i<domain[0].length;i++){
        newDomain[0][i]=
            applyMobius(domain[0][i],mob)
    }
    return newDomain
}


function isSameEdgeTypeQ(edge1,edge2){
    // this is a stupid kludge
    // edge1 will always be a [key,n]
    // edge2 might be a string or might be [key,n]
    return (Array.isArray(edge2) && edge1[0]==edge2[0] && edge1[1]==edge2[1])
}

function assembleFundamentalDomain(atomList,parCounts)
{ 
	// starting from a dissected list of atoms,
	// returns a fundamental domain, using the conventions of the individual atoms
  //  [vertList,edgeList]
  //  where vertList =  [ points [[x,y],n] where n>0 iff a cone point of order n]
  // edge list is a list of [key,index], or if no need to match (say "mirror"), just key
  // We will also keep track of any of slice and tube edges that are deleted, so that we can
  // add them to the interface

	parCounts["cuttingEdge"] = 0; //initialize these
	
  	var workingAtomList = [];
  	atomList.forEach(function(atom){workingAtomList.push(unfoldAtom(atom,parCounts))
  })

 	var nextAtom = workingAtomList.shift();
    
    nextAtom = recenterDomain(nextAtom);
    
    var workingFD = nextAtom.slice(0);
	var internalFDedges=[];
    
    var openAttachments = [];
    
    nextAtom[1].forEach(function(edge){
        if(edge[0]=="tube"|| edge[0]=="slice"){
            openAttachments.push(edge)
        } })
    
    while(openAttachments.length>0)
        {
            // as long as there are open attachments... 
            var nextAttachment = openAttachments.pop();
            
            // advance the working fundamental domain so that this is in front;
            while (!isSameEdgeTypeQ(nextAttachment, workingFD[1][0]))
                   {
                       workingFD[0].push(workingFD[0].shift())
                       workingFD[1].push(workingFD[1].shift());
                   }
            
            
            // now find the atom with the right attachment!
            
            var foundAttachmentQ=false;
            
            while(!foundAttachmentQ){
                nextAtom = workingAtomList.shift();
                // is this it?
                var len = nextAtom[1].length;
                while(!foundAttachmentQ && len>0)
                    { len--;
                      if(isSameEdgeTypeQ(nextAttachment, nextAtom[1][0]))
                          {
                              foundAttachmentQ = true;                              
                          }
                     else { 
                         nextAtom[0].push(nextAtom[0].shift());
                		 nextAtom[1].push(nextAtom[1].shift());
                     	} 
                    }
                if(!foundAttachmentQ){
                  workingAtomList.push(nextAtom); // and move on
                }
            }
            
            // at this point, both the fundamental domain and the next atom should have the 
            // attachment in the front. 
            
            // add any outstanding attachments
            // pop off the first edge from the found atom (since that's the used attachment)
            // and look through the others.
            
            edge = nextAtom[1].shift();
            nextAtom[1].forEach(function(edge){
        		if(edge[0]=="tube"|| edge[0]=="slice"){
            		openAttachments.push(edge)}})
            nextAtom[1].unshift(edge);
            
            
            // now shift the atom over to the fundamental domain
            
            var shift =0;
			var a,b,c;
			a = nextAtom[1][0];
			b = Array.isArray(nextAtom[1][0]);
			c = nextAtom[1][0][0];
            if(Array.isArray(nextAtom[1][0])&& nextAtom[1][0][0]=="tube"){
                shift = getTwist(nextAtom[1][0])
            }
            var mob = mobiusEdgeToEdge(
                	[nextAtom[0][0],nextAtom[0][1]],[workingFD[0][0],workingFD[0][1]],shift)
                     
            var newAtom = moveDomain(nextAtom,mob)
            
			// to keep track of the internal edges, so that they might possibly be drawn
		 	internalFDedges.push([[workingFD[0][0],workingFD[0][1]],nextAttachment]);
		
			// needs more care:
			// for now just keep as it is.
			if(nextAttachment[0]=="tube"){
				if(shift==0){
					workingFD = [(workingFD[0].slice(2)).concat(newAtom[0].slice(2)),
		                         ((workingFD[1].slice(2)).concat(newAtom[1].slice(2,-1)).concat([workingFD[1][1]]))]
				}
				else { 
					workingFD = [(workingFD[0].slice(1)).concat([workingFD[0][0]]).concat(newAtom[0].slice(1)).concat([newAtom[0][0]]),
					workingFD[1].slice(1).concat(["edge","edge"]).concat(newAtom[1].slice(2,-1)).concat(["edge","edge"])]
				}
			}
			else{
				workingFD = [(workingFD[0].slice(2)).concat(newAtom[0].slice(2)),
	                         (workingFD[1].slice(2)).concat(newAtom[1].slice(2))]
			}
			
            


            // finally, recenter the working FD
			//workingFD = recenterDomain(recenterDomain(recenterDomain(workingFD)))
		
			var move = poincareTransMob([0,0],[.001,.002]);
			workingFD = moveDomain(workingFD,move);
			internalFDedges = internalFDedges.map(edge=>[[applyMobius(edge[0][0],move),
				applyMobius(edge[0][1],move)],edge[1]]);
			
			var centerFD,  i, newedges, recenteringN;
			
			recenteringN=0;
			
			for(i=0;i<recenteringN;i++){
		 		centerFD = centerOfDomain(workingFD);
				move = [[-1,0],cConj(centerFD),true];
				workingFD=moveDomain(workingFD,move);
				newedges=[];
				internalFDedges.forEach(function(edge){
				newedges.push([[applyMobius(edge[0][0],move),
					applyMobius(edge[0][1],move)],edge[1]])
				})
				internalFDedges=newedges;
			}
        }
    	return [workingFD, internalFDedges]
}

  


function produceGenerators(fundamentalDomain){
	// walk through the generator keys, identifying each edge or pair of edges, 
	// then produce the transforms that accomplish these
	
	// There are many ways to approach this: for example, we might include inverses, or not,
	// or conjugates, or not. Much of this really depends on how the generators are going to be used.
	
	// In the current code, each edge bounding a presumed-convex fundamental domain gets a single list
	// of circles through which to invert, a single generator. 
	
	// Currently, colinear edges are both included, even though Bulatov's algorithm will use only one;
	// This is because we may need all neighboring group elements when constructing Direchlet domains
	// in the non-convex case. 
	
	
	var generators=[];  // as Mobius Transforms
	var sPlanes = []; // as lists of centers of inversion
	
	var points = fundamentalDomain[0];
	var edges = fundamentalDomain[1];
	
	// walk through and find the matching pairs of handles, cutting edges, and conj cutting edges
	// producing generators in order of the edges -- some work will be doubled, but this is a 
	// pretty fast procedure.
	
	var edge;
	var i,j;
	var foundQ=false;
	
	for(i=0; i<edges.length; i++){
		edge = edges[i];
		key = edge[0];
		foundQ=false;
		switch(key){
			case "handle":
			case "cuttingEdge":
			case "conjCuttingEdge":
			case "band":
				j=0;
				while(!foundQ && j<edges.length){
					foundQ = ((i!=j)&&(edges[j][0]==edge[0])&&(edges[j][1]==edge[1]));
					if(!foundQ){j++}}			
				if(j==edges.length){break;}//oops!
				//otherwise, we have a match!
				var p1=points[i],
					p2=points[(i+1)%points.length],
					q1=points[j],
					q2=points[(j+1)%points.length],
					v1,v2;
				var shift = 0;
				if(key=="handle"){shift = getTwist(edge)}
				if(shift!=0){
					v1=p1;
					v2=p2;
					p1 =poincareTrans(v1,v1,v2,shift*getLength(edge))
					p2 = poincareTrans(v2,v1,v2,shift*getLength(edge))
					}
				
				var centers = centersOfMovingEdge1ToEdge2([p1,p2],[q2,q1])
				sPlanes.push(centers);
				//sPlanes.push([centers[1],centers[0]]);
		 		//generators.push(
				//compMob(poincareInversion(centers[0]),poincareInversion(centers[1])));
				//generators.push(
					//	compMob(poincareInversion(centers[1]),poincareInversion(centers[0])));
				break;
			
			
			case "conePair":
				var d=getTwist(edge);
				var e=getLength(edge);
				var q=points[i],
					r=points[(i+1)%points.length];
				// the two rotation points are not both needed
				var point = poincareTrans(q,q,r,d*e/2) //,poincareTrans(q,q,r,(d+1)*e/2)]
				//rpots.forEach(function(point){ 
					var centers = centersOfRotation(point,pi)// centers of inversion
					sPlanes.push(centers)
					//generators.push(compMob(poincareInversion(centers[0]),poincareInversion(centers[1]),true)); // don't need inverse!
						//})
				break;
			
			case "cap":
				var e=getLength(edge),
					p=points[i],
					q=points[(i+1)%points.length],
					v=poincareTrans(p,p,q,e/4),
					w=poincareTrans(p,p,q,e/2),
					centers = [inversionSwapping(v,p),inversionSwapping(v,w),reflectAcross(p,q)];
				sPlanes.push(centers);
			//	generators.push(poincareMobFromInversionList(centers));
			//	generators.push(poincareMobFromInversionList(arrayReverse(centers)))
				break;
			
			case "cornerPair":
			case "m":	
				//if(edge=="mirror")
				//{
					var p = points[i],
						q = points[(i+1)%points.length];
						center = reflectAcross(p,q);
					sPlanes.push([center])
					//generators.push(poincareInversion(center));
					//}
				break;
			
			case "fold":
				var p = points[i], q = points[(i+1)%points.length];
				var e=getLength(edge), v=poincareTrans(p,p,q,e/2);
				centers = centersOfRotation(v,pi);
				sPlanes.push(centers);
		//		generators.push(poincareMobFromInversionList(centers));
				
		}
			
	}
	
	return sPlanes
	
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///  UTILITIES

//for use in converting floats to strings
var prec = 10


function complexToString(cc){
	return cc[0].toFixed(prec)+"+ i"+cc[1].toFixed(prec)
}

function arrayEqualArray(a,b){
	if(Array.isArray(a)){
		if(Array.isArray(b)){
			var matchSoFarQ = (a.length==b.length);
			var i=0;
			while(matchSoFarQ && i<a.length)
			{
				matchSoFarQ = (arrayEqualArray(a[i],b[i]));
				i++;
			}
			return matchSoFarQ;
		}
		else return false;
	}
	else if (Array.isArray(b)){return false;}
	else return (a==b);
}

function arrayInArray(outer,inner){
	if(Array.isArray(outer)){
		if(Array.isArray(inner)){
			var foundQ = false;
			var i = 0;
			while(!foundQ && i<outer.length){
				foundQ = arrayEqualArray(inner, outer[i]);
				i++;
			}
			return foundQ
		}
		else {return outer.includes(inner)}
	}
	else return false
}

function arrayReverse(a){
	var revArray=[];
	for(i=0;i<a.length; i++){
		revArray.unshift(a[i])
	}
	return revArray
}

function arrayToString(array,forMathematicaQ=false){
	var out="";
    var C,D; if(forMathematicaQ){C="{"; D="}";} else {C="[";D="]";}
	if (typeof array === "boolean"){
		if(forMathematicaQ){if(array){out+="True"}else{out+="False"}}
		else{if(array){out+="true"}else{out+="false"}}
	}
	else if(Array.isArray(array)){
    	out=C;
    	var cnt = 0;
		array.forEach(function(element){cnt++;out+=arrayToString(element,forMathematicaQ)+","})
		if(cnt>0){out = out.slice(0,-1);}
    	out+=D}
	else if(isNaN(array))
    	{out+=array.toString()}
    else if(Number.isInteger(array))
        {out+=array.toString()}
    else {out+=array.toFixed(prec)}
	return out
}

// for convenience; can convert to, say, Stampfli's Fast. methods

var pi = Math.PI ;
var tpi = 2*pi;
var hpi = pi/2;
var epsilon = 2*Number.EPSILON
var epsilon = 1e-14;
//var epsilon = 0;
var shortEpsilon = .00000001; 
function cos(a){return Math.cos(a)}
function sin(a){return Math.sin(a)}
function sec(a){return Math.sec(a)}
function csc(a){return Math.csc(a)}
function cot(a){return 1/(Math.tan(a))}
function cosh(a){return Math.cosh(a)}
function tanh(a){return Math.tanh(a)}
function acosh(a){return Math.acosh(a)}
function asin(a){return Math.asin(a)}
function atan(a){return Math.atan(a)}
function asinh(a){return Math.asinh(a)}
function sinh(a){return Math.sinh(a)}
function coth(a){return 1/(Math.tanh(a))}
function abs(a) {return Math.abs(a)}
function sqrt(a){return Math.sqrt(a)}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Complex Arithmetic
// complex numbers are [re,im]

function cPlus(c1,c2){
	return [c1[0]+c2[0],c1[1]+c2[1]]
}


function cArg(c){ 
	// returns 0 for [0,0]
	if(c[0]==0){ 
		if(c[1]==0) {return 0} 
		else if(c[1]<0){return -hpi} 
		else return hpi}
	else if (c[0]<0){
		if(c[1]>0){
			return atan(c[1]/c[0])+pi}
		else {return atan(c[1]/c[0])-pi} 
		}
	else {return atan(c[1]/c[0])}
}


function cAbs(cc){
    return Math.sqrt(cc[0]*cc[0]+cc[1]*cc[1])
}

function cMinus(c1,c2){
    return [c1[0]-c2[0],c1[1]-c2[1]]
}

function cInvert(cc){
	var ss = cc[0]*cc[0]+cc[1]*cc[1]
	return [cc[0]/ss,-cc[1]/ss]
}

function cTimes(c1,c2){
	return [c1[0]*c2[0]-c1[1]*c2[1],c1[0]*c2[1]+c1[1]*c2[0]]
}

function cDivide(c1,c2){
	return cTimes(c1, cInvert(c2))
}

function cConj(cc){
    var temp = [cc[0],-cc[1]];
	return temp
}

function cSqrt(cc){
    var a = cAbs(cc);
	var sign; if(cc[1]<0){sign = -1} else{sign = 1};
    var temp = [sqrt(a)*sqrt(.5*(1+cc[0]/a)),sign * sqrt(a)*sqrt(.5*(1-cc[0]/a))];
    return temp
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///  Poincare Disk Stuff


function poincareDistance(v,w){
    return 2* Math.atanh(cAbs(cDivide(cMinus(w,v),cMinus([1,0], cTimes(cConj(v),w)))))}

// a mobius transform preserving the unit disk is specified by mm = [mm[0],mm[1],opQ]
// where mm[0] and mm[1] are pairs of reals, representing complex numbers, and 
// opQ is boolean. The transform takes
// z-> (mm[0] Z + cConj(mm[1]))/(mm[1] Z + cConj(mm[0]))
// Z = z if opQ (orientation preserving), or cConj(z) otherwise

// puts a mobius transform in standard form, so that equivalence can be tested.
function normalize(mob){
	var ss = mob[0][0]*mob[0][0]+mob[0][1]*mob[0][1]-mob[1][0]*mob[1][0]-mob[1][1]*mob[1][1]
	ss = sqrt(ss);
	var sign = 1;
	if(mob[0][0]<0){sign = -1;}
	else if(mob[0][0]>0){sign = 1;}
	else{
		if(mob[0][1]<0){sign = -1;}
		else if(mob[0][1]>0){sign = 1;}
		else{
			if(mob[1][0]<0){sign = -1;}
			else if(mob[1][0]>0){sign = 1;}
			else{
				if(mob[1][1]<0){sign = -1;}
				else {sign = 1;}
			}
		}
	}
	return [[mob[0][0]*sign/ss,mob[0][1]*sign/ss],[mob[1][0]*sign/ss,mob[1][1]*sign/ss],mob[2]]
}

function mobEqual(mob1,mob2){ //presumes normalized
	return (mob1[2]==mob2[2])&&
	((abs(mob1[0][0]-mob2[0][0])<shortEpsilon) && (abs(mob1[0][1]-mob2[0][1])<shortEpsilon) &&
	(abs(mob1[1][0]-mob2[1][0])<shortEpsilon) && (abs(mob1[1][1]-mob2[1][1])<shortEpsilon))||
	((abs(mob1[0][0]+mob2[0][0])<shortEpsilon) && (abs(mob1[0][1]+mob2[0][1])<shortEpsilon) &&
	(abs(mob1[1][0]+mob2[1][0])<shortEpsilon) && (abs(mob1[1][1]+mob2[1][1])<shortEpsilon))
}

// Apply a mobius transform mm to a point cc
function applyMobius(cc,mm){
	var c;
	if(!mm[2]){
		c=cConj(cc);
	}
	else{c=cc;}
    var num = cPlus(cTimes(c,mm[0]),cConj(mm[1]));
    var den = cPlus(cTimes(c,mm[1]),cConj(mm[0]));
	return cDivide(num,den)
}


function compMob(m1,m2){ 
	//composePoincareMobius
	// m1 and m2 are [a,b], [c,d]; these are applied left to right
	// if m2 is orientation reversing, then m1 gets conjugated
	var m;
	if(!m2[2]){
		m = [cConj(m1[0]),cConj(m1[1])];
	}
	else{ m = m1;}
    return [cPlus(cTimes(m[0],m2[0]),cTimes(m[1],cConj(m2[1]))),
            cPlus(cTimes(m[0],m2[1]),cTimes(m[1],cConj(m2[0]))),
			(m2[2]&&m1[2])||!(m2[2]||m1[2])]
}


// compose a bunch of mobius transformations, 0th one applied first
function compMobList(mobList){
    var mob = [[1,0],[0,0],true];
    mobList.forEach(function(m){
        mob = compMob(mob,m)
    })
    return mob
}

// Miscellaneous transforms:

// returns a point
function poincareRotAbout0(cc,theta){
    complexMultiply(cc,[Math.cos(theta),Math.sin(theta)])
}

// returns a point
function poincareRotAboutW(cc,ww,theta){
    var out = applyMobius(cc,poincareRotAboutPtMob(ww,theta));
    return out
}

// returns a transform
function poincareRotAboutPtMob(ww,theta){
    var ep = [Math.cos(theta/2),Math.sin(theta/2)]
    var em = cConj(ep)
    var WW = cConj(ww)
    var out = [cMinus(ep,cTimes(cTimes(em,WW),ww)),cTimes(WW,cMinus(ep,em)),true];
    return out
}

// returns a point
// move cc by the transform taking vv towards ww by distance dd
function poincareTrans(cc,v,w,dd){
    return  applyMobius(cc,poincareTransByDMob(v,w,dd))
}

// from v towards w by distance dd
function poincareTransByDMob(v,w,dd){
    var W = cConj(w);
    var V = cConj(v);
    var t = [Math.tanh(dd/2),0];
   return [cPlus([-cAbs(cTimes(cMinus(w,v),cMinus(cTimes(v,W),[1,0]))),0],cTimes(t,cMinus(cTimes(w,V),cTimes(v,W)))),
      cTimes(t,cMinus(cPlus(V,cTimes(V, cTimes(w,W))),cPlus(W,cTimes(W,cTimes(v,V))))),true]
}



// move cc by the transform taking xy all the way to ab 
// HOWEVER, this doesn't have the right framing
// Needs to be reimplemented to be fully correct.
function poincareTransMob([x,y],[a,b]){
	var u = 1+x*a-y*b
	var v = y*a- x*b
	var w = a-x
	var z = y-b
	var s = sqrt(u*u+v*v+w*w+z*z)
 	return [[u/s,v/s],[w/s,z/s],true]
}


// move cc by the transform taking vv to 0
function poincareTransToO(cc,v){
    return applyMobius(cc,[[-1,0],cConj(v),true])
    
}

// starting at current, facing away from last, turn by angle and move distance, 
// returning the destination
function poincareTurtleMove(last,current,angle,distance){
   var temp = poincareRotAboutW(last,current,angle);
    return poincareTrans(
        temp,
        current,
        temp,
        distance-poincareDistance(last,current)
    )
}

function mobiusEdgeToEdge([v1,v2],[w1,w2],shift=0)//v1,v2,w1,w2 are points [x,y]
{	
    var mm = [[-1,0],cConj(v1),true];
    var vv = applyMobius(v2,mm);
	var cc = vv[0]/sqrt(vv[0]*vv[0]+vv[1]*vv[1]) 
 	var sign; if(vv[1]<0){ sign=-1}else{sign = 1} 
 	var rotMobV = [[sqrt(.5*(1+cc)), -sign * sqrt(.5*(1-cc))],[0,0],true];
 	var transX=[[1,0],[tanh(shift/2),0],true]
    var ww = applyMobius(w1,[[-1,0],cConj(w2),true]); 
	var cc = ww[0]/sqrt(ww[0]*ww[0]+ww[1]*ww[1])  
    var sign; if(ww[1]<0){ sign=-1}else{sign = 1} 
    var rotMobW = [[sqrt(.5*(1+cc)), sign * sqrt(.5*(1-cc))],[0,0],true];
 	//
 	return compMobList([[[-1,0],cConj(v1),true],
                       rotMobV,transX,rotMobW,[[1,0],cConj(w2),true]])
    // returns [a,b], representing a disk preserving mobius transform
}


////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
//
//	Centers of inversion
// 
// Express transforms as sequences of inversions
// 
// Here, all circles have the radius given, and so could be any circle;
// all the functions return the radius^2 = rsqd(center), which will give
// the radius of the circle perp to the unit circle.
// However, lines are only given through 0,0, with radius NaN -- there is 
// no provision here for using lines that are not perp to the unit circle.


function rsqd(c){ // we don't actually care what the value is...
	return 1// (c[0]*c[0]+c[1]*c[1]-1)
}


// returns the center of the circle to invert through to swap pt1 and pt2
// and preserving the unit circle, and the geodesic between pt1 and pt2
// We use short epsilon because we can be sure that points really are far apart if they are distinct


function inversionSwapping(pt1,pt2){
    var a = pt1[0], A=pt1[1],b=pt2[0],B=pt2[1];
    var AA=a*a+A*A, BB = b*b+B*B, DD = AA-BB;
	if (abs(a-b)<shortEpsilon && abs(A-B)<shortEpsilon)
	{
		// these are the same point; any inversion preserving the point will do. Let's 
		// take the simplest: 
		return[[-A,a],NaN]
	}
	else if(abs(DD)<epsilon){
		// the points have the same magnitude, and we reflect across a line through the origin
		// note that the closer in magnitude the points are, the greater the radius of the circle
		// inverting them. 
		return [[a-b,A-B],NaN]
	}
	else{
    	var center = [(b*(AA-1)-a*(BB-1))/DD, (B*(AA-1)-A*(BB-1))/DD];
    	return [center, rsqd(center)]}
   
}


// the center of the circle through pt1 and pt2 that is also perp to the unit circle.
function centerOfGeodesicThrough(pt1,pt2){
	var a = pt1[0], A=pt1[1],b=pt2[0],B=pt2[1];
	if(a==b && A==B){
		// we have a problem if pt1 = pt2
		return[[0,0],NaN];
	}
	else if(a==0 && A == 0){ // [a,A] is the origin. 
		// BUG ALERT: there is no checking for which side of this line is correct. 
		// We are just taking the counterclockwise from B direction.
		// This does not matter if we are simply inverting, but this might matter if we 
		// are checking for which side of the line we are on.
		var BB = sqrt(B*B+b*b);
		return [[-B/BB,b/BB],NaN]
	}
	else if(b==0 && B == 0){ // [b,B] is the origin. 
		// BUG ALERT: there is no checking for which side of this line is correct. 
		// We are just taking the clockwise from A direction.
		var AA = sqrt(A*A+a*a);
		return [[A/AA,-a/AA],NaN]
	}
	else{
		var AA=1+a*a+A*A, BB = 1+b*b+B*B,DD=2*(-A*b+a*B);
		if(abs(DD)<epsilon)
		// If DD is very small, we will have a very large circle
		// and will use a line instead.
		// We could go ahead and compute the radius exactly to make this test, 
		// but since we're just guessing anyway, this should be a good stand-in
		{ // As above, this might not be the correct direction.
			AA=sqrt(AA-1)
			return[[A/AA,-a/AA],NaN]
		}
		else{
			var center = [(AA*B-A*BB)/DD,(-AA*b+a*BB)/DD];
			return [center, rsqd(center)]
		}
	}
}

function reflectAcross(p1,p2){
	return centerOfGeodesicThrough(p1,p2)
}


function centersOfRotation(aboutpt,ang){
	var a = aboutpt[0], A = aboutpt[1];
	if(a==0 && A ==0){
		return [ [[cos(ang/2),sin(ang/2)],NaN],[[cos(ang/2),sin(-ang/2)],NaN]]
	}
	else{
		var angle= ang/4;
		var ss = (a*a+A*A)
		var dd =1+ss*ss-2*ss*cos(angle);
		var s = (-1+ss)*sin(angle);
		var c = (1+ss)*(1-cos(angle));
		var p1 = [(a*c-A*s)/dd,(a*s+A*c)/dd];
		var p2 = [(a*c+A*s)/dd,(-a*s+A*c)/dd];
		var c1 = centerOfGeodesicThrough(aboutpt,p1);// includes radius
		var c2 = centerOfGeodesicThrough(aboutpt,p2);
		return [c1,c2]
	}
}

	// takes p1 to q1 and p2 to q2; 
	// assumes distances p1 to p2 and q1 to q2 are equal
	// NOTE: this is not correct if p1=q1
	
function centersOfMovingEdge1ToEdge2([p1,p2],[q1,q2]){
	var c1,c2;
	
	// we take a moment to see if reflecting across a line will do the job:
	
	
	var n0=p1[0]-q1[0], n1=p1[1]-q1[1];
	var nn = (n0*p2[0] + n1*p2[1])/(n0*n0+n1*n1);
	if( (abs(p2[0] - 2*n0*nn - q2[0])<shortEpsilon)&& 
		(abs(p2[1] - 2*n1*nn - q2[1])<shortEpsilon)){
		c1 = [[n0,n1],NaN];
		c2=reflectAcross(q1,q2);
	}
	else{
		c1 = inversionSwapping(p1,q1);
		var q3 = applyMobius(p2,poincareInversion(c1));
		if(abs(q2[0]-q3[0])<shortEpsilon && abs(q2[1]-q3[1])<shortEpsilon){
			c2=reflectAcross(q1,q2)
		}
		else{c2 = inversionSwapping(q2,q3)}
	}
//	console.log(arrayToString([[p1,p2],[q1,q2],c1,q3,c2],true))
	return [c1,c2]
}
	

// returns the or. reversing mob transform  inverting through the circle with 
// the given center c, perp to the unit circle
// if radius is NaN, this assumes that c has unit magnitude

function poincareInversion([c,r]){
	if(isNaN(r)){
	return [[-c[1],c[0]],[0,0],false]
	}
	else{
		return [[-c[1],c[0]],[0,1],false]
	}
}

function poincareMobFromInversionList(cList){
	var m = [[1,0],[0,0],true];
	cList.forEach(function(c){
		m=compMob(m,poincareInversion(c))
	})
	return m
}

function convertToSplane([c,rsq]){ //rsq will be either 1 or NaN
	if(isNaN(rsq)){return iPlane([c[0],c[1],0.,0.])}
	else{ return iSphere([c[0],c[1],0.,-sqrt(c[0]*c[0]+c[1]*c[1]-1)])}
}


