var game_grid = [];  // 1 = cpu, -1 = player, 0 = empty
var player_mark_path; //Path of the image the player will use as mark
var cpu_mark_path; //Path of the image the cpu will use as mark
var block = 0; //0 unblocked, 1 blocked
var init = 0; //0 uninitialized, 1 initialized


function start(){   //This function is executed once "Start new game!" is pushed
	initialize(); 
	var first; //1 = cpu, -1 = player
	var mark; // 'x' or 'o'
	//Read settings input
	for (var i=0; i<document.forms[0].first.length; i++) 
		if (document.forms[0].first[i].checked)
			first = document.forms[0].first[i].value;
	for (var i=0; i<document.forms[0].mark.length; i++)
		if (document.forms[0].mark[i].checked)
			mark = document.forms[0].mark[i].value;
	if (mark == 'x')
	{
		player_mark_path = '<img src="./images/x.png" ></img>';
		cpu_mark_path = '<img src="./images/o.png" ></img>';
	}
	else
	{
		player_mark_path = '<img src="./images/o.png" ></img>';
		cpu_mark_path = '<img src="./images/x.png" ></img>';
	}
	if (first=='1') //If cpu plays first, begin with cpu_play()
		cpu_play();
}
			
		


function initialize(){

	for (var i=0; i<9; i++) //Resetting all board cells to empty
		game_grid[i]=0;

	init = 1;  //A game has begun (used later as control)

	block = 0; //The grid is unblocked (player can mark on it)

	document.getElementById('g0').innerHTML = '';  //Resetting all board cells of the UI to empty
	document.getElementById('g1').innerHTML = '';
	document.getElementById('g2').innerHTML = '';
	document.getElementById('g3').innerHTML = '';
	document.getElementById('g4').innerHTML = '';
	document.getElementById('g5').innerHTML = '';
	document.getElementById('g6').innerHTML = '';
	document.getElementById('g7').innerHTML = '';
	document.getElementById('g8').innerHTML = '';

	document.getElementById('messages').innerHTML = ''; //Removing any messages from the message div
}

function validate(input,grid){ //This functions checks if there is a winner at the given time, using the current grid an the last placed mark to save time,
	var player = grid[input]; //as only the last mark can create a line and declare a winner
	if (input+3>8) //Last mark is on last line
	{
		if ((grid[input-3]==player)&&(grid[input-6]==player)) //Check for vertical lines
			return player;
		else if (input==6)
		{
			if((grid[4]==player)&&(grid[2]==player)) //Diagonal
				return player;
		}
		else if (input==8)
		{
			if((grid[4]==player)&&(grid[0]==player)) //Diagonal
				return player;
		}
		if ((grid[6]==player)&&(grid[7]==player)&&(grid[8]==player)) //Horizontal
			return player;
	}
	else if (input-3<0) //Last mark is on first line
	{
		if ((grid[input+3]==player)&&(grid[input+6]==player)) //Vertical
			return player;
		else if (input==0)
		{
			if((grid[4]==player)&&(grid[8]==player)) //Diagonal
				return player;
		}
		else if (input==2)
		{
			if((grid[4]==player)&&(grid[6]==player)) //Diagonal
				return player;
		}
		if ((grid[0]==player)&&(grid[1]==player)&&(grid[2]==player)) //Horizontal
			return player;
	}
	else //Last mark is on middle line
	{
		if ((grid[input-3]==player)&&(grid[input+3]==player)) //Vertical
			return player;
		else if (input==4)
		{
			if((grid[0]==player)&&(grid[8]==player)) //Diagonal
				return player;
			else if((grid[2]==player)&&(grid[6]==player)) //Diagonal
				return player;
		}
		if ((grid[3]==player)&&(grid[4]==player)&&(grid[5]==player)) //Horizontal
			return player;
	}
	return 0; //undefined or draw
	//This function either returns the number of the winning player, if there is one (1 for cpu, -1 for player) or 0, which means the result is undefined
	//yet. This function does not check whether the game has reached a draw yet.
}

function cpu_play() //Decides where the cpu will play
{
	var operators = []; //Array containing the score for each empty board cell according to the minimax algorithm. Score is 1 for win, 0 for draw, -1 for loss
	var draw_flag = true; //User to check whether a draw has occurred
	var player = 1; //Variable determining who is now playing
	var operator; //best operator position
	var maximum = -1; //best operator value
	for (var i=0; i < game_grid.length; i++)
	{
		if (game_grid[i]==0) //Check if board cell is empty
		{
			operators[i] = operate(game_grid.slice(0),player,i); //The recursive function "operate" is called and creates the entire game tree of the minimax algorithm for playing on board cell i, returning the score of each condition from botton to top and finally assigning it to the operators array.
			draw_flag = false; //If an empty cell is found, a draw has not yet been reached, so flag is turned to false
			operator = i; 
		}
		else
			operators[i] = 9; //operator not applicable ->skip comparison
	}
	if (draw_flag) //In case of draw end game appropriately
	{//End game in draw and block the board
		end_draw();
		return;
	}
	for (var i=0; i < operators.length; i++) //Check for the best possible move by looping through the operators array and finding maximum
	{
		if (operators[i]>maximum && operators[i]!=9)
		{
			maximum = operators[i];
			operator = i;
		}
	}
	game_grid[operator]=1; //Mark the position on the game board
	mark_cpu(operator); //Mark the position on the UI game board
	var result = validate (operator,game_grid); //Validate new position and check for winner
	if (result) //In case of a win, end game appropriately
	{
		end_cpu();
		return;
	}
	draw_flag = true; //Check again for draw, in case the last mark was placed on the las empty cell
	for (var i=0; i<game_grid.length; i++)
	{
		if(game_grid[i]==0)
			draw_flag = false;
	}
	if (draw_flag) end_draw();
	
}

