
var Location = function (row, col) {
    
    // just in case row is float number
    this.row = Math.floor(row);
    // just in case col is float number
    this.col = Math.floor(col);    
    return this;
}

// direction of a cell
Location.direction = {
    EAST: 0,
    NORTH: 270,
    WEST: 180,
    SOUTH: 90,
    LEFT: 90,
    RIGHT: -90
};

// generate location within bound
Location.generateLocation = function (maxRow, maxCol) {
	var row = Math.floor(Math.random() * maxRow) + 1;
	var col = Math.floor(Math.random() * maxCol) + 1;

	return new Location(row, col);
}

// Return an adjacent location of the current location by specific direction
Location.prototype.getAdjacentLocation = function (direction) {
    return new Location(this.row + Math.sin(degToRad(direction)), this.col + Math.cos(degToRad(direction)));
};


// Check whether 2 locations are equal
Location.prototype.equals = function (newLocation) {
    var flag = this.row === newLocation.row && this.col === newLocation.col;
    return flag;
}

var Board = function(totalRows, totalCols) {
	// total rows of snake board
	this.totalRows = totalRows;

	// total cols of snake board
	this.totalCols = totalCols;

	// flag map
	this.map = new Array(this.totalRows + 2);

	for (var i = 0; i <= this.totalRows + 1; i++) {
		this.map[i] = new Array(this.totalCols + 2);
		for (var j = 0; j <= this.totalCols + 1; j++) {
			this.map[i][j] = 0;
		}
	}

	// set snake
	this.snake = null;

	// prey
	this.preyLocation = null;

	// for quick draw
	this.modifiedLocations = [];
}

// Remap after snake moves or grows
Board.prototype.remap = function () {
	var that = this;
	for (var i = 0; i < that.snake.body.length; i++) {
		var currentCell = that.snake.body[i];
		that.map[currentCell.location.row][currentCell.location.col] = 1;
	}
	return ;
}

// check whether a location is valid (in bound) 
Board.prototype.isValidLocation = function (location) {
	var that = this;
	var row = location.row;
	var col = location.col;
	var flag = row > 0 && col > 0 && row <= that.totalRows && col <= that.totalCols;
	if (!flag)
		console.log("Not valid location");
	return flag;
}

// generate "prey" on the board
Board.prototype.generatePrey = function() {
	var that = this;
	var preyLoc = null;
	var flag = false;
	do {
		preyLoc = Location.generateLocation(that.totalRows, that.totalCols);
		flag = that.snake.isNotSelfBitten(preyLoc);
	} while (flag == false);
	this.preyLocation = preyLoc;

	that.modifiedLocations.push(preyLoc);
	return preyLoc;
}

// get center location of the board
Board.prototype.getCenterLocation = function () {
	var that = this;
	// Location constructor will fix the decimal points
	return new Location(that.totalRows / 2, that.totalCols/2);
}

// Add snake
Board.prototype.addSnake = function (snake) {
	var that = this;
	that.snake = snake;

	that.remap();
}

// set value on the board
Board.prototype.setValue = function (location, value) {
	var that = this;
	that.map[location.row][location.col] = value;
}

// Print out the board's map (testing purpose)
// Print map
Board.prototype.printMap = function () {
	var that = this;
    for (var i = 0; i <= that.totalRows + 1; i++) {
        console.log(this.map[i]);
    }
}

// snake
// head of the snake is always the first cell of the snake
var Snake = function () {
	// cells of the snake
	this.body = [];

	// next location that the head will move
	this.nextLocation = null;

	// next direction
	this.nextDirection = null;

	// board
	this.board = null;

	// modified cells
	this.modifiedLocations = [];
}

// init
Snake.prototype.init = function(location) {
	var that = this;
	/* snake will have 5 "cells" when the game starts
	and has horizontal position from left to right*/

	// Since the first cell is the head, we need to add cells from right to left
	var i = location.row;
	for (var j = location.col + 2; j >= location.col - 2; j--) {
		// i,j will be used as row,col for consistency
		that.body.push(new Cell(new Location(i, j), Location.direction.EAST));
	}
	return ;
}

// return the cell locates at the head of the snake
Snake.prototype.getHead = function () {
	var that = this;
	return that.body[0];
}

// set snake direction
Snake.prototype.setDirection = function (direction) {
	var that = this;
	var currentDirection = that.getHead().direction;

	// you can only turn 90 degree
	if (Math.abs(currentDirection - direction) != 180)
		that.getHead().direction = direction;
	return ;	
}

// direction the head is also the direction of the snake
Snake.prototype.getDirection = function () {
	var that = this;
	return that.getHead().direction;
}

// if next location is one of snake's cells location, it is going to bite itself
Snake.prototype.isNotSelfBitten = function (location) {
	var that = this;
	var flag = true;
	for (var i = 0; i < that.body.length; i++) {
		if (location.equals(that.body[i].location))
			flag = false;
	}
	if (!flag)
		console.log("Dude, you're biting yourself");
	return flag;
}

