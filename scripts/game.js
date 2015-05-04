var canvas;
var context;
var timer;

var KEY_LEFTARROW = 37;
var KEY_UPARROW = 38;
var KEY_RIGHTARROW = 39;
var KEY_DOWNARROW = 40;

var KEY_W = 87;
var KEY_A = 65;
var KEY_S = 83;
var KEY_D = 68;

var score = 0;

var center = Object();

var controller = Object();
controller.up = false;
controller.down = false;
controller.left = false;
controller.right = false;
controller.mouse = false;

offsetX = 8;
offsetY = 8;

var bullets = [];

var enemies = [];

var player = Object();
player.w = 20;
player.h = 20;
player.color = "#00FF00";
player.image = null;
player.isDead = false;
player.missileCD = 0;

var background = Object();
background.image = new Image();
background.image.src = "images/background_big.jpg";
background.audio = null;

// Tried to use with bullet, but refused to work properly
// Defines how to draw a circle
function fillCircle(x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, true);
    context.fill();
}

// Unused
// Defines how to draw a triangle
function fillTriangle( x1, y1, x2, y2, x3, y3 ) {
	context.beginPath();
	context.moveTo( x1, y1 );
	context.lineTo( x2, y2 );
	context.lineTo( x3, y3 );
	context.lineTo( x1, y1 );
	context.fill();
}

// Called on draw for player & bullets
// Defines how to draw a rectangle
function fillRect( x, y, width, height ) {
	context.fillRect( x, y, width, height );
}

function clearCanvas() {
	// Store the current transformation matrix
	context.save();

	// Use the identity matrix while clearing the canvas
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Restore the transform
	context.restore();
}

