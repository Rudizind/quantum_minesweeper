let solver = {
    // will return with Boolean - if true, means square can be resolved; if false, means square cannot be resolved, therefore change() is called. 
    test: (targetTile) => {

        // these are the tiles that need to be changed when the solver has concluded
        let tilesToChange = []

        let boardwidth = currentGame.boardSize == 'xl' ? 30 : 
                currentGame.boardSize == 'l' ? 20 :
                currentGame.boardSize == 'm' ? 13 :
                currentGame.boardSize == 's' ? 8 :
                currentGame.boardSize == 'xs' ? 5 : console.log("no board size provided")
        let boardheight = currentGame.boardSize == 'xl' ? 16 :
                currentGame.boardSize == 'l' ? 12 :
                currentGame.boardSize == 'm' ? 9 :
                currentGame.boardSize == 's' ? 7 :
                currentGame.boardSize == 'xs' ? 5 : console.log("no board size provided")

        // newBoard with rows and columns in a 2D array. This makes lookup much quicker than iteration over a single array with x and y values attached.
        let newBoard = []

        // must change the board from DOM elements to plain JS objects for the purpose of the solver.
        let allCells = document.querySelectorAll(".mineSquare")

        // count for cells in the single array, to be transferred to a 2D array below:
        let cellCount = 0

        for (let rows=1;rows<=boardheight;rows++) {
            let newRow = []
            for (let columns=1;columns<=boardwidth;columns++) {
                // get the current element
                let element = allCells[cellCount]

                let newObj = {
                    x: Number(element.getAttribute("x")),
                    y: Number(element.getAttribute("y")),
                    isMine: false,
                    isFlagged: false,
                    revealed: false,
                    mineCount: null,
                    guessMine: false,
                    guessNotMine: false
                }
    
                // if the node has a mine or a flag in it
                if (element.childNodes.length > 0 || element.textContent == "") {
                    // if it's a safe square
                    if (element.revealed == true) {
                        newObj.revealed = true
                        if (element.textContent != "") {
                            newObj.mineCount = Number(element.textContent)
                        }
                    }
                    // if it contains EITHER a flag OR a mine (but not both)
                    if (element.childNodes.length == 1 && element.textContent == "") {
                        if (element.childNodes[0].getAttribute("class") == "mine") {
                            newObj.isMine = true;
                        }
                        else if (element.childNodes[0].getAttribute("class") == "flag") {
                            newObj.isFlagged = true;
                        }
                    }
                    else if (element.childNodes.length == 2) {
                        if (element.childNodes[0].getAttribute("class") == "mine" && element.childNodes[1].getAttribute("class") == "flag") {
                            newObj.isMine = true;
                            newObj.isFlagged = true;
                        }
                    }
                }
                // push the object to the row
                newRow.push(newObj)
                
                // go to the next cell
                cellCount++
            }
            // push the row to the 2D array
            newBoard.push(newRow)
        }


        // this is the array of testTiles, which is every revealed tile
        let testTiles = []

        const getTestTiles = () => {
            // first, get the revealed tiles
            newBoard.forEach(row => {
                row.forEach(tile => {
                    if (tile.revealed == true) {
                        testTiles.push(tile)
                    }
                })
            })

            // newArray will hold all the unique tiles to be tested for mines below in getAllConfigs()
            newArray = []
            testTiles.forEach(tile => {
                // safeNeighbours is not necessary here
                let flagNeighbours = []
                let unknownNeighbours = []

                // note here, that confusingly the indices will be -1 to what you'd expect. This is because of the array numbering vs the numbering I've used elsewhere. 
                let neighbourTiles = 
                    // if the tile is in the top left corner [3 TILES]
                    tile.x == 1 && tile.y == 1 ? [newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]] :
                    // if the tile is in the top right corner [3 TILES]
                    tile.x == boardwidth && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                    // if the tile is in the bottom left corner [3 TILES]
                    tile.x == 1 && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is in the bottom right corner [3 TILES]
                    tile.x == boardwidth && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2]] :
                    // if the tile is on the top border [5 TILES]
                    (tile.x > 1 && tile.x < boardwidth) && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], 
                        newBoard[tile.y][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is on the right border [5 TILES]
                    tile.x == boardwidth && (tile.y > 1 && tile.y < boardheight) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2], 
                        newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                    // if the tile is on the bottom border [5 TILES]
                    (tile.x > 1 && tile.x < boardwidth) && tile.y == boardheight ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], 
                        newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is on the left border [5 TILES]
                    tile.x == 1 && (tile.y > 1 && tile.y < boardwidth) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x], 
                        newBoard[tile.y][tile.x], newBoard[tile.y][tile.x-1]] :
                    // all tiles surrounded by 8 other tiles [8 TILES]
                    [newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x-2], 
                        newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]]

                // if tile is safe, it doesn't need to be dealt with here.
                // if it isn't safe, then:
                neighbourTiles.forEach(neighbour => {
                    if (neighbour.revealed == false) {
                        // if tile contains neither a flag nor a mine
                        if (neighbour.isMine == false && neighbour.isFlagged == false) {
                            unknownNeighbours.push(neighbour)
                        }
                        // if tile contains both a mine and a flag
                        else if (neighbour.isMine == true && neighbour.isFlagged == true) {
                            flagNeighbours.push(neighbour)
                        }
                        // if tile contains a mine OR a flag
                        else if (neighbour.isMine == true || neighbour.isFlagged == true) {
                        // if a tile contains a mine and no flag
                            if (neighbour.isMine == true) {
                                unknownNeighbours.push(neighbour)
                            }
                            // if a tile contains a flag and no mine
                            else if (neighbour.isFlagged == true) {
                                flagNeighbours.push(neighbour)
                            }
                        }
                    }
                })
                        
                // every unique unknown neighbour should be added to the new array
                unknownNeighbours.forEach(square => {
                    if (!newArray.find(element => element.x == square.x && element.y == square.y)) {
                        newArray.push(square)
                    }
                })
            })
            return newArray;
        }

        const easySolve = () => {
            // if the solver has found something using the heuristics, it will have new information and should run the easy solver again
            let changeBool = false;

            // initialise the test tiles
            let emptyTiles = getTestTiles()
            
            // get the current tile's neighbour tiles for each of the border revealed tiles
            testTiles.forEach(tile => {
                
                // collect info on safe, flagged, and unknown neighbours
                let safeNeighbours = []
                let flagNeighbours = []
                let unknownNeighbours = []

                // we have to get the new tile's mineCount as well if it is to be useful for recurring the function
                let neighbourTiles = 
                    // if the tile is in the top left corner [3 TILES]
                    tile.x == 1 && tile.y == 1 ? [newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]] :
                    // if the tile is in the top right corner [3 TILES]
                    tile.x == boardwidth && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                    // if the tile is in the bottom left corner [3 TILES]
                    tile.x == 1 && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is in the bottom right corner [3 TILES]
                    tile.x == boardwidth && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2]] :
                    // if the tile is on the top border [5 TILES]
                    (tile.x > 1 && tile.x < boardwidth) && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], 
                        newBoard[tile.y][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is on the right border [5 TILES]
                    tile.x == boardwidth && (tile.y > 1 && tile.y < boardheight) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2], 
                        newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                    // if the tile is on the bottom border [5 TILES]
                    (tile.x > 1 && tile.x < boardwidth) && tile.y == boardheight ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], 
                        newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is on the left border [5 TILES]
                    tile.x == 1 && (tile.y > 1 && tile.y < boardwidth) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x], 
                        newBoard[tile.y][tile.x], newBoard[tile.y][tile.x-1]] :
                    // all tiles surrounded by 8 other tiles [8 TILES]
                    [newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x-2], 
                        newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]]

                neighbourTiles.forEach(neighbour => {
                    // if tile is already revealed 
                    if (neighbour.revealed == true) {
                        safeNeighbours.push(neighbour)
                    }
                    // if not:
                    else {
                        // if tile contains neither a flag nor a mine
                        if (neighbour.isMine == false && neighbour.isFlagged == false) {
                            unknownNeighbours.push(neighbour)
                        }
                        // if tile contains both a mine and a flag
                        else if (neighbour.isMine == true && neighbour.isFlagged == true) {
                            flagNeighbours.push(neighbour)
                        }
                        // if tile contains a mine OR a flag
                        else if (neighbour.isMine == true || neighbour.isFlagged == true) {
                        // if a tile contains a mine and no flag
                            if (neighbour.isMine == true) {
                                unknownNeighbours.push(neighbour)
                            }
                            // if a tile contains a flag and no mine
                            else if (neighbour.isFlagged == true) {
                                flagNeighbours.push(neighbour)
                            }
                        }
                    }
                })

                // a catch all for when a tile is completely safe:
                if (unknownNeighbours.length == 0) {
                    // do nothing
                }
                else {
                    // heuristic one - if no. of hidden spaces around revealed tile is equal to the number in its text minues the flags around it,
                    // then all remaining spaces must be mines. 
                    if ((tile.mineCount - flagNeighbours.length) == unknownNeighbours.length) {
                        // Display a flag in the tile
                        unknownNeighbours.forEach(square => {
                            newBoard[square.y-1][square.x-1].isFlagged = true

                            // here is the check for if an unknown neighbour doesn't actually contain a mine yet,
                            // as a result of the changes from below
                            if (newBoard[square.y-1][square.x-1].isMine == false) {
                                newBoard[square.y-1][square.x-1].isMine = true
                                newBoard[square.y-1][square.x-1].mineCount = null
                                tilesToChange.push(newBoard[square.y-1][square.x-1])
                                console.log(newBoard[square.y-1][square.x-1])
                            }
                        })
                        changeBool = true;
                    }
                    // heuristic two - if no. of flagged spaces around revealed tile is equal to the number in its text,
                    // then all remaining spaces must be safe.
                    else if (tile.mineCount == flagNeighbours.length && unknownNeighbours.length > 0) {

                        unknownNeighbours.forEach(cell => {
                            // we have to get the new tile's mineCount as well if it is to be useful for recurring the function
                            let neighbours = 
                                // if the tile is in the top left corner [3 TILES]
                                cell.x == 1 && cell.y == 1 ? [newBoard[cell.y-1][cell.x], newBoard[cell.y][cell.x-1], newBoard[cell.y][cell.x]] :
                                // if the cell is in the top right corner [3 cellS]
                                cell.x == boardwidth && cell.y == 1 ? [newBoard[cell.y-1][cell.x-2], newBoard[cell.y][cell.x-2], newBoard[cell.y][cell.x-1]] :
                                // if the cell is in the bottom left corner [3 cellS]
                                cell.x == 1 && cell.y == boardheight ? [newBoard[cell.y-2][cell.x-1], newBoard[cell.y-2][cell.x], newBoard[cell.y-1][cell.x]] :
                                // if the cell is in the bottom right corner [3 cellS]
                                cell.x == boardwidth && cell.y == boardheight ? [newBoard[cell.y-2][cell.x-1], newBoard[cell.y-2][cell.x-2], newBoard[cell.y-1][cell.x-2]] :
                                // if the cell is on the top border [5 cellS]
                                (cell.x > 1 && cell.x < boardwidth) && cell.y == 1 ? [newBoard[cell.y-1][cell.x-2], newBoard[cell.y][cell.x-2], newBoard[cell.y][cell.x-1], 
                                    newBoard[cell.y][cell.x], newBoard[cell.y-1][cell.x]] :
                                // if the cell is on the right border [5 cellS]
                                cell.x == boardwidth && (cell.y > 1 && cell.y < boardheight) ? [newBoard[cell.y-2][cell.x-1], newBoard[cell.y-2][cell.x-2], newBoard[cell.y-1][cell.x-2], 
                                    newBoard[cell.y][cell.x-2], newBoard[cell.y][cell.x-1]] :
                                // if the cell is on the bottom border [5 cellS]
                                (cell.x > 1 && cell.x < boardwidth) && cell.y == boardheight ? [newBoard[cell.y-1][cell.x-2], newBoard[cell.y-2][cell.x-2], newBoard[cell.y-2][cell.x-1], 
                                    newBoard[cell.y-2][cell.x], newBoard[cell.y-1][cell.x]] :
                                // if the cell is on the left border [5 cellS]
                                cell.x == 1 && (cell.y > 1 && cell.y < boardwidth) ? [newBoard[cell.y-2][cell.x-1], newBoard[cell.y-2][cell.x], newBoard[cell.y-1][cell.x], 
                                    newBoard[cell.y][cell.x], newBoard[cell.y][cell.x-1]] :
                                // all cells surrounded by 8 other cells [8 cellS]
                                [newBoard[cell.y-2][cell.x-2], newBoard[cell.y-2][cell.x-1], newBoard[cell.y-2][cell.x], newBoard[cell.y-1][cell.x-2], 
                                    newBoard[cell.y-1][cell.x], newBoard[cell.y][cell.x-2], newBoard[cell.y][cell.x-1], newBoard[cell.y][cell.x]]

                                
                            // have to add a mineCount to the square now that it is revealed
                            let mineNeighbours = 0;
                            neighbours.forEach(neighbour => {if (neighbour.isMine == true) {mineNeighbours++}})
                            newBoard[cell.y-1][cell.x-1].mineCount = mineNeighbours;
                            newBoard[cell.y-1][cell.x-1].revealed = true

                            // here is the check for if a safe tile had a mine in it before (side effect of safety feature)
                            if (newBoard[cell.y-1][cell.x-1].isMine == true) {
                                newBoard[cell.y-1][cell.x-1].isMine = false
                                tilesToChange.push(newBoard[cell.y-1][cell.x-1])
                                console.log(newBoard[cell.y-1][cell.x-1])
                            }
                        })
                        changeBool = true;
                    }
                }
            })

            // if the solver has discovered that the chosen tile should be flagged using the easy solver,
            // then the player has failed and they lose
            if (newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1].isFlagged == true) {
                endGame()
            }
            else {
                if (changeBool == true) {
                    testTiles = []
                    easySolve()
                }
                else {
                    testTiles = []
                    solveBoardProbs()
                }
            }
        }

        const isOkState = (guesses) => {
            // combine the current board state with the guesses so we can see if they work

            // isOk will tell the function if it should stop or not
            let isOk = true;

            // get all neighbours of border tiles, check them along with the guesses to see if they are compatible
            testTiles.forEach(tile => {
                if (isOk == false) {
                    return;
                }
                let flagNeighbours = []
                let unknownNeighbours = []
                let guessMines = 0
                let guessNotMines = 0

                // note here, that confusingly the indices will be -1 to what you'd expect. This is because of the array numbering vs the numbering I've used elsewhere. 
                let neighbourTiles = 
                    // if the tile is in the top left corner [3 TILES]
                    tile.x == 1 && tile.y == 1 ? [newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]] :
                    // if the tile is in the top right corner [3 TILES]
                    tile.x == boardwidth && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                    // if the tile is in the bottom left corner [3 TILES]
                    tile.x == 1 && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is in the bottom right corner [3 TILES]
                    tile.x == boardwidth && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2]] :
                    // if the tile is on the top border [5 TILES]
                    (tile.x > 1 && tile.x < boardwidth) && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], 
                        newBoard[tile.y][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is on the right border [5 TILES]
                    tile.x == boardwidth && (tile.y > 1 && tile.y < boardheight) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2], 
                        newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                    // if the tile is on the bottom border [5 TILES]
                    (tile.x > 1 && tile.x < boardwidth) && tile.y == boardheight ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], 
                        newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                    // if the tile is on the left border [5 TILES]
                    tile.x == 1 && (tile.y > 1 && tile.y < boardwidth) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x], 
                        newBoard[tile.y][tile.x], newBoard[tile.y][tile.x-1]] :
                    // all tiles surrounded by 8 other tiles [8 TILES]
                    [newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x-2], 
                        newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]]

                neighbourTiles.forEach(neighbour => {
                    // if tile is already revealed it doesn't need to be handled here
                    // else
                    if (neighbour.revealed == false) {
                        // if tile contains neither a flag nor a mine
                        if (neighbour.isMine == false && neighbour.isFlagged == false) {
                            unknownNeighbours.push(neighbour)
                        }
                        // if tile contains both a mine and a flag
                        else if (neighbour.isMine == true && neighbour.isFlagged == true) {
                            flagNeighbours.push(neighbour)
                        }
                        // if tile contains a mine OR a flag
                        else if (neighbour.isMine == true || neighbour.isFlagged == true) {
                        // if a tile contains a mine and no flag
                            if (neighbour.isMine == true) {
                                unknownNeighbours.push(neighbour)
                            }
                            // if a tile contains a flag and no mine
                            else if (neighbour.isFlagged == true) {
                                flagNeighbours.push(neighbour)
                            }
                        }
                        // for guesses
                        guesses.forEach(guess => {
                            if (guess.x == neighbour.x && guess.y == neighbour.y) {
                                if (guess.guessMine == true) {
                                    guessMines++
                                }
                                else if (guess.guessNotMine == true) {
                                    guessNotMines++
                                }
                            }
                        })
                    }
                })
                // get the number of unknown mines. 
                let unknownMines = tile.mineCount - flagNeighbours.length

                // if guesses for mines added to flag neighbours equals the minecount, and the guesses are equal to the unknown neighbours, then all is good :)
                if (guessMines + guessNotMines == unknownNeighbours.length && guessMines == unknownMines) {
                    // do nothing
                    ;
                }
                // if there are fewer guesses than there are unknown neighbours
                else if (guessMines + guessNotMines < unknownNeighbours.length) {
                    // if the mines guessed is less than the potential total, and the safe spaces guessed are less than the number of spaces minus the potential total.
                    if (guessMines <= unknownMines && guessNotMines <= unknownNeighbours.length - unknownMines) {
                        // do nothing
                        ;
                    }
                    else {
                        return isOk = false;
                    }
                }
                // if the guesses for mines and notMines is equal to the unknownNeighbours, but the number of mines guessed is not correct:
                else {
                    return isOk = false;
                }
            })
            return isOk;
        }

        const getAllConfigs = (guesses) => {

            // This array will contain all border tiles to be tested.
            potentialMines = getTestTiles()

            if (!isOkState(guesses)) {
                return [];
            }
            // all edge squares have a guess in them
            else if (guesses.length == potentialMines.length)  {
                return [guesses];
            }
            else {
                // let x = get a new edge square that doesn't have a guess in it. 

                let newGuess = potentialMines[guesses.length]

                let guessesCopy1 = []
                let guessesCopy2 = []
                guesses.forEach(guess => {
                    let copy = Object.assign({}, guess)
                    guessesCopy1.push(copy)
                    guessesCopy2.push(copy)
                })

                for (i=0;i<2;i++) {
                    newGuess = Object.assign({}, newGuess)
                    if (i==0) {
                        newGuess.guessMine = true;
                        guessesCopy1.push(newGuess)
                    }
                    else {
                        newGuess.guessMine = false;
                        newGuess.guessNotMine = true;
                        guessesCopy2.push(newGuess)
                    }
                }
                
                let config1 = getAllConfigs(guessesCopy1)
                let config2 = getAllConfigs(guessesCopy2)

                let combo = Array.prototype.concat(config1, config2)
                return combo;
            }
        }

        // tiles to avoid for the testing
        let avoidTiles = getTestTiles()

        const findNewMine = () => {

            let newMine;

            // find how many tilesToChange are adding or removing mines
            let removeCount = 0
            let addCount = 0
            tilesToChange.forEach(item => item.isMine == false ? removeCount++ : addCount++)

            if (tilesToChange.length > 0) {
                newBoard.forEach(row => {
                    row.forEach(cell => {
                        if (cell.isMine == false && cell.revealed == false && !avoidTiles.includes(cell)) {
                            if (addCount < removeCount) {
                                addCount++
                                newMine = cell;
                                newMine.isMine = true;
                                return;
                            }
                        }
                        else if (cell.isMine == true && cell.revealed == false && !avoidTiles.includes(cell)) {
                            if (removeCount < addCount) {
                                removeCount++
                                newMine = cell;
                                newMine.isMine = false;
                                return;
                            }
                        }
                    })
                    if (newMine != undefined) {
                        return;
                    }
                })
            }

            console.log(newMine)
            
            if (newMine != undefined) {
                // if there is a safe tile that hasn't been uncovered by the solver yet, then it will be given the relocated mine
                tilesToChange.push(newMine)
            }

            if (addCount < removeCount || removeCount < addCount) {
                findNewMine()
            }
        }



        // fix check on whether a tile must be placed next to other neighbouring tiles
        // make clicked tile revealed after the new mines have been placed

        // getallconfigs returns array of possible combinations
        // if at least one of them has chosen square being not a mine
        // return that array and make it the new configuration of the gameboard



        const solveBoardProbs = () => {
            let result = getAllConfigs([])
            if (result.length > 0) {
                // Boolean to detect whether any decisions can be made
                let changedTile = false;
                potentialMines.forEach(tile => {
                    let mine = 0
                    let notMine = 0
                    result.forEach(array => {
                        let match = array.find(element => element.x == tile.x && element.y == tile.y)
                        match.guessMine == true ? mine++ : notMine++
                    })
                    if (mine == result.length || notMine == result.length) {
                        // set changedTile to true so the function knows that it has been able to determine a new tile
                        changedTile = true;

                        // if the tile must be a mine
                        if (mine == result.length) {
                            newBoard[tile.y-1][tile.x-1].isFlagged = true;
                            console.log(newBoard[tile.y-1][tile.x-1])
                        }
                        // if the tile must be not a mine
                        else if (notMine == result.length) {
                            newBoard[tile.y-1][tile.x-1].revealed = true;
                            console.log(newBoard[tile.y-1][tile.x-1])
                        }

                        // This will determine the number to be assigned to mineCount.
                        let mineNeighbours = 0;

                        // we have to get the new tile's mineCount as well if it is to be useful for recurring the function
                        let neighbourTiles = 
                            // if the tile is in the top left corner [3 TILES]
                            tile.x == 1 && tile.y == 1 ? [newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]] :
                            // if the tile is in the top right corner [3 TILES]
                            tile.x == boardwidth && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                            // if the tile is in the bottom left corner [3 TILES]
                            tile.x == 1 && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                            // if the tile is in the bottom right corner [3 TILES]
                            tile.x == boardwidth && tile.y == boardheight ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2]] :
                            // if the tile is on the top border [5 TILES]
                            (tile.x > 1 && tile.x < boardwidth) && tile.y == 1 ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], 
                                newBoard[tile.y][tile.x], newBoard[tile.y-1][tile.x]] :
                            // if the tile is on the right border [5 TILES]
                            tile.x == boardwidth && (tile.y > 1 && tile.y < boardheight) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-1][tile.x-2], 
                                newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1]] :
                            // if the tile is on the bottom border [5 TILES]
                            (tile.x > 1 && tile.x < boardwidth) && tile.y == boardheight ? [newBoard[tile.y-1][tile.x-2], newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], 
                                newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x]] :
                            // if the tile is on the left border [5 TILES]
                            tile.x == 1 && (tile.y > 1 && tile.y < boardwidth) ? [newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x], 
                                newBoard[tile.y][tile.x], newBoard[tile.y][tile.x-1]] :
                            // all tiles surrounded by 8 other tiles [8 TILES]
                            [newBoard[tile.y-2][tile.x-2], newBoard[tile.y-2][tile.x-1], newBoard[tile.y-2][tile.x], newBoard[tile.y-1][tile.x-2], 
                                newBoard[tile.y-1][tile.x], newBoard[tile.y][tile.x-2], newBoard[tile.y][tile.x-1], newBoard[tile.y][tile.x]]

                        // if tile is safe, it doesn't need to be dealt with here.
                        // if it isn't safe, then:
                        neighbourTiles.forEach(neighbour => {
                            if (neighbour.isMine == true) {mineNeighbours++}
                        })

                        // finally, assign the mineCount to the tile
                        newBoard[tile.y-1][tile.x-1].mineCount = mineNeighbours;

                    }
                    // if the tile is only a mine in some but not all configurations
                    else {

                    }
                })
                // must combine the potential mines entry with the newboard.

                // if the solver has discovered that the chosen tile should be flagged using the complex solver,
                // then the player has failed and they lose
                if (newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1].isFlagged == true) {
                    endGame()
                }
                else {
                    if (changedTile == true) {
                        testTiles = []
                        easySolve()
                    }
                    else {
                        // no possible changes can be made
                        console.log(newBoard);
                        console.log("solver found nothing new that could be solved")
                        
                        // make the tile safe, and now when the easy solver runs on the user's next click, it will attempt to find a square that should contain a mine but doesn't. 
                        // there is a catch when the easy solver finds a new tile that must contain a mine but doesn't,
                        // so that it adds a new one in to even out the mineCount.
                        if (newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1].isMine == true) {

                            let updateArray = 
                                result.find(array => {
                                    let item = array.find(cell => cell.x == targetTile.getAttribute("x") && cell.y == targetTile.getAttribute("y"))
                                    item.guessNotMine == true ? true : false
                                })

                            updateArray.forEach(item => {
                                item.guessMine == true ? item.isMine = true : item.isMine = false 




                                // this all needs fixed




                                tilesToChange.push(item)
                            })

                            // if the list of tiles to be updated in the DOM doesn't contain the target tile, add it. 
                            // also check if any new tiles need to be updated
                            if (!tilesToChange.includes(newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1])) {
                                tilesToChange.push(newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1])
                                // run the solver to find if there are any tiles that must be mines given the new changes
                                restul
                            }
                            console.log(newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1])

                        }
                    }
                }
            }
            else {
                console.log(newBoard)
                // fail there's no possible board state that could work here.
                // handle failure
                console.log("end of the solver, can't solve anything else")
            }
        }
        
        // Finally, call everything
        easySolve()

        
        if (tile.x == targetTile.x && tile.y == targetTile.y) {
                            
        }
        
        console.log(tilesToChange)
        return tilesToChange;
    },
    change: () => {
        // changes gameboard if appropriate from this.test()
    }
}