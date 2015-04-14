// Constants ======================================================================
var POINT_RADIUS  = 10;
var COULOURS      = {
  "WHITE"   : "#fffff1",
  "BLACK"   : "#000",
  "RED"     : [ "#ff1d4d", "#7e00ff", "#aa25fd" ],
  "YELLOW"  : [ "#f0ff00", "#ffa800", "#ff5a00" ],
  "GREEN"   : [ "#8aff00", "#016a0b", "#00ff54" ],
  "BLUE"    : [ "#00b4ff", "#0066ff", "#4200ff" ]
}

var STROKE_OPACITY = 0.7;
var STROKE_WIDTH  = {
  "MAIN"      : "2",
  "INVISIBLE" : "0"
}

var HEIGHT    = $(window).height();
var WIDTH     = $(window).width();

var background = new Raphael('background', '100%', '100%');
var foreground = new Raphael('foreground', '100%', '100%');
var mainColor = chooseMainColour();
var max = {
  "X" : 0,
  "Y" : 0
}
var starArray = [];
var constellation = [];

// Treat data ======================================================================
starData.data.forEach(function(star) {

  var x = star[10];
  var y = star[11];

  // The sun is too bright
  var appMag = star[16];

  if (appMag < -20)
    var radius = Math.pow(2.5, -star[16] / 15);
  else
    var radius = Math.pow(2.5, star[16] / 2);

  var starId = star[0];

  if ( Math.abs(x) > max.X )
    max.X = Math.abs(x);

  if ( Math.abs(y) > max.Y )
    max.Y = Math.abs(y);

  var newStar = {
    "X"   : x,
    "Y"   : y,
    "rad" : radius,
    "id"  : starId
  }

  starArray.push(newStar)
});

starArray.forEach(function(star){

  star.X = 10 * star.X * WIDTH / max.X + WIDTH / 2;
  star.Y = 15 * star.Y * HEIGHT / max.Y + HEIGHT / 2;
  drawStar(star, foreground);
});

// Events ======================================================================
$(window)

  .mousedown(function(e) {
    isMouseDown = true;
    $('#instructions').css('display', 'none');
  })

  .mouseup(function(e) {
    isMouseDown = false;

    if (constellation.length > 1) {

      $('#filter').css("display", "block");
      $('#filter').animate({
        opacity: 0.9
      }, 1000);

      $('.footer').css("display", "block");
      $('.footer').animate({
        opacity: 1,
        top: "-30vh"
      }, 1000);
      createDownloadLink();
    } else 
      $('#instructions').css('display', 'block');
  });

$('#splash').click(function() {

  $('#splash').animate({
    opacity: 0,
  }, 1000, function() {
    $('#splash').css('display', 'none');
  });
});

// Save SVG FILES ======================================================================
function svgStar (star, canvas) {
  var x = star.X;
  var y = star.Y;
  var radius = star.rad;

  var point = canvas
              .circle(x, y, radius)
              .attr({
                "fill" : COULOURS.BLACK, 
                "stroke-width" : STROKE_WIDTH.INVISIBLE
              });
}


function svgLine(prevStar, nextStar, canvas) {

  var x0 = prevStar.X;
  var y0 = prevStar.Y;
  var x1 = nextStar.X;
  var y1 = nextStar.Y;

  var pathString = "M" + x0 + "," + y0 + "L" + x1 + "," + y1;

  canvas
    .path(pathString)
    .attr({
      "stroke" : COULOURS.BLACK, 
      "stroke-width" : STROKE_WIDTH.MAIN
    });
}

function svgCurve(prevStar, nextStar, canvas) { //1-5

  var x0 = prevStar.X;
  var y0 = prevStar.Y;
  var x1 = nextStar.X;
  var y1 = nextStar.Y;

  var rand1 = Math.random();
  var rand2 = Math.random();

  var initPoint = "M" + x0 + "," + y0;
  var midPoint  = "T" + ( (x1 - x0) * rand1 + x0 ) + "," + ( (y1 - y0) * rand2 + y0 );
  var endPoint  = "T" + x1 + "," + y1;

  var strokeWidth = Math.random() * 5;
  var strokeColourIndex = Math.floor(Math.random() * 3) + 1 ;

  var pathString = initPoint + midPoint + endPoint;

  console.log(pathString);
  canvas
    .path(pathString)
    .attr({
      "stroke" : COULOURS.BLACK, 
      "stroke-width" : strokeWidth
    });
}

