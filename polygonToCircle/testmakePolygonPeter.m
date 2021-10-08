clc; clear; close all; 

% in meinen Polygonzeichnungen (für Tilings etc.) gehe ich von einer Seitenlänge tw eines (gleichseitigen) Dreiecks als Grundparameter aus,
% aus dem h,w des Polygon und alle Eckpunkte berechnet werden sollen.

n = 6;                                                                      disp(['n = ', num2str(n)]); % Polygon: nr of corners = nr of sides 
alpha = 360/n;                                                              disp(['alpha = ', num2str(alpha)]); % Polygon inner angle 
tw = 1000;                                                                  disp(['tw = ', num2str(tw)]); % Polygon side length
angle = 0;                                                                  % Winkel für Poygonrotation: pi/2 = 90; 


% n=6& angle=0: Hexagon mit Spitzen Rechts und Links; tw=1000 => hP = 1000, wP = 1155 => gleichseitige Dreieck: th = 500; tw = (2/sqrt(3))*th = 577.35

% Grundlage hier: gleichschenkliges Dreieck mit Schenkel = radius und 3te Seite = Polygonseitenlänge tw
% sind(alpha/2) = (tw/2)/radius <=> radius = tw/(2*sind(alpha/2));
% wenn diese radius-Formel verwendet wird, entsteht n-Polygon mit Seitenlänge von tw/2 ????

radius = floor(tw/(2*sind(360/n)));                                         disp(['radius = ', num2str(radius)]); % = th




[x,y] = makeRegPolygonCorners(n,radius,radius,radius,angle);                disp(['x = ',num2str(x)]); disp(['y = ',num2str(y)]); %disp(num2str(size(x))); 
plot(x,y); axis('equal');                                                   


%ANPASSUNG %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%[Px,Py,h,w] = makeRegPolygonCorners2(n,tw,angle); plot(Px,Py); axis('equal');




% line_a = 2.1; 
% [r,c] = draw_polygon(Px, Py, line_a);                                            disp(['r = ', num2str(r(1:30))]); disp(['c = ', num2str(c(1:30))]);
% nr_r = numel(r);                                                            disp(['nr_r = ', num2str(nr_r)]);
% s = zeros(h,w,1,'uint8');
% for p=1:nr_r;                                                               disp(['p = ', num2str(p), ': r(p) = ', num2str(r(p)), ', c(p) = ', num2str(c(p))]);
%     if r(p)>0 && c(p)>0; s(r(p), c(p)) = 255; end; 
% end;                                                                        imwrite(s, ['s_RegPoly_n', num2str(n), '_h', num2str(h), '_w', num2str(w) '.png']);









%--------------------------------------------------------------------------
function [cornersX,cornersY] = makeRegPolygonCorners(n,centerX,centerY,radius,angle)
    cornersX = 1:(n+1);
    cornersY = 1:(n+1);
    cornersX = cos(2*pi*cornersX/n+angle)*radius+centerX;
    cornersY = sin(2*pi*cornersY/n+angle)*radius+centerY;
end
%--------------------------------------------------------------------------

