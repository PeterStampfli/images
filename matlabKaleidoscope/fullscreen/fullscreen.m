function fullscreen(varargin)
%FULLSCREEN Display images in fullscreen mode
%   accepts filenames or an image data array (specification of a colormap
%   is possible) as input. Use the function in the following way:
%   fullscreen('filename','dateiname.png','screennumber',ScreenNumber);
%   fullscreen('cdata',ImageDataArray,'screennumber',ScreenNumber);
%   fullscreen('cdata',ImageDataArray,'map',ColorMap,'screennumber',ScreenNumber);
%   


p=inputParser;
p.addParamValue('screennumber',1,@(x)mod(x,1)==0&&x>0);
p.addParamValue('filename',[],@(x) exist(x,'file')~=0);
p.addParamValue('cdata',[],@(x) isnumeric(x));
p.addParamValue('map',[],@(x) isnumeric(x));
p.parse(varargin{:});

% nachsehen, ob es schon ein Vollbildfenster gibt
List=get(0,'Children');
FigureFull=findobj(List,'Name','Vollbild Fenster');
if isempty(FigureFull)
    FigureFull=figure('IntegerHandle','off',...
        'Name','Vollbild Fenster',...
        'NumberTitle','off',...
        'MenuBar','none',...
        'ToolBar','none',...
        'Units','pixels',...
        'Resize','off');
end

clf(FigureFull);
ScreenPos=get(0,'MonitorPositions');
ScreenWidth=ScreenPos(:,3)-ScreenPos(:,1)+1;
ScreenHeight=ScreenPos(:,4)-ScreenPos(:,2)+1;

if ~isempty(p.Results.filename)
    [Img,Map]=imread(p.Results.filename);
elseif ~isempty(p.Results.cdata)
    Img=p.Results.cdata;
    Map=p.Results.map;
else
    error('Keine Bild-Daten übergeben');
end

ImgSize=size(Img);

if ImgSize(1)~=ScreenHeight(p.Results.screennumber)||ImgSize(2)~=ScreenWidth(p.Results.screennumber)
    error('Auflösung des Bildes stimmt nicht mit der Auflösung des Bildschirms überein!');
end

set(FigureFull,'Position',[ScreenPos(p.Results.screennumber,1:2),ScreenWidth(p.Results.screennumber),ScreenHeight(p.Results.screennumber)]);

hAx=gca(FigureFull);
set(hAx,'Units','Normalized','Position',[0,0,1,1],'Visible','off');
hImg=image(Img,'Parent',hAx);

if ~isempty(Map)
    colormap(Map);
end


end
