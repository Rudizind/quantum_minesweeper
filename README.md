# quantum_minesweeper

/* PRINCIPLES OF QUANTUM MINESWEEPER */

Ever been playing Minesweeper and gotten frustrated that your game has come down to a pure guess? Often a game's conclusion comes down to luck - a 50/50 chance. If you're not familiar with the rules of Minesweeper, they can be found here: https://en.wikipedia.org/wiki/Minesweeper_(video_game).

This version of Minesweeper - 'Quantum Minesweeper' - aims to remove this frustration. Many versions of this game provide a 'safety' feature that ensures the user's first click cannot be a mine. Here, we extend this concept to every click of a tile in the game. That said, there are three possible course of action the game will take when a user chooses a square:

(1) When a user clicks on a tile containing a mine, if it is guaranteed to be a mine in the current board state (i.e. in every possible configuration of mine and non-mine squares around the current 'revealed' tiles, that tile contains a mine in 100% of cases), the user loses. 
(2) When the user clicks on a tile containing a mine, if it is not guaranteed to be a mine in the current board state (i.e. in every possible configuration of mine and non-mine squares around the current 'revealed' tiles, that tile contains a mine in somewhere between 0% and 100% of cases (exclusive)), then the quantum safety feature activates and will attempt to resolve the board in such a way that the chosen square is not a mine given current known and deducible information. See quantum safety/solver section below.
(3) When the user clicks on a tile NOT containing a mine, the square is revealed. If its 8 neighbours do not contain a mine (i.e. its mineCount number is 0), it performs a depth-first recursion over each square w and its children and so on until all appropriate squares have been revealed. This step is no different to standard Minesweeper.



/* QUANTUM SAFETY/SOLVER */

TL;DR: If a player clicks on a tile that contains a mine, if the solver determines that that tile does not *absolutely* contain a mine given current known and deducible information, then the game board will resolve in such a way that that tile is revealed and does NOT contain a mine.

Enter Quantum Minesweeper. When a player clicks on a mine, the solver checks if the player could have determined through other moves (or deduction directly for that tile) that their chosen tile contained a mine. It does this in several steps. Firstly, it solves whatever tiles it can on the board using two basic heuristics for Minesweeper until it can no longer do so. These heuristics are: (1) if a tile's number is equal to the number of flags currently placed in the 8 neighbours of that tile, then all remaining unknown neighbour tiles must be safe tiles, and can be marked as revealed; and (2) if a tile's number is equal to the number of flags currently placed in the 8 neighbours of that tile ADDED TO the number of unrevealed neighbours, then each of those unrevealed neighbours must all contain mines, and can be flagged. 

Using these two heuristics, simple game boards such as 5x5 with 5 mines can be solved relatively consistently. However, when we begin looking at larger game boards and mine counts, these heuristics prove insufficient by themselves. Once no more information can be found using these heuristics, therefore, the solver moves to the second step of its solution: the probability-based algorithm. This algorithm determines any information that a human could deduce by cleverly calculating possible configurations of mines in a given set of border tiles around a known are on the game board.

The solver recursively checks combinations of 'mine' and 'not-mine' in each border tile until it finds that the current combination doesn't work (which cuts off the search and continues with the next branch), or until the number of 'mine/not-mine' guesses passes the OK check and is equal to the number of unrevealed border tiles presented to it. It continues to do this to find as many combinations as possible of mines that feasibly could work in the current board state. Once it has concluded and has its list of combinations (a 2D array), it then checks each tile's guess within each of the possible combinations. It uses the logic that, if a tile has been guessed as a mine in every working combination, then it must contain a mine and can be flagged as such; similarly, if a tile has been guessed safe in every working combination, then it must be safe and can be made revealed. With this new information, the solver begins again using the heuristics mentioned above. This cycle continues until either part of the solver reaches the player's chosen tile and decides that it contains a mine, or until no more information can be deduced (meaning that the player could not have determined that their tile contained a mine).

When it comes to the player's chosen tile, if the solver has been called it means that there is some probability of that tile containing a mine (so there is no chance of it returning absolutely safe). The only way the solver will render any chosen tile as 'uncertain' is if it has no new information when it concludes the probability-based solver and stops. At this stage, the mines on the actual gameboard are reshuffled in one of two ways: (1) if the player's chosen tile has not been uncovered yet (i.e. it is not included in the last round of unrevealed border tiles by the solver), then its mine is removed and placed somewhere else on the board that is also unrevealed to the player at this stage; or (2) if the player's chosen tile IS included in the last round of unrevealed border tiles by the probability-based solver, and it hasn't been determined to absolutely contain a mine, then the program will make 'true' one of the possible configurations returned within its calculations. Specifically, it will make true a configuration of mines around those border tiles that renders the player's chosen tile as NOT containing a mine, therefore making their click safe. If this changing of border tiles results in a mine count less than or greater than the starting mine count, then the solver also looks for tiles undiscovered by the player and adds (or takes away) mines as appropriate.

Once the mines have been reshuffled according to the logic above, the game continues and the player can make another click on the game board.



/* MINE VISION */

If you're curious about what happens during a game when it comes to reshuffling the game board, there's an additional option in the menu to turn on 'Mine Vision'. This is exactly what it sounds like - the player will see all tiles that contain mines in the current board by their red colour. More importantly, the player can observe how mines get moved around the board when they click on one. This is obviously a very cheat-y way to win a lot of games in your statistics (if that's what you're into); nevertheless it provides helpful insight into how powerful the program is at calculating potentially huge combinations of Booleans in an efficient and timely manner. 



