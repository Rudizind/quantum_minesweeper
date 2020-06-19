let solver = {
    // will return with Boolean - if true, means square can be resolved; if false, means square cannot be resolved, therefore change() is called. 
    test: (square, method = "easy") => {
        
        let linkedTilesList = []
        
        // test whether another the complex solver should run. In expert games, it almost always will, but no need to run it until you run out of options.
        // changeBool will be changed to true if a repeat should be made.
        let changeBool = false;

        // have to get an array of all revealed tiles that have hidden tiles in their borders. then have to get an array of all unrevealed neighbours of those tiles. 
        let revealedTiles = []
            
        // First, get all revealed tiles.
        let tiles = document.querySelectorAll(".mineSquare")
        tiles.forEach(tile => {
            if (tile.revealed == true) {
                revealedTiles.push(tile)
            }
        })

        // easySolve() uses the two basic heuristics of the game. Once it has run out of options, then complexSolve is called. 
        const easySolve = () => {
            revealedTiles.forEach(tile => {
                let safeNeighbours = []
                let flagNeighbours = []
                let unknownNeighbours = []
    
    
                tiles.forEach(cell => {
                    if (
                        // -1 / -1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) - 1) || 
                        // -1 / 0
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(tile.getAttribute("y"))) ||
                        // -1 / 1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) + 1) ||
                        // 0 / -1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) && cell.getAttribute("y") == Number(tile.getAttribute("y")) - 1) ||
                        // 0 / +1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) && cell.getAttribute("y") == Number(tile.getAttribute("y")) + 1) ||
                        // +1 / -1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) - 1) ||
                        // +1 / 0
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(tile.getAttribute("y"))) ||
                        // +1 / +1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) + 1) 
                    ) {
                        // if tile is already revealed
                        if (revealedTiles.includes(cell)) {
                            safeNeighbours.push(cell)
                        }
                        // if tile contains nothing but isn't revealed yet
                        else if (!revealedTiles.includes(cell) && cell.childNodes.length == 0) {
                            unknownNeighbours.push(cell)
                        }
                        // if tile contains a mine OR a flag
                        else if (cell.revealed == false && cell.childNodes.length == 1) {
                            // if a tile contains a mine and no flag
                            if (cell.childNodes[0].getAttribute("class") == "mine") {
                                unknownNeighbours.push(cell)
                            }
                            // if a tile contains a flag and no mine
                            else if (cell.childNodes[0].getAttribute("class") == "flag") {
                                flagNeighbours.push(cell)
                            }
                        }
                        // if tile contains both a mine and a flag
                        else if (!revealedTiles.includes(cell) && cell.childNodes.length == 2) {
                            flagNeighbours.push(cell)
                        }
                    }
                })
    
                // a catch all for when a tile is completely safe:
                if (unknownNeighbours.length == 0) {
                    return;
                }
                else {
                    // heuristic one - if no. of hidden spaces around revealed tile is equal to the number in its text minues the flags around it,
                    // then all remaining spaces must be mines. 
                    if ((tile.textContent - flagNeighbours.length) == unknownNeighbours.length) {
                        // Display a flag in the tile
                        unknownNeighbours.forEach(tile => mineTest(tile, "right"))
                        changeBool = true;
                    }
                    // heuristic two - if no. of flagged spaces around revealed tile is equal to the number in its text,
                    // then all remaining spaces must be safe.
                    else if (tile.textContent == flagNeighbours.length && unknownNeighbours.length > 0) {
                        // make all other tiles safe
                        unknownNeighbours.forEach(tile => mineTest(tile, "left"))
                        changeBool = true;
                    }
                }
            })
        }

        // The two heuristics in the function above aren't enough to solve a game of Minesweeper.
        // We need to use probabilities to get the final step. This will involve noting linked 
        const complexSolve = () => {
            console.log("complex here")

            // array of mines to add
            let testMines = []

            revealedTiles.forEach(tile => {
                let safeNeighbours = []
                let flagNeighbours = []
                let unknownNeighbours = []
                
    
    
                tiles.forEach(cell => {
                    if (
                        // -1 / -1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) - 1) || 
                        // -1 / 0
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(tile.getAttribute("y"))) ||
                        // -1 / 1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) + 1) ||
                        // 0 / -1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) && cell.getAttribute("y") == Number(tile.getAttribute("y")) - 1) ||
                        // 0 / +1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) && cell.getAttribute("y") == Number(tile.getAttribute("y")) + 1) ||
                        // +1 / -1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) - 1) ||
                        // +1 / 0
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(tile.getAttribute("y"))) ||
                        // +1 / +1
                        (cell.getAttribute("x") == Number(tile.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(tile.getAttribute("y")) + 1) 
                    ) {
                        // if tile is already revealed
                        if (revealedTiles.includes(cell)) {
                            safeNeighbours.push(cell)
                        }
                        // if tile contains nothing but isn't revealed yet
                        else if (!revealedTiles.includes(cell) && cell.childNodes.length == 0) {
                            unknownNeighbours.push(cell)
                        }
                        // if tile contains a mine OR a flag
                        else if (cell.revealed == false && cell.childNodes.length == 1) {
                            // if a tile contains a mine and no flag
                            if (cell.childNodes[0].getAttribute("class") == "mine") {
                                unknownNeighbours.push(cell)
                            }
                            // if a tile contains a flag and no mine
                            else if (cell.childNodes[0].getAttribute("class") == "flag") {
                                flagNeighbours.push(cell)
                            }
                        }
                        // if tile contains both a mine and a flag
                        else if (!revealedTiles.includes(cell) && cell.childNodes.length == 2) {
                            flagNeighbours.push(cell)
                        }
                    }
                })
                // the number of unknown mines in a square will be equal to the number in its text - flags placed.
                let unknownMines = tile.textContent - flagNeighbours.length

                // start testing to see
                unknownNeighbours.forEach(square => {
                    if (testMines.includes(square)) {
                        unknownMines--
                    }
                })

                // array for indices of chosen squares for mines
                let minesToPlace = []
                const addNewMine = () => {
                    let index = Math.floor(Math.random() * unknownNeighbours.length)
                    // if a mine has already been added there, then add a different one.
                    if (testMines.includes(unknownNeighbours[index]) || minesToPlace.includes(unknownNeighbours[index])) {
                        addNewMine()
                        console.log("yeah")
                    }
                    else {
                        minesToPlace.push(unknownNeighbours[index])
                        if (minesToPlace.length < unknownMines) {
                            addNewMine()
                        }
                        console.log("poop")
                    }
                }
                if (unknownMines > 0) {
                    addNewMine()
                }
                minesToPlace.forEach(mine => testMines.push(mine))
                console.log(minesToPlace)
                console.log(unknownMines)
                console.log(unknownNeighbours)

                // progress has been made. the program now searches and finds a set of new mines using the complex algorithm
                // however, it does NOT check yet if these mines will fit with the current numbers in the board entirely. Thus, it will have to be made to fit this. 
                // next step: once you have a new set of mines, check over each of the revealed squares again. 
                // if they have the correct amount of mines, proceed. If any don't, start again.
                // also need to remove the randomness factor out of this because otherwise it will go on forever.
                // if they all are correct, then call easySolve() again to begin.
                // we can add the 'what if we find the square?' heuristic in, and also the tuning in using x and y values to optimise the search. 
                // progress is nice tho :)
            })
            console.log(testMines)
        }






        // arguments will show which method to use below.
        // easy solve uses two basic heuristics (definite mine, and definite not-mine)
        if (method == "easy") {
            easySolve()
        }
        // complex solve uses probabilities for linked squares. 
        else if (method == "complex") {
            complexSolve()
        }






        // if 99 flags are placed, the user might have won the game. run the winGame() function to test this.
        if (currentGame.startMines == currentGame.flagsPlaced) {
            winGame()
        }




        
        // finally, if changeBool is true, run the function again as there might be new options for the easy heuristics.
        if (changeBool == true) {
            solver.test(square, "easy")
        }
        // if changeBool is false, check the linked tiles using the complex heuristics
        else {
            complexSolve()
        }
    },
    change: () => {
        // changes gameboard if appropriate from this.test()
    }
}