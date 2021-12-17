% wave:  of period length
function table = waveTable(nStates, weights, periods)
%make a transition table
%sawtooth shape
%depending on number of states and weights (vector of 6 or greater 1)
maxSum = nStates * (4 * sum(weights) - 3 * weights(1));
period=maxSum/periods/2/pi;
table = [0:maxSum];
table=floor((nStates-0.1)*0.5*(1-cos(table./period)));