/* HINT SYSTEM */

For players that want to play the game legitimately, but want a hint when they get stuck instead of making a random guess, they have the option of using the built-in hints system. This system uses the same algorithms as the main solver, but instead of deciding whether a player has lost and also reshuffling the board, the output simply details the percentage chance that the player's chosen tile contains a mine. The hints function then renders a border with a colour appropriate to a certain meaning. If it's green, then the tile is safe in 100% of the configurations of mines in the current board (and can be clicked safely); if it's red, then it's a mine in 100% of the configurations of mines in the current board (and should NOT be clicked, but can be flagged); if it's yellow, however, it means that the probability of that tile containing a mine lies somewhere between 0 and 100% (exclusive). This last option, in a static Minesweeper gameboard, would not be without risk if you should choose to left click. In this version, however, yellow hint tiles are safe for the user to click as the solver is unable to determine that that tile does or does not contain a mine using its logic - therefore, if it DOES contain a mine, it will remove it and place it somewhere else.

It is worth noting that the hints are related *ONLY* to the current board state as it exists when you use the hint. As soon as you click on another tile, the hint will disappear and it can be assumed that the hint you used is no longer relevant. This is not always the case of course; if one left clicks a tile with a green hint border around it, we know that no reshuffling of mines will take place because the player hasn't clicked on one. Nonetheless, hints will only appear until another click is made in all cases.



/* STATS AND THE LEADERBOARD */

For the competitive players among us, game statistics are implemented into this program. Not only are games played, wins, and losses tracked for each user by their login details, but the leaderboard also ranks all players by their win ratio (i.e. number of wins / number of games played). These stats are not exhaustive, but do provide some insight into how a player has interacted with the game over time. 

One interesting statistic (which is there purely for curiosity's sake) is the number of times you've been saved by the quantum safety feature. Each time the solver runs and doesn't cause the player to lose, the game registers that as a 'quantum save' and ups this statistic by one. All for fun, but interesting nonetheless!



/* SOLVER REPLAY */

So... you lost the game. Maybe you know how you lost, and that's cool. Sometimes, though, a player may find that they've lost the game but don't understand why - and that's why a solver replay feature has been implemented within the Quantum Minesweeper game.

When you lose a game of Quantum Minesweeper, the game is basically telling you - "you could've figured out that there was a mine here." The solver stores the actions it took to decide that your chosen tile contained a mine, and you can view them yourself when a game ends by clicking the "See the solver's actions" button at the bottom of the gameboard. This will give you a step-by-step walkthrough of each move taken by the solver, and the reason behind that decision. With this you can see how the solver cleared various (sometimes many!) tiles on the board in order to reach your chosen tile and decide that it contained a mine. The display includes a 'move counter' which displays the order and final quantity of tiles uncovered by the solver in its solution, as well as a brief description of why that tile contained a mine/was safe.



/* CUSTOMIZATION OPTIONS */

Not everyone wants to play an expert level game of 99 mines in a 30 x 16 board. That's why there are customization options to suit any player's needs! There are options for five different board sizes (with appropriate mine count scaled to that size), and 'mine multipliers' that a player can choose from, ranging from 0.7x => 1.3x the number of mines for that board size. 



/* HOW TO RUN QUANTUM MINESWEEPER */

In order to automatically set up your couchdb connection, you will need to edit the indicated lines in config-db.js. These will be marked with `*EDIT HERE*`.
These will set your username, password, and DB URL. It is assumed that these will be available to the user.

Once you've done this, in your terminal window navigate to the root directory of the downloaded files. If you have node and npm installed, then run "npm i". This will install all dependencies required from node.js, as listed in the package.json for the project.

If you do not have node.js and npm installed, you will need this to proceed. Once you have them installed run "npm i" as mentioned above.

Once your dependencies have been installed, you're ready to start the server and load the game in the browser. To start the server, run "node server.js in the root directory of your project. You will receive some messages telling you that the server has started and that the database connection has been successful. If you've left the default port open for the server, open your preferred (modern) browser and go to "localhost:3000". Otherwise, go to whichever localhost port you've set to use with this project.

You should see the login page for Quantum Minesweeper in your browser window. Make a username and password (fulfilling certain parameters - e.g. above 8 characters each), and you should be able to register and login with it. Now you're ready to start a game of Quantum Minesweeper!



/* TESTING */

A testing suite has been included with this project using the Mocha framework and the Chai.js assertion library. These assertions are dotted throughout the main codebase in content/client.js, content/board.js, and content/solver.js, but some are also present within the test folder in the root directory of the project, in the runTest.js file. If you are interested and wish to run the tests for this project within a node environment, you can do so using the test script with the following command in your terminal window: "npm run test". This will provide output from each of the unit tests scattered throughout the code, and throw assertion errors for any failing tests. Assertions are scattered throughout the code for viewing in the browser console as well - though these will only be displayed when there is an assertion error.



/* A NOTE ON LOGIN DETAILS */

Although this project itself is not for commercial deployment, I have implemented a user database that stores basic credentials and statistics. Although it will be assessed with separate instances (i.e. not interacting with other users), it should be imagined that these stats and so on would be used more often in a deployed setting.