// Description for enemy object
// Called when enemies are created
function Enemy(passX, passY) {
	var obj = {};
	
	// X and Y fixed and passed on for testing purposes
	if(passX == 0 && passY == 0) {
		obj.x = Math.random()*canvas.width;
		obj.y = 10;
	}
	else if(passX == 0 && passY == 1) {
		obj.x = 10;
		obj.y = Math.random()*canvas.height;
	}
	else if(passX == 0 && passY == 2) {
		obj.x = Math.random()*canvas.width;
		obj.y = canvas.height - 10;
	}
	else if(passX == 0 && passY == 3) {
		obj.x = canvas.width - 10;
		obj.y = Math.random()*canvas.height;
	}
	else {
		obj.x = passX;
		obj.y = passY;
	}
	
	// Speed & direction of enemy movement
	obj.vx = Math.random()*5;
	obj.vy = Math.random()*5;
	
	// Sets direction of the enemy
	if(player.x > obj.x) {
		obj.vx = -obj.vx;
	}
	if(player.y > obj.y) {
		obj.vy = -obj.vy;
	}
	
	// Height & width, adjusting these is safe
	obj.w = 20;
	obj.h = 20;
	
	// Draw coordinates for the enemy
	obj.drawX = obj.x + obj.w/2;
	obj.drawY = obj.y + obj.h/2;
	
	// Boolean to track if the enemy is alive
	obj.death = false;
	
	// Animation trackers
	obj.blueRect = 20;
	obj.yellowRect = 10;
	
	// Updates properties of the enemy
	// Defines update for enemy objects
	obj.update = function() {
		// Tracks if the enemy was hit by a bullet in the past update
		// Called in update function
		for( var i = 0; i < bullets.length; i++ ) {
			if(bullets[i].onScreen == true) {
				if(bullets[i].x > obj.drawX && bullets[i].x < (obj.drawX+obj.w) && bullets[i].y > obj.drawY && bullets[i].y < (obj.drawY+obj.h) && obj.death == false) {
					obj.death = true;
					bullets[i].onScreen = false;
					score += 100;
				}
				// Tracks if bullet passes over but does not update within dimensions of enemy
				// Takes midpoints between past two bullet movement updates and tests against enemy position & dimensions
				else if(bullets[i].midpointX1 > obj.drawX && bullets[i].midpointX1 < (obj.drawX+obj.w) && bullets[i].midpointY1 > obj.drawY && bullets[i].midpointY1 < (obj.drawY+obj.h) && obj.death == false) {
					obj.death = true;
					bullets[i].onScreen = false;
					score += 100;
				}
				else if(bullets[i].midpointX2 > obj.drawX && bullets[i].midpointX2 < (obj.drawX+obj.w) && bullets[i].midpointY2 > obj.drawY && bullets[i].midpointY2 < (obj.drawY+obj.h) && obj.death == false) {
					obj.death = true;
					bullets[i].onScreen = false;
					score += 100;
				}
				else if(bullets[i].midpointX3 > obj.drawX && bullets[i].midpointX3 < (obj.drawX+obj.w) && bullets[i].midpointY3 > obj.drawY && bullets[i].midpointY3 < (obj.drawY+obj.h) && obj.death == false) {
					obj.death = true;
					bullets[i].onScreen = false;
					score += 100;
				}
			}
		}
		/*// Delete the enemy object
		if(obj.death == true) {
			enemies.pop(obj);
		}*/
		obj.x += obj.vx;
		obj.y += obj.vy;
		
		obj.drawX = obj.x - obj.w/2;
		obj.drawY = obj.y - obj.h/2;
		
		// Detect enemy hitting the player
		// Top left corner of enemy detection
		if(obj.drawX < player.drawX+player.w && obj.drawX > player.drawX && obj.drawY < player.drawY+player.h && obj.drawY > player.drawY && player.isDead == false) {
			player.isDead = true;
		}
		// Top right corner of enemy
		else if(obj.drawX+obj.w < player.drawX+player.w && obj.drawX+obj.w > player.drawX && obj.drawY < player.drawY+player.h && obj.drawY > player.drawY && player.isDead == false) {
			player.isDead = true;
		}
		// Bottom Left corner of enemy
		else if(obj.drawX < player.drawX+player.w && obj.drawX > player.drawX && obj.drawY+obj.h < player.drawY+player.h && obj.drawY+obj.h > player.drawY && player.isDead == false) {
			player.isDead = true;
		}
		// Bottom right corner of enemy
		else if(obj.drawX+obj.w < player.drawX+player.w && obj.drawX+obj.w > player.drawX && obj.drawY+obj.h < player.drawY+player.h && obj.drawY+obj.h > player.drawY && player.isDead == false) {
			player.isDead = true;
		}
	};
	// Draws the enemy
	// Called in draw function
	obj.draw = function() {
		context.fillStyle = "white";
		context.fillRect(obj.drawX, obj.drawY, obj.w, obj.h);
		if(obj.blueRect > obj.yellowRect) {
			context.fillStyle = 'yellow';
			context.fillRect(obj.drawX,obj.drawY,obj.w,obj.h);
			context.fillStyle = "blue";
			context.fillRect(obj.drawX+(20-obj.blueRect)/2,obj.drawY+(20-obj.blueRect)/2,obj.blueRect,obj.blueRect);
			context.fillStyle = "yellow";
			context.fillRect(obj.drawX+(20-obj.yellowRect)/2,obj.drawY+(20-obj.yellowRect)/2,obj.yellowRect,obj.yellowRect);
		}
		else {
			context.fillStyle = 'blue';
			context.fillRect(obj.drawX,obj.drawY,obj.w,obj.h);
			context.fillStyle = "yellow";
			context.fillRect(obj.drawX+(20-obj.yellowRect)/2,obj.drawY+(20-obj.yellowRect)/2,obj.yellowRect,obj.yellowRect);
			context.fillStyle = "blue";
			context.fillRect(obj.drawX+(20-obj.blueRect)/2,obj.drawY+(20-obj.blueRect)/2,obj.blueRect,obj.blueRect);
		}
		if(obj.blueRect < 20) {
			obj.blueRect += 2;
		}
		else {
			obj.blueRect = 0;
		}
		if(obj.yellowRect < 20) {
			obj.yellowRect +=2;
		}
		else {
			obj.yellowRect = 0;
		}
		
		
	};
	
	// Controls borders for enemies
	// Called in update
	obj.border_patrol = function() {
		if( obj.x > (canvas.width-obj.w/2) && obj.vx > 0) {
			obj.x = obj.w/2;
		}
		else if( obj.x < obj.w/2 && obj.x < 0) {
			obj.x = canvas.width-obj.w/2;
		}
		if( obj.y > (canvas.height-obj.h/2) && obj.vy > 0) {
			obj.y = obj.h/2;
		}
		else if(obj.y < obj.h/2 && obj.vy < 0){
			obj.y = canvas.height-obj.h/2;
		}
		
	};
	return obj;
}


