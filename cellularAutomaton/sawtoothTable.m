% sawtooth:  going from o to nstates-1, repeating this
function table = sawtoothTable(nStates,weights)
%make a transition table
%sawtooth shape
%depending on number of states and weights (vector of 6 or greater 1)
maxSum=nStates*(4*sum(weights)-3*weights(1));
table=[0:maxSum];
table=int32(mod(table,nStates));
end