%--------------------------------------------------------------------------
function [Px,Py,h,w] = makeRegPolygonCorners2(n,tw,angle)
    radius = floor(tw/(2*sind(360/n)));
    centerX = radius; centerY = radius; 
    % FIRST POLGON COORDINATE SET %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    Px = 1:n+1; Py = Px; 
    Px = cos(2*pi*Px/n+angle)*radius+centerX;                               disp(['sub(makeRegPolygonCorners2): Px = ',num2str(Px)]);
    Py = sin(2*pi*Py/n+angle)*radius+centerY;                               disp(['sub(makeRegPolygonCorners2): Py = ',num2str(Py)]);
    % GET h,w OF IMAGE THAT SURROUNDS POLYGON %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    x_min = min(Px); y_min = min(Py);                                    	disp(['sub(makeRegPolygonCorners2): x_min = ',num2str(x_min), ', y_min = ',num2str(y_min)]);
    x_max = max(Px); y_max = max(Py);                                    	disp(['sub(makeRegPolygonCorners2): x_max = ',num2str(x_max), ', y_max = ',num2str(y_max)]);
    w = round(x_max-x_min+1);                                             	disp(['sub(makeRegPolygonCorners2): w = ',num2str(w)]);
    h = round(y_max-y_min+1);                                             	disp(['sub(makeRegPolygonCorners2): h = ',num2str(h)]);
    % SECOND POLGON COORDINATE SET: TRANSLATE TO COORDINATE SYSTEM ORIGIN %
    Px = round(Px-x_min+1);                                               	disp(['sub(makeRegPolygonCorners2): Px = ',num2str(Px)]);
    Py = round(Py-y_min+1);                                                	disp(['sub(makeRegPolygonCorners2): Py = ',num2str(Py)]);
end
%--------------------------------------------------------------------------


%--------------------------------------------------------------------------
function [r,c] = draw_polygon(Px, Py, a)
    nr_points = numel(Px); 
    Lx = cell(1,nr_points); Ly = Lx; 
    
    for k = 1:nr_points
        % Lkx, Lky: LINE BETWEEN Pk, Pk+1= Pk_1
        if k < nr_points
            Pk   = [Px(k) Py(k)]; 
            Pk_1 = [Px(k+1) Py(k+1)];
        elseif k == nr_points
            Pk   = [Px(k) Py(k)];
            Pk_1 = [Px(1) Py(1)];
        end        
        [Lxk, Lyk] = drawLine(Pk, Pk_1, a);
        Lx{k} = Lxk;
        Ly{k} = Lyk;        
    end 

    % ELIMINATE DOUBLES AT CORNERS ??????
    
   
    r = cell2mat(Lx); 
    c = cell2mat(Ly); 
end 
%--------------------------------------------------------------------------

%--------------------------------------------------------------------------
function [Px, Py] = drawLine(P1, P2, a)
    theta = atan2(P2(2) - P1(2), P2(1) - P1(1));                            disp(['sub(drawLine): theta = ', num2str(theta)]); 
    r     = sqrt( (P2(1) - P1(1))^2 + (P2(2) - P1(2))^2);                   disp(['sub(drawLine): r = ', num2str(r)]);
    
    line = 0:a:r;
    Px = P1(1) + line*cos(theta);
    Py = P1(2) + line*sin(theta);
end 
%--------------------------------------------------------------------------


% Hat dein Matlab das polyshape Objekt? Dann geht es so:
% 
% function poly = makePolygon(n,centerX,centerY,radius,angle)
% cornersX=[1:n];
% cornersY=[1:n];
% cornersX(:)=cos(2*pi*cornersX(:)/n+angle)*radius+centerX;
% cornersY(:)=sin(2*pi*cornersY(:)/n+angle)*radius+centerY;
% poly=polyshape(cornersX,cornersY);
% end
% 
% Radius ist der Abstand der Eckpunkte vom Zentrum (centerX,centerY). angle dreht das Polygon.
% Aufruf mit
% 
% >> plot(polygonCorners(7,1,-1,2,pi/2))
% >> axis('equal')
% 
% axis('equal')macht dass das Polygon nicht verzerrt wird.
% 
% Nur Ecken ohne polyshape, sonst gleich:
% 
% function [cornersX,cornersY] = makePolygon(n,centerX,centerY,radius,angle)
% cornersX=[1:(n+1)];
% cornersY=[1:(n+1)];
% cornersX(:)=cos(2*pi*cornersX(:)/n+angle)*radius+centerX;
% cornersY(:)=sin(2*pi*cornersY(:)/n+angle)*radius+centerY;
% end
% 
% mit
% 
% >> [x,y]=polygonCorners(7,1,-1,2,pi/2);
% >> plot(x,y)
% >> axis('equal')