// Definition of bullet object
// Called when bullet object is created
// Finds direction & determines speed
// Defines draw & update for bullets
function Bullet(event) {
	
	//Creates a bullet at player position
	var obj = {};
	obj.x = player.x;
	obj.y = player.y;
	obj.sizeX = 2;
	obj.sizeY = 2;
	obj.speed = 30;
	
	obj.onScreen = true;
	
	// Helps in detecting if bullets pass over enemies
	obj.midpointX1 = 0;
	obj.midpointX2 = 0;
	obj.midpointX3 = 0;
	
	obj.midpointY1 = 0;
	obj.midpointY2 = 0;
	obj.midpointY3 = 0;
	
	// Finds location of the click relative to player
	clickX = event.pageX - offsetX - player.x;
	clickY = event.pageY - offsetY - player.y;
	
	// Determines directional vector of the bullet a^2 + b^2 = c^2
	speedRatio = Math.sqrt((clickX*clickX) + (clickY*clickY));
	
	// Scaling directional vector to speed of 40
	obj.vx = clickX*obj.speed/speedRatio;
	obj.vy = clickY*obj.speed/speedRatio;
	
	// Defines update function for user-defined object
	obj.update = function() {
		obj.midpointX1 = obj.x + (obj.vx/4);
		obj.midpointX2 = obj.x + (obj.vx/2);
		obj.midpointX3 = obj.x + 3*(obj.vx/4);
		obj.midpointY1 = obj.y + (obj.vy/4);
		obj.midpointY2 = obj.y + (obj.vy/2);
		obj.midpointY3 = obj.y + 3*(obj.vy/4);
		obj.x += obj.vx;
		obj.y += obj.vy;
	};
	
	// Defines draw function for user-defined object
	obj.draw = function() {
		context.fillStyle = "yellow";
		context.beginPath();
		context.arc(obj.x, obj.y, 2, 0, 2*Math.PI, true);
		context.fill();
	};
	
	// Sets boolean to signal for deletion
	obj.border_patrol = function() {
		if(obj.x > canvas.width || obj.x < 0 || obj.y < 0 || obj.y > canvas.height) {
			obj.onScreen = false;
		}
	};
	return obj;
}

// Runs whenever the mouse is clicked
// Tracks event & passes it to bullet constructor
// Creates a new bullet
function handleMouseDown(event) {
	if(player.isDead == false) {
		bullets.push(new Bullet(event));
	}
}

// Called when a key is pressed
// Changes controller button states to true
function handleKeyDown(event) {
	if(KEY_LEFTARROW == event.keyCode || KEY_A == event.keyCode) {
		controller.left = true;
	}
	if(KEY_RIGHTARROW == event.keyCode || KEY_D == event.keyCode) {
		controller.right = true;
	}
	if(KEY_UPARROW == event.keyCode || KEY_W == event.keyCode) {
		controller.up = true;
	}
	if(KEY_DOWNARROW == event.keyCode || KEY_S == event.keyCode) {
		controller.down = true;
	}

}

// Called when a key is released
// Changes controller button states to false
function handleKeyUp(event) {
	if(KEY_LEFTARROW == event.keyCode || KEY_A == event.keyCode ) {
		controller.left = false;
	}
	if(KEY_RIGHTARROW == event.keyCode || KEY_D == event.keyCode) {
		controller.right = false;
	}
	if(KEY_UPARROW == event.keyCode || KEY_W == event.keyCode) {
		controller.up = false;
	}
	if(KEY_DOWNARROW == event.keyCode || KEY_S == event.keyCode) {
		controller.down = false;
	}
}

// Called at each interval
// Draws Background, player & bullets
function draw() {
	// Clear the screen.
	clearCanvas();
	
	// Draw the background
	/*context.fillStyle = background.color;
	context.fillRect(0,0,canvas.width,canvas.height);*/
	context.drawImage( background.image, 0, 0, 1440, 900 );
	
	// Draw each bullet in array
	for(var i = 0; i < bullets.length; i++) {
		bullets[i].draw();
	}
	
	// Draw each enemy in the array
	for(var i = 0; i < enemies.length; i++) {
		enemies[i].draw();
	}
		// Draw my player
	if(player.isDead == false) {
		context.fillStyle = 'red';
		context.fillRect(player.drawX,player.drawY,player.w,player.h);
		context.fillStyle = player.color;
		context.fillRect(player.drawX+1, player.drawY+1, player.w-2, player.h-2);
		context.fillStyle = 'red';
		if(player.missileCD < 20) {
			player.missileCD += 1;
			context.fillRect(player.drawX, player.drawY, player.w,player.missileCD);
		}
		else {
			player.missileCD = 0;
		}
		context.font = '30pt Calibri';
		context.textAlign = 'left';
		context.fillStyle = 'red';
		context.fillText(score, 1340, 30);
	}
	else if(player.isDead == true) {
		context.font = '30pt Calibri';
		context.textAlign = 'center';
		context.fillStyle = 'red';
		context.fillText('Your score was: '+score.toString(), 720,450);
	}
}

