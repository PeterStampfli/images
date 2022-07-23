%--------------------------------------------------------------------------
function [vm, x, y] = vm2NaNNorm2(vm, hw_crop)
    hi = hw_crop(1); wi = hw_crop(2);
    % SPLIT VECTORMAP %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    x = vm(:,:,1); y = vm(:,:,2);                                                               
    % NEGATIVE x-VALUES => SET x & y TO NaN %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    y(x<=0)     = NaN;                                                          
    x(isnan(y)) = NaN;  
    % NORMALIZE [0 1] -> [1 hw_crop(2)]x[1 hw_crop(1)] %%%%%%%%%%%%%%%%%%%%
    [x_min,x_max,y_min,y_max] = get_minmax(x,y);                            %[x_min,x_max,y_min,y_max] = get_minmax(x,y);  
    if x_min <= 0; x = x + abs(x_min); else; x = x - x_min; end 
    if y_min <= 0; y = y + abs(y_min); else; y = y - y_min; end  
    x = x/x_max; 
    y = y/y_max; 
    x = x * wi+1; 
    y = y * hi+1; 
    %[x_min,x_max,y_min,y_max] = get_minmax(xo2,yo2);           disp(['after multiplication norm to [0 hi or wi]: x_min = ', num2str(x_min), ', x_max = ', num2str(x_max), ', y_min = ', num2str(y_min), ', y_max = ', num2str(y_max)]);
    vm = cat(3,x,y);
end
%--------------------------------------------------------------------------
