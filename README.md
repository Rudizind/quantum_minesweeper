# quantum_minesweeper

Ever been playing Minesweeper and gotten frustrated that your game has come down to a pure guess? Often a game's conclusion comes down to luck - a 50/50 chance. If you're not familiar with the rules of Minesweeper, they can be found here: https://en.wikipedia.org/wiki/Minesweeper_(video_game).

This version of Minesweeper - 'Quantum Minesweeper' - aims to remove this frustration. Many versions of this game provide a 'safety' feature that ensures the user's first click cannot be a mine. Here, we extend this concept to every click of a tile in the game. That said, there are three possible course of action the game will take when a user chooses a square:

(1) When a user clicks on a tile containing a mine, if it is guaranteed to be a mine in the current board state (i.e. in every possible configuration of mine and non-mine squares around the current 'revealed' tiles, that tile contains a mine in 100% of cases), the user loses. 
(2) When the user clicks on a tile containing a mine, if it is not guaranteed to be a mine in the current board state (i.e. in every possible configuration of mine and non-mine squares around the current 'revealed' tiles, that tile contains a mine in somewhere between 0% and 100% of cases (exclusive)), then the quantum safety feature activates and will attempt to resolve the board in such a way that the chosen square is not a mine given current known and deducible information. See below.
(3) When the user clicks on a tile NOT containing a mine, the square is revealed. If its 8 neighbours do not contain a mine (i.e. its mineCount number is 0), it performs a depth-first recursion over each square w and its children and so on until all appropriate squares have been revealed. This step is no different to standard Minesweeper.

/* more info to follow here about step 2 and the solver/resolving the board state /*

/* HOW TO RUN QUANTUM MINESWEEPER */

In order to automatically set up your couchdb connection, you will need to edit the indicated lines in config-db.js. These will be marked with `*EDIT HERE*`.
These will set your username, password, and DB URL. It is assumed that these will be available to the user.

Once you've done this, in your terminal window navigate to the root directory of the downloaded files. If you have node and npm installed, then run "npm i". This will install all dependencies required from node.js, as listed in the package.json for the project.

If you do not have node.js and npm installed, you will need this to proceed. Once you have them installed run "npm i" as mentioned above.

Once your dependencies have been installed, you're ready to start the server and load the game in the browser. To start the server, run "node server.js in the root directory of your project. You will receive some messages telling you that the server has started and that the database connection has been successful. If you've left the default port open for the server, open your preferred (modern) browser and go to "localhost:3000". Otherwise, go to whichever localhost port you've set to use with this project.

You should see the login page for Quantum Minesweeper in your browser window. Make a username and password (fulfilling certain parameters - e.g. above 8 characters each), and you should be able to register and login with it. Now you're ready to start a game of Quantum Minesweeper!