// Called at each interval
// Moves location of player based on keys pressed
// Updates location of bullets as they move
// Calls border function
// Update player draw coordinates
function update() {
	// Updates player moving up
	if(controller.up == true && player.up_lock == false) {
		// Safety for both up & down keys pressed at the same time
		if(controller.down == true) {
			player.y += 0;
		}
		else {player.y -= 7;}
	}
	// Updates player moving down
	else if(controller.down == true && player.down_lock == false) {
		player.y += 7;
	}
	
	// Updates player moving left
	if(controller.left == true && player.left_lock == false) {
		// Safety for both left & right keys pressed at the same time
		if(controller.right == true) {
			player.x += 0;
		}
		else {player.x -= 7;}
	}
	// Updates player moving right
	else if(controller.right == true && player.right_lock == false) {
		player.x += 7;
	}
	
	// Calls the bullet update for each in the array
	for(var i = 0; i < bullets.length; i++) {
		bullets[i].update();
		bullets[i].border_patrol();
		if(bullets[i].onScreen == false) {
			bullets.splice(i,1);
		}
	}
	
	// Calls the enemy update for each in the array
	for(var i = 0; i < enemies.length; i++) {	
		enemies[i].update();
		if(enemies[i].death == true) {
			enemies.splice(i,1, new Enemy(enemies[i].x,enemies[i].y), new Enemy(enemies[i].x,enemies[i].y));
		}
	}
	
	// Calls border function for enemies
	for(var i = 0; i < enemies.length; i++) {
		enemies[i].border_patrol();
	}
	
	// Calls the border function to prevent player from leaving canvas
	border_patrol();
	
	// Updates location for player drawing
	player.drawX = player.x - 10;
	player.drawY = player.y - 10;
}


// Keeps player on the canvas
// Called in the update function
function border_patrol() {
	// Protects left side
	if(player.x <= 10) {
		player.x = 10;
		player.left_lock = true; 
	}
	else {player.left_lock = false;}
	
	// Protects right side
	if(player.x >= canvas.width-10) {
		player.x = canvas.width-10;
		player.right_lock;
	}
	else {player.right_lock = false;}
	
	// Protects top
	if(player.y <= 10) {
		player.y = 10;
		player.up_lock = true;
	}
	else{player.up_lock = false;}
	
	// Protects bottom
	if(player.y >= canvas.height-10) {
		player.y = canvas.height-10;
		player.down_lock = true;
	}
	else{player.down_lock = false;}
}

// Runs on timer interval
// Updates positions & draws objects on refresh
function gameLoop() {
	update();
	draw();
}

// Runs as soon as the page is loaded
// Loads canvas
// Sets events
// Sets initial player location
// Sets refresh interval
function onLoad() {
	
	// Setting up the canvas
	canvas = document.getElementById("theCanvas");
	context = canvas.getContext("2d");
	/*context.fillStyle = background.color;
	context.fillRect(0,0,canvas.width, canvas.height);*/
	context.drawImage( background.image, 0, 0, 1440,900);
	context.font = '30pt Calibri';
	context.textAlign = 'left';
	context.fillStyle = 'red';
	context.fillText(score, 1340, 30);
	
	// Events to track key press & click
	window.addEventListener("keydown",handleKeyDown,false);
	window.addEventListener("keyup",handleKeyUp,false);
	window.addEventListener("click",handleMouseDown,false);
	
	// Finds the center of the canvas
	center.x = canvas.width / 2;
	center.y = canvas.height / 2;

	// Starts player in center of canvas
	player.x = center.x;
	player.y = center.y;
	
	// Compensation to make x & y coordinates of player in center of square
	player.drawX = player.x - 10;
	player.drawY = player.x - 10;

	background.audio = new Audio();
	background.audio.src = "audio/bg_audio.wav";
	background.audio.addEventListener('ended', function() {
    	this.currentTime = 0;
    	this.play();
	}, false);
	background.audio.load();
	
	background.audio.play();
	
	// Creates enemies
	for(var i = 0; i < 4; i++) {
		enemies.push(new Enemy(0,i));
	}
	
	// Timer to determine refresh rate
	timer = setInterval(gameLoop, 20);
	return timer;
}
