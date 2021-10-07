function [cx,cy] = polygonToCircle(n,x,y)
   r=sqrt(x*x+y*y);
   phi=atan2(y,x);
   phi=phi+pi/n;
   m=floor(0.5*phi/pi*n);
   phi=phi-m*2*pi/n-pi/n;
   x=r*cos(phi);
   y=r*sin(phi);
   r=x/cos(pi/n);
   phi=pi/n*(y/sin(pi/n)+2*m);
   cx=r*cos(phi);
   cy=r*sin(phi);
end