function svgSegment(prevStar, nextStar, canvas) {
  svgLine(prevStar, nextStar, canvas);
}

// Draw Functions ======================================================================
function chooseMainColour() {
  
  var colourArray = [ "RED", "YELLOW", "GREEN", "BLUE" ];
  var colourIndex = Math.floor(Math.random() * 4) ;
  return colourArray[colourIndex];
}

function drawSegment(prevStar, nextStar, rand, mainColor, canvas) {
  drawLine(prevStar, nextStar, mainColor, canvas);
  drawCurve(prevStar, nextStar, rand, mainColor, canvas);
  drawCurve(prevStar, nextStar, rand, mainColor, canvas);
  drawCurve(prevStar, nextStar, rand, mainColor, canvas); 
}

function genRandom() {

  var rand = {
    "X"   : Math.random(),
    "Y"   : Math.random(),
    "stroke"  : Math.random() * 5,
    "colour"  : Math.floor(Math.random() * 3) + 1
  }

  return rand;
}

function drawCurve(prevStar, nextStar, rand, mainColor, canvas) { //1-5

  var x0 = prevStar.X;
  var y0 = prevStar.Y;
  var x1 = nextStar.X;
  var y1 = nextStar.Y;

  var rand = genRandom();

  var initPoint = "M" + x0 + "," + y0;
  var midPoint  = "T" + ( (x1 - x0) * rand.X + x0 ) + "," + ( (y1 - y0) * rand.Y + y0 );
  var endPoint  = "T" + x1 + "," + y1;

  var strokeWidth = rand.stroke;
  var strokeColourIndex =rand.colour;

  var pathString = initPoint + midPoint + endPoint;
  canvas
    .path(pathString)
    .attr({
      "stroke" : COULOURS[mainColor][strokeColourIndex], 
      "stroke-width" : strokeWidth,
      "stroke-linecap" : "round",
      "stroke-opacity" : STROKE_OPACITY
    });
}

function drawLine(prevStar, nextStar, mainColor, canvas) {

  var x0 = prevStar.X;
  var y0 = prevStar.Y;
  var x1 = nextStar.X;
  var y1 = nextStar.Y;

  var pathString = "M" + x0 + "," + y0 + "L" + x1 + "," + y1;

  canvas
    .path(pathString)
    .attr({
      "stroke" : COULOURS[mainColor][0], 
      "stroke-width" : STROKE_WIDTH.MAIN,
      "stroke-linecap" : "round"
    });
}

var isMouseDown = false;

function drawStar (star, canvas) {

  var x = star.X;
  var y = star.Y;
  var radius = star.rad;
  var id = star.id;

  var point = canvas
              .circle(x, y, radius)
              .attr({
                "fill" : COULOURS.WHITE, 
                "stroke-width" : STROKE_WIDTH.INVISIBLE
              });

  point.node.setAttribute("class", "point");
  point.node.setAttribute("id", id);

  point
    .glow({ 
      "width" : 5, 
      "color" : COULOURS.WHITE 
    });

  point.mouseover(function() {
    var exists = $.grep(constellation, function(star){ return star.id == id; }).length > 0;

    if ( (!isMouseDown) || (exists) )
      return;

    point.glow({ 
      "width" : 30,
      "color" : COULOURS.WHITE 
    });

    var starNum = constellation.length;

    var rand = genRandom();

    if (starNum !== 0) {
      var prevStar = constellation[starNum - 1];
      drawSegment(prevStar, star, rand, mainColor, foreground);
      svgSegment(prevStar, star, background);
    }

    svgStar(star, background);
    drawStar(star, foreground);
    constellation.push(star);    
  });    
}

function createDownloadLink() {
  
  var svgString = background.toSVG();
  var bb = new Blob([svgString]); 

  var a = $("#download");
  a.attr('download', $('.user-text').val() + '.svg');
  a.attr('type', 'image/svg+xml');
  a.attr('href', (window.URL || webkitURL).createObjectURL(bb));
}