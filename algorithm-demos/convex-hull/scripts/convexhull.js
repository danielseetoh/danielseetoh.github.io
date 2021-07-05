document.addEventListener("DOMContentLoaded", function(event){
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	//Dot prototype
	function Dot(x, y){
		this.x = x;
		this.y = y;
	}

	var width = canvas.width;
	var height = canvas.height;

	var numDots = 10;

	//initialize dots array with 30 dots
	var dots = [];
	for(var i = 0; i < numDots; i++){
		dotWidth = Math.floor(Math.random()*width);	
		dotHeight = Math.floor(Math.random()*height);
		dots.push(new Dot(dotWidth, dotHeight));
	}

	//set anchor to dot with lowest y-coordinate
	var maxY;
	var anchorDot;

	//referenceDot is the current dot we are trying to extend the line from
	var referenceDot;

	//array to store all lines
	var lines;

	//done drawing
	var doneDrawing;

	//listeners
	document.addEventListener('click', clickHandler, false);


	function draw(){
		init();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawDots();
		while(!doneDrawing){
			updateLines();
		}
		drawLines();
	}

	function init(){
		maxY = 0;
		anchorDot = new Dot(0,0);
		getAnchorDot();
		referenceDot = anchorDot;
		lines = [];
		lines.push([anchorDot.x, anchorDot.y]);
		doneDrawing = false;
	}

	function drawDots(){
		ctx.fillStyle = "black";
		ctx.beginPath();
		for (var i = 0; i < dots.length; i++){
			ctx.fillRect(dots[i].x, dots[i].y, 1, 1);
		}
		ctx.closePath();
	}

	function updateLines(){
		var nextDot = dots[0];
		for (var i = 0; i < dots.length; i++){
			vectorCrossProduct = (nextDot.x-referenceDot.x)*(dots[i].y-referenceDot.y)-(nextDot.y-referenceDot.y)*(dots[i].x-referenceDot.x);
			if (vectorCrossProduct < 0){
				nextDot = dots[i];
			} else if (vectorCrossProduct === 0){
				nextDotDistanceSquared = Math.pow((nextDot.x - referenceDot.x), 2) + Math.pow((nextDot.y - referenceDot.y), 2);
				newDotDistanceSquared = Math.pow((dots[i].x - referenceDot.x), 2) + Math.pow((dots[i].y - referenceDot.y), 2);
				if (newDotDistanceSquared >= nextDotDistanceSquared){
					nextDot = dots[i];
				}
			}
		}
		referenceDot = nextDot;
		if (nextDot.x == anchorDot.x && nextDot.y == anchorDot.y){
			doneDrawing = true;
		}

		lines.push([nextDot.x, nextDot.y]);

	}

	function drawLines(){
		ctx.beginPath();
		ctx.strokeStyle="blue";
		ctx.moveTo(lines[0][0], lines[0][1]);
		for (var i = 1; i < lines.length; i++){	
			ctx.lineTo(lines[i][0], lines[i][1]);
		}
		
		ctx.stroke();
		ctx.closePath();
	}

	function getAnchorDot(){
		for (var i = 0; i < dots.length; i++){
			if (dots[i].y>maxY){
				maxY = dots[i].y;
				anchorDot = dots[i];
			}
		}
	}

	function clickHandler(e){
		var rect = canvas.getBoundingClientRect();
		var dotx = (e.clientX-rect.left)/(rect.right-rect.left)*canvas.width;
		var doty = (e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height;
		dots.push(new Dot(dotx, doty));
		console.log(e.clientX, rect.left, rect.right, canvas.width);
		init();
		draw();
	}

	draw();
});