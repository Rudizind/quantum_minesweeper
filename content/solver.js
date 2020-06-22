let solver = {
    // will return with Boolean - if true, means square can be resolved; if false, means square cannot be resolved, therefore change() is called. 
    test: (square) => {
        let board = document.querySelectorAll(".mineSquare")
        console.log(board)
        let newBoard = []

        // must change the board from DOM elements to plain JS objects for the purpose of the solver.
        board.forEach(element => {
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
            // have to manually add some things with conditions so we don't get any errors. 

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
                    else if (element.childNodes[1].getAttribute("class") == "flag") {
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
            newBoard.push(newObj)
        })


        // this is the array of testTiles 
        let testTiles = []

        const getTestTiles = () => {

            // first, get the revealed tiles
            newBoard.forEach(tile => {
                if (tile.revealed == true) {
                    testTiles.push(tile)
                }
            })

            newArray = []
            testTiles.forEach(tile => {
                let safeNeighbours = []
                let flagNeighbours = []
                let unknownNeighbours = []
                
                newBoard.forEach(square => {
                    if (
                        // -1, -1
                        tile.x - 1 == square.x  && tile.y - 1 == square.y ||
                        // -1, 0
                        tile.x - 1 == square.x && tile.y == square.y ||
                        // -1, 1
                        tile.x - 1 == square.x && tile.y + 1  == square.y||
                        // 0, -1
                        tile.x == square.x && tile.y - 1 == square.y ||
                        // 0, 1
                        tile.x == square.x && tile.y + 1 == square.y ||
                        // 1, -1
                        tile.x + 1 == square.x && tile.y - 1 == square.y ||
                        // 1, 0
                        tile.x + 1 == square.x && tile.y == square.y ||
                        // 1, 1
                        tile.x + 1 == square.x && tile.y + 1 == square.y
                    ) {
                        // if tile is already revealed add it to safe neighbours
                        if (testTiles.includes(square)) {
                            safeNeighbours.push(square)
                        }
                        // if tile contains nothing but isn't revealed yet
                        else if (!testTiles.includes(square) && square.isMine == false && square.isFlagged == false) {
                            unknownNeighbours.push(square)
                        }
                        // if tile contains a mine OR a flag
                        else if (square.revealed == false && (square.isMine == true || square.isFlagged == true)) {
                            // if a tile contains a mine and no flag
                            if (square.isMine == true) {
                                unknownNeighbours.push(square)
                            }
                            // if a tile contains a flag and no mine
                            else if (square.isFlagged == true) {
                                flagNeighbours.push(square)
                            }
                        }
                        // if tile contains both a mine and a flag
                        else if (!testTiles.includes(square) && square.isMine == true && square.isFlagged == true) {
                            flagNeighbours.push(square)
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


        // This array will contain all border tiles to be tested.
        potentialMines = getTestTiles()
        console.log(potentialMines)

        const isOkState = (potentialMineTiles, guesses) => {
            // combine the current board state with the guesses so we can see if they work

            // Boolean to show if it works or not
            isOk = false;

            // get all border tiles
            let borderTiles = testTiles

            // get all neighbours of border tiles, check them along with the guesses to see if they are compatible
            borderTiles.forEach(tile => {
                let safeNeighbours = []
                let flagNeighbours = []
                let unknownNeighbours = []
                let guessMines = []
                let guessNotMines = []
                
                potentialMineTiles.forEach(square => {
                    if (
                        // -1, -1
                        tile.x - 1 == square.x  && tile.y - 1 == square.y ||
                        // -1, 0
                        tile.x - 1 == square.x && tile.y == square.y ||
                        // -1, 1
                        tile.x - 1 == square.x && tile.y + 1  == square.y||
                        // 0, -1
                        tile.x == square.x && tile.y - 1 == square.y ||
                        // 0, 1
                        tile.x == square.x && tile.y + 1 == square.y ||
                        // 1, -1
                        tile.x + 1 == square.x && tile.y - 1 == square.y ||
                        // 1, 0
                        tile.x + 1 == square.x && tile.y == square.y ||
                        // 1, 1
                        tile.x + 1 == square.x && tile.y + 1 == square.y
                    ) {
                        // if tile is already revealed add it to safe neighbours
                        if (testTiles.includes(square)) {
                            safeNeighbours.push(square)
                        }
                        // if tile contains nothing but isn't revealed yet
                        else if (!testTiles.includes(square) && square.isMine == false && square.isFlagged == false) {
                            unknownNeighbours.push(square)
                        }
                        // if tile contains a mine OR a flag
                        else if (square.revealed == false && (square.isMine == true || square.isFlagged == true)) {
                            // if a tile contains a mine and no flag
                            if (square.isMine == true) {
                                unknownNeighbours.push(square)
                            }
                            // if a tile contains a flag and no mine
                            else if (square.isFlagged == true) {
                                flagNeighbours.push(square)
                            }
                        }
                        // if tile contains both a mine and a flag
                        else if (!testTiles.includes(square) && square.isMine == true && square.isFlagged == true) {
                            flagNeighbours.push(square)
                        }

                        // for guesses
                        guesses.forEach(guess => {
                            if (guess.x == square.x && guess.y == square.y) {
                                if (guess.guessMine == true) {
                                    guessMines.push(guess)
                                    console.log(`true guess = ${guess}`)
                                }
                                else if (guess.guessNotMine == true) {
                                    guessNotMines.push(guess)
                                    console.log(`not true guess = ${guess}`)
                                }
                            }
                        })
                    }
                })
                console.log(guesses)
                // get the number of unknown mines. 
                let unknownMines = tile.mineCount - flagNeighbours.length

                // if guesses for mines added to flag neighbours equals the minecount, and the guesses are equal to the unknown neighbours, then all is good :)
                if (guessMines.length + guessNotMines.length == unknownNeighbours.length && guessMines.length == unknownMines) {
                    isOk = true;
                }
                // if there are fewer guesses than there are unknown neighbours
                else if (guessMines.length + guessNotMines.length < unknownNeighbours.length) {
                    // if the mines guessed is less than the potential total, and the safe spaces guessed are less than the number of spaces minus the potential total.
                    if (guessMines.length <= unknownMines && guessNotMines.length <= unknownNeighbours.length - unknownMines) {
                        isOk = true;
                    }
                    else {
                        isOk = false;
                    }
                }
                else {
                    isOk = false;
                }
            })
            console.log(isOk)
            return isOk;
        }
        let result = []

        const getAllConfigs = (board, guesses) => {
            console.log(`${guesses.length} is the guesses length, and ${potentialMines.length} is the spaces length`)
            if (isOkState(board, guesses) == false) {
                console.log("failure")
                return []
            }
            // all edge squares have a guess in them
            else if (guesses.length == potentialMines.length)  {
                return guesses
            }
            else {
                // let x = get a new edge square that doesn't have a guess in it. 
                console.log(guesses)

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

                // it's getting to a number of combinations of potential guesses, but it doesn't know what to do with them. 
                
                console.log(guessesCopy1)
                console.log(guessesCopy2)

                let config1 = getAllConfigs(board, guessesCopy1)
                let config2 = getAllConfigs(board, guessesCopy2)

                let combo = Array.prototype.concat(config1, config2)
                if (!combo.includes(undefined)) { 
                    result.push(combo)
                }

            }
        }
        getAllConfigs(newBoard, [])
        console.log(result)

        // so... it is setting a guessmine and guessnot mine into the guesses. which means there is something wrong with the recursion.

    },
    change: () => {
        // changes gameboard if appropriate from this.test()
    }
}