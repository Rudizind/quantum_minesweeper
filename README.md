# quantum_minesweeper

Ever been playing Minesweeper and gotten frustrated that your game has come down to a pure guess? Often a game's conclusion comes down to luck - a 50/50 chance. If you're not familiar with the rules of Minesweeper, they can be found here: https://en.wikipedia.org/wiki/Minesweeper_(video_game).

This version of Minesweeper - 'Quantum Minesweeper' - aims to remove this frustration. Many versions of this game provide a 'safety' feature that ensures the user's first click cannot be a mine. Here, we extend this concept to every click of a tile in the game. That said, there are three possible course of action the game will take when a user chooses a square:

(1) When a user clicks on a tile containing a mine, if it is guaranteed to be a mine in the current board state (i.e. in every possible configuration of mine and non-mine squares around the current 'revealed' tiles, that tile contains a mine in 100% of cases), the user loses. 
(2) When the user clicks on a tile containing a mine, if it is not guaranteed to be a mine in the current board state (i.e. in every possible configuration of mine and non-mine squares around the current 'revealed' tiles, that tile contains a mine in somewhere between 0% and 100% of cases (exclusive)), then the quantum safety feature activates and will attempt to resolve the board in such a way that the chosen square is not a mine given current known and deducible information. See below.
(3) When the user clicks on a tile NOT containing a mine, the square is revealed. If its 8 neighbours do not contain a mine (i.e. its mineCount number is 0), it performs a depth-first recursion over each square and its children and so on until all appropriate squares have been revealed. This step is no different to standard Minesweeper.

/* more info to follow here about step 2 and the solver/resolving the board state /*