function operate(grid,player,point){ //This function applies the operators on the grid and creates the game tree
	grid[point]=player; //The mark of the player is placed on grid
	var draw_flag = true; //Check if game ends in a draw
	var result = validate(point,grid); //New situation is validated. In case of a result, it is immediately returned to the function that previously called it.

	if (!result) //If there is not a result yet, operate is called again for the next empty cell
	{
		var operators = [];
		var next_player; //Determines who will play next
		var best_case;  //best case value
		if (player==1)
			next_player=-1;
		else
			next_player=1;
		for (var i=0; i < grid.length; i++)
		{
			if (grid[i]==0) 
			{
				operators[i] = operate(grid.slice(0),next_player,i);
				draw_flag = false;
			}
			else
				operators[i] = 9;
		}
		if (draw_flag)
			return 0;
	
		if (player==1) //Find the best case according to which player is playing
		{
			best_case = 1;
			for (var i=0; i < operators.length; i++)
			{
				if (operators[i] < best_case && operators[i]!=9)
				{
					best_case = operators[i];
				}
			}
			return best_case;
		}
		else
		{
			best_case = -1;
			for (var i=0; i < operators.length; i++)
			{
				if (operators[i] > best_case && operators[i]!=9)
				{
					best_case = operators[i];
				}
			}
			return best_case;
		}
	}
	else //Return result in case there is one
	{
		return result;			
	}
	
}

function end_draw() //End game in draw and block the board
{
	document.getElementById('messages').innerHTML = '<span class="draw">The game ended in a draw</span>';
	block = 1;
}

function end_player() //End game in player win and block the board
{
	document.getElementById('messages').innerHTML = '<span class="win">You won against the CPU!</span>';
	block = 1;
}

function end_cpu() //End game in cpu win and block the board
{
	document.getElementById('messages').innerHTML = '<span class="loss">You lost to the CPU</span>';
	block = 1;
}

function mark_cpu(point) //Function that marks cpu input on the UI board
{
	if (point==0)
		document.getElementById('g0').innerHTML = cpu_mark_path;
	else if (point == 1)
		document.getElementById('g1').innerHTML = cpu_mark_path;
	else if (point == 2)
		document.getElementById('g2').innerHTML = cpu_mark_path;
	else if (point == 3)
		document.getElementById('g3').innerHTML = cpu_mark_path;
	else if (point == 4)
		document.getElementById('g4').innerHTML = cpu_mark_path;
	else if (point == 5)
		document.getElementById('g5').innerHTML = cpu_mark_path;
	else if (point == 6)
		document.getElementById('g6').innerHTML = cpu_mark_path;
	else if (point == 7)
		document.getElementById('g7').innerHTML = cpu_mark_path;
	else if (point == 8)
		document.getElementById('g8').innerHTML = cpu_mark_path;
}

function mark_player(id) //UI function that marks player input both on UI board and game board (the array)
{
	if (init) //Checks if a game has been started before applying the mark
	{
		if (!block) //Checks if the board is "blocked". The board becomes blocked once a game ends
		{
			document.getElementById('messages').innerHTML = ''; //Remove messages from message div
			if (document.getElementById(id).innerHTML=='') //Check if the cell is already captured by someone
			{
				var point;
				document.getElementById(id).innerHTML = player_mark_path; //Mark UI board
				if (id=='g0')
					{game_grid[0]=-1; point=0;} //Mark game board
				else if (id=='g1')
					{game_grid[1]=-1; point=1;}
				else if (id=='g2')
					{game_grid[2]=-1; point=2;}
				else if (id=='g3')
					{game_grid[3]=-1; point=3;}
				else if (id=='g4')
					{game_grid[4]=-1; point=4;}
				else if (id=='g5')
					{game_grid[5]=-1; point=5;}
				else if (id=='g6')
					{game_grid[6]=-1; point=6;}
				else if (id=='g7')
					{game_grid[7]=-1; point=7;}
				else if (id=='g8')
					{game_grid[8]=-1; point=8;}
				var result = validate(point,game_grid); //Check if there is a winner with the last input
				if(result==-1)
					end_player();
				else
					cpu_play();
			}
		}
		else
			document.getElementById('messages').innerHTML = '<span class="error">Please start a new game</span>'; //Output error message in case of blocked board
	}
	else
		document.getElementById('messages').innerHTML = '<span class="error">Please choose your settings and click "Start new game!" first</span>'; //Output error message in case of no game started
}