// check whether a snake can move
Snake.prototype.canMove = function (nextDirection) {
	var that = this;

	// if no direction is given, current direction will be selected
	var direction = typeof(nextDirection) === "undefined" ? that.getDirection() : nextDirection;

	// head location
	var head = that.getHead().location;

	// next location
	var nextLoc = head.getAdjacentLocation(direction);

	var flag = true;

	flag = that.board.isValidLocation(nextLoc) && that.isNotSelfBitten(nextLoc);

	if (flag) {
		that.nextLocation = nextLoc;
	}
	else {
		// reset next location
		console.log("Ready to gameover!");
		this.nextLocation = null;
	}

	return flag;
}

// move a snake
Snake.prototype.move = function() {
	var that = this;
	var flag = 1;
	var currentHeadLoc = that.getHead().location;

	that.board.modifiedLocations.push(currentHeadLoc);

	if (that.nextLocation != null) {
		that.board.modifiedLocations.push(that.nextLocation);

		var tail = that.body[that.body.length - 1];
		if (that.board.preyLocation.equals(that.nextLocation)) {
			that.board.preyLocation == null;
			flag = 2;
	 	}
	 	else {
	 		// no eating prey
		 	that.body.pop();
		 	that.board.setValue(tail.location, 0);
		 	that.board.modifiedLocations.push(tail.location);
		 	flag = 1;
	 	}
		that.body.splice(0,0, new Cell(that.nextLocation, that.getDirection()));

		that.board.setValue(that.nextLocation, 1);
	}
	else 
		console.log("Cannot move but somehow it got here?");
	return flag;
}

// A cell is a piece of a snake
var Cell = function (location, direction) {

	// location of a cell
	this.location = location;

	// direction
	this.direction = direction;
}

var SnakeGame = function() {
	this.board = new Board(20, 40);
	this.snake = new Snake();
	this.preyLocation = null;
	this.score = 0;
	this.speed = 100;
	// snake grows up
	this.snake.init(this.board.getCenterLocation());
	this.board.addSnake(this.snake);
	this.snake.board = this.board;
	//this.board.printMap();
	// reset score
    $("#score").text("0");
	this.draw();
}

SnakeGame.prototype.generatePrey = function (location) {
	var that = this;

	// only one prey can be placed on the map
	if (that.preyLocation == null) {
		var preyLocation = that.board.generatePrey(); 
		that.preyLocation = preyLocation;
		that.board.setValue(preyLocation, 2);
	}
	return ;
}

// optimized render method
SnakeGame.prototype.quickDraw = function () {
	var that = this;
	var board = that.board;
	var map = board.map;

	while (board.modifiedLocations.length > 0) {
		var loc = board.modifiedLocations.pop();
		var currentValue = map[loc.row][loc.col];
		var currentEl = $("#boxr" + loc.row + "c" + loc.col);
		
		// reset element
		currentEl.attr("class", "");

		if (currentValue == 0)
			currentEl.addClass("box");
		else if (currentValue == 1) // snake
			currentEl.addClass("box snake");	
		else if (currentValue == 2) // prey
			currentEl.addClass("box prey");
	}

	var headLoc = that.snake.getHead().location;
    $("#boxr"+headLoc.row + "c" + headLoc.col).toggleClass("snake").addClass("snakeHead");

	return ;
}

SnakeGame.prototype.draw = function () {
	var that = this;
	var board = that.board;
    var map = board.map;

    
    var gameBoard = $('#gameboard');

    // Clear everything
    gameBoard.html("");

    for (var i = 1; i <= board.totalRows + 1; i++) {
        for (var j = 1; j <= board.totalCols; j++) {
        	if (map[i][j] == 0)
            	$("<div></div>").attr("id", "box" + "r" + i + "c" + j).addClass("box").appendTo(gameboard);
           	else if (map[i][j] == 1) // snake
           		$("<div></div>").attr("id", "box" + "r" + i + "c" + j).addClass("box snake").appendTo(gameboard);
           	else if (map[i][j] == 2) // prey
           		$("<div></div>").attr("id", "box" + "r" + i + "c" + j).addClass("box prey").appendTo(gameboard);
        }
    }

    var headLoc = that.snake.getHead().location;
    $("#boxr"+headLoc.row + "c" + headLoc.col).toggleClass("snake").addClass("snakeHead");

    return ;
}

SnakeGame.prototype.increaseScore = function () {
	var that = this;
	that.score++;
	$("#score").text(that.score);
	if (that.score % 10 == 0)
		that.speed = Math.floor(that.speed / 2);
}


SnakeGame.prototype.over = function () {
	var that = this;
	var board = that.board;
    var map = board.map;

    console.log("Game over!");
    
    var gameboard = $('#gameboard');
    var menuboard = $('#gameover');
    gameboard.html(menuboard.contents());
    
}