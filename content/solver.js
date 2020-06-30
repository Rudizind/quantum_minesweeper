let solver = {
    // will return with Boolean - if true, means square can be resolved; if false, means square cannot be resolved, therefore change() is called. 
    test: (targetTile) => {
        
        // chosenConfig will be what is returned at the end of the function
        let chosenConfig

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
                    if (!testTiles.includes(neighbour)) {
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
                    if (testTiles.includes(neighbour)) {
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
                    console.log("all tiles are safe")
                }
                else {
                    // heuristic one - if no. of hidden spaces around revealed tile is equal to the number in its text minues the flags around it,
                    // then all remaining spaces must be mines. 
                    if ((tile.mineCount - flagNeighbours.length) == unknownNeighbours.length) {
                        // Display a flag in the tile
                        unknownNeighbours.forEach(square => console.log(newBoard[square.y-1][square.x-1]))
                        console.log(`simple found that the above tiles contain a mine`)
                        unknownNeighbours.forEach(square => newBoard[square.y-1][square.x-1].isFlagged = true)

                        changeBool = true;
                    }
                    // heuristic two - if no. of flagged spaces around revealed tile is equal to the number in its text,
                    // then all remaining spaces must be safe.
                    else if (tile.mineCount == flagNeighbours.length && unknownNeighbours.length > 0) {
                        unknownNeighbours.forEach(square => console.log(newBoard[square.y-1][square.x-1]))
                        console.log(`simple found that the above tiles contain no mine`)

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
                    console.log("hello there yes")
                    testTiles = []
                    easySolve()
                }
                else {
                    console.log("hello there NOT")
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
                let guessMines = []
                let guessNotMines = []

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
                    if (!testTiles.includes(neighbour)) {
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
                                    guessMines.push(guess)
                                }
                                else if (guess.guessNotMine == true) {
                                    guessNotMines.push(guess)
                                }
                            }
                        })
                    }
                })
                // get the number of unknown mines. 
                let unknownMines = tile.mineCount - flagNeighbours.length

                // if guesses for mines added to flag neighbours equals the minecount, and the guesses are equal to the unknown neighbours, then all is good :)
                if (guessMines.length + guessNotMines.length == unknownNeighbours.length && guessMines.length == unknownMines) {
                    // do nothing
                    ;
                }
                // if there are fewer guesses than there are unknown neighbours
                else if (guessMines.length + guessNotMines.length < unknownNeighbours.length) {
                    // if the mines guessed is less than the potential total, and the safe spaces guessed are less than the number of spaces minus the potential total.
                    if (guessMines.length <= unknownMines && guessNotMines.length <= unknownNeighbours.length - unknownMines) {
                        // do nothing
                        ;
                    }
                    else {
                        return isOk = false;
                    }
                }
                else {
                    return isOk = false;
                }
            })
            return isOk;
        }

        const getAllConfigs = (potentialMines, guesses) => {

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
                
                let config1 = getAllConfigs(potentialMines, guessesCopy1)
                let config2 = getAllConfigs(potentialMines, guessesCopy2)

                let combo = Array.prototype.concat(config1, config2)
                return combo;
            }
        }

        const solveBoardProbs = () => {
            
            // This array will contain all border tiles to be tested.
            let potentialMines = getTestTiles()

            let result = getAllConfigs(potentialMines, [])
            console.log(result)
            if (result.length > 0) {
                
                console.log("poop")
                
                // otherwise, it can't be only safe (otherwise it wouldn't contain a mine in the first place)
                // so it is set to not a mine, and then the solver will output a new array of bordering unrevealed tiles with guesses,
                // then make it true in the board. There's no need to check any further. 
                // last check will be 'if the total mines on board is less than the start total, add one more randomly in a non-revealed tile'
                
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
                        // if tile must contain a mine, and it's the chosen tile, the user loses
                        if (tile.x == targetTile.getAttribute("x") && tile.y == targetTile.getAttribute("y") && mine == result.length) {
                            endGame()
                            return;
                        }
                        else {

                            // set changedTile to true so the function knows that it has been able to determine a new tile
                            changedTile = true;

                            // if the tile must be a mine
                            if (mine == result.length) {
                                newBoard[tile.y-1][tile.x-1].isFlagged = true;
                                console.log(newBoard[tile.y-1][tile.x-1])
                                console.log(`complex found that this tile was a mine`)
                            }
                            // if the tile must be not a mine
                            else if (notMine == result.length) {
                                newBoard[tile.y-1][tile.x-1].revealed = true;
                                console.log(newBoard[tile.y-1][tile.x-1])
                                console.log(`complex found that this tile was not a mine`)
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
                        

                    }
                    else {
                        // tile == possibly mine, possibly not
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
                        // if the solver gets this far, it means that the chosen tile can't be discerned knowing current information.

                        // so:  if the tile is a part of the bordering unrevealed tiles, take a possible combination of configurations
                            // where the chosen tile is not a mine.
                        if (potentialMines.some(item => item.x == targetTile.getAttribute("x") && item.y == targetTile.getAttribute("y"))) {
                            console.log("it worked")
                            
                            result.forEach(array => {
                                let match = array.find(item => item.x == targetTile.getAttribute("x") && item.y == targetTile.getAttribute("y")) 
                                console.log(match)
                                if (match.guessNotMine == true) {
                                    chosenConfig = array

                                    // configure the items according to the guesses
                                    chosenConfig.forEach(item => {
                                        if (item.isMine == false && item.guessMine == true) {
                                            item.isMine = true
                                        }
                                        else if (item.isMine == true && item.guessNotMine == true) {
                                            if (item == match) {
                                                item.revealed = true
                                            }
                                            item.isMine = false
                                        }
                                    })

                                    return chosenConfig;
                                }
                            })

                            // take chosenConfig and change the current board state's mines to match it


                        }
                        // otherwise, if it's not in the bordering unrevealed tiles, take the chosen mine and remove it,
                            // and put it in a random unrevealed tile.
                        else {
                            // the new array which will be used to edit the DOM board
                            chosenConfig = []
                            console.log("it also worked here")
                            // get the chosen tile and change it to not a mine
                            let matchTarget = newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1]
                            matchTarget.revealed = true
                            matchTarget.isMine = false
                            chosenConfig.push(matchTarget)

                            // get a random tile that is neither revealed to the player nor neighbours any of those tiles
                            // need to refresh the ararys now that the target tile is revealed
                            potentialMines = getTestTiles()

                            // array to hold all potential new mines (we want to assign them randomly)
                            let newMineAssign = []

                            // get all appropriate tiles and push them
                            newBoard.forEach(row => {
                                row.forEach(tile => {
                                    if ((!potentialMines.includes(tile) || !testTiles.includes(tile)) && tile.isMine == false) {
                                        newMineAssign.push(tile)
                                    }
                                })
                            })

                            // get a random tile from those chosen and make it a mine, then push it
                            let index = Math.floor(Math.random() * newMineAssign.length)
                            let chosenMine = newMineAssign[index]
                            chosenMine.isMine = true
                            chosenConfig.push(chosenMine)
                            console.log(chosenConfig)
                        }
                        
                        console.log(newBoard);
                        console.log("nothing new to solve")
                        return;
                    }
                }
            }
            else {
                console.log(newBoard)

                // fail there's no possible board state that could work here.
                // handle failure
                endGame()
                console.log("end of the solver, can't solve anything else")
            }
        }
        
        // Finally, call everything
        easySolve()

        if (chosenConfig != undefined) {
            return chosenConfig
        }
        else {
            endGame()
        }
        
    },
    change: () => {
        // changes gameboard if appropriate from this.test()
    }
}