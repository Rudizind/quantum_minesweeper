let solver = {
    test: (targetTile) => {
        // reset the replay array 
        solver.replayArray = []

        // reset the errorTile for if the solver fails and the user views its process
        solver.errorTile = targetTile

        // chosenConfig will be what is returned at the end of the function
        let chosenConfig

        // get the board dimensions
        let boardwidth = currentGame.boardSize == 'xl' ? 30 :
            currentGame.boardSize == 'l' ? 20 :
            currentGame.boardSize == 'm' ? 13 :
            currentGame.boardSize == 's' ? 8 :
            currentGame.boardSize == 'xs' ? 5 : 30
        let boardheight = currentGame.boardSize == 'xl' ? 16 :
            currentGame.boardSize == 'l' ? 12 :
            currentGame.boardSize == 'm' ? 9 :
            currentGame.boardSize == 's' ? 7 :
            currentGame.boardSize == 'xs' ? 5 : 16

        // newBoard with rows and columns in a 2D array. This makes lookup much quicker than 
        // iteration over a single array with x and y values attached.
        let newBoard = []

        // must change the board from DOM elements to plain JS objects for the purpose of the solver.
        let allCells = document.querySelectorAll(".mineSquare")

        // count for cells in the single array, to be transferred to a 2D array below:
        let cellCount = 0

        for (let rows = 1; rows <= boardheight; rows++) {
            let newRow = []
            for (let columns = 1; columns <= boardwidth; columns++) {
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
                    if (element.revealed) {
                        newObj.revealed = true
                        if (element.textContent != "") {
                            newObj.mineCount = Number(element.textContent)
                        }
                    }
                    // if it contains EITHER a flag OR a mine (but not both)
                    if (element.childNodes.length == 1 && element.textContent == "") {
                        if (element.childNodes[0].getAttribute("class") == "mine") {
                            newObj.isMine = true;
                        } else if (element.childNodes[0].getAttribute("class") == "flag") {
                            newObj.isFlagged = true;
                        }
                    } else if (element.childNodes.length == 2) {
                        if (element.childNodes[0].getAttribute("class") == "mine" &&
                            element.childNodes[1].getAttribute("class") == "flag") {
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

        // Store the end game board state temporarily, in case the player
        // wishes to view the solver's actions
        // note, this will be overwritten each time the solver is called (i.e. if it's unused)
        solver.endBoardState = newBoard

        if (allMineNeighbours.length == 0) {
            setNeighbours(newBoard)
        }

        // this is the array of testTiles, which is every revealed tile
        let testTiles = []

        const getTestTiles = () => {
            // first, get the revealed tiles
            newBoard.forEach(row => {
                row.forEach(tile => {
                    if (tile.revealed) {
                        testTiles.push(tile)
                    }
                })
            })

            // newArray will hold all the unique tiles to be tested for mines below in getAllConfigs()
            newArray = []
            testTiles.forEach(tile => {
                if (!currentGame.active) {
                    return;
                }
                // safeNeighbours is not necessary here
                let flagNeighbours = []
                let unknownNeighbours = []

                // using the persistent storage of neighbours in allMineNeighbours for each game, 
                // we can easily match up the neighbours for each tile
                let neighbourMatch = allMineNeighbours.find(obj => obj.x == tile.x && obj.y == tile.y)
                neighbourTiles = []
                neighbourMatch.neighbours.forEach(cell => {
                    let item = newBoard[cell.y - 1][cell.x - 1]
                    neighbourTiles.push(item)
                })

                // if tile is safe, it doesn't need to be dealt with here.
                // if it isn't safe, then:
                neighbourTiles.forEach(neighbour => {
                    if (!neighbour.revealed) {
                        // if tile contains neither a flag nor a mine
                        if (!neighbour.isMine && !neighbour.isFlagged) {
                            unknownNeighbours.push(neighbour)
                        }
                        // if tile contains both a mine and a flag
                        else if (neighbour.isMine && neighbour.isFlagged) {
                            flagNeighbours.push(neighbour)
                        }
                        // if tile contains a mine OR a flag
                        else if (neighbour.isMine || neighbour.isFlagged) {
                            // if a tile contains a mine and no flag
                            if (neighbour.isMine) {
                                unknownNeighbours.push(neighbour)
                            }
                            // if a tile contains a flag and no mine
                            else if (neighbour.isFlagged) {
                                unknownNeighbours.push(neighbour)
                                // for now we are going to test if this makes the program work
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
            // if the solver has found something using the heuristics, 
            // it will have new information and should run the easy solver again
            let foundNewInfo = false;

            // initialise the test tiles
            getTestTiles()

            // get the current tile's neighbour tiles for each of the border revealed tiles
            testTiles.forEach(tile => {
                if (!currentGame.active) {
                    return;
                }

                // collect info on safe, flagged, and unknown neighbours
                let safeNeighbours = []
                let flagNeighbours = []
                let unknownNeighbours = []

                // using the persistent storage of neighbours in allMineNeighbours for each game, 
                // we can easily match up the neighbours for each tile
                let neighbourMatch = allMineNeighbours.find(obj => obj.x == tile.x && obj.y == tile.y)
                neighbourTiles = []
                neighbourMatch.neighbours.forEach(cell => {
                    let item = newBoard[cell.y - 1][cell.x - 1]
                    neighbourTiles.push(item)
                })

                neighbourTiles.forEach(neighbour => {
                    // if tile is already revealed 
                    if (neighbour.revealed) {
                        safeNeighbours.push(neighbour)
                    }
                    // if not:
                    else {
                        // if tile contains neither a flag nor a mine
                        if (!neighbour.isMine && !neighbour.isFlagged) {
                            unknownNeighbours.push(neighbour)
                        }
                        // if tile contains both a mine and a flag
                        else if (neighbour.isMine && neighbour.isFlagged) {
                            flagNeighbours.push(neighbour)
                        }
                        // if tile contains a mine OR a flag
                        else if (neighbour.isMine || neighbour.isFlagged) {
                            // if a tile contains a mine and no flag
                            if (neighbour.isMine) {
                                unknownNeighbours.push(neighbour)
                            }
                            // if a tile contains a flag and no mine
                            else if (neighbour.isFlagged) {
                                unknownNeighbours.push(neighbour)
                            }
                        }
                    }
                })

                // a catch all for when a tile is completely safe:
                if (unknownNeighbours.length == 0) {
                    // do nothing
                } else {
                    // heuristic one - if no. of hidden spaces around revealed tile is equal 
                    // to the number in its text minus the flags around it,
                    // then all remaining spaces must be mines. 
                    if ((tile.mineCount - flagNeighbours.length) == unknownNeighbours.length) {
                        // Display a flag in the tile

                        unknownNeighbours.forEach(square => {   
                            // need to make a new object to contain information for if
                            // the player loses and wishes to view the solver's solution
                            let replayObj = {
                                sourceTile: {
                                    x: tile.x,
                                    y: tile.y
                                },
                                actionTile: {
                                    x: square.x,
                                    y: square.y
                                },
                                actionTaken: "addFlag",
                                reason: "simpleFlag"
                            }
                            solver.replayArray.push(replayObj)

                            newBoard[square.y - 1][square.x - 1].isFlagged = true
                        })

                        foundNewInfo = true;
                    }
                    // heuristic two - if no. of flagged spaces around revealed tile is equal to the number in its text,
                    // then all remaining spaces must be safe.
                    else if (tile.mineCount == flagNeighbours.length && unknownNeighbours.length > 0) {
                        unknownNeighbours.forEach(cell => {
                            // we have to get the new tile's mineCount as well if it is to be useful for recurring the function
                            // using the persistent storage of neighbours in allMineNeighbours for each game, 
                            // we can easily match up the neighbours for each tile
                            let neighbourMatch = allMineNeighbours.find(obj => obj.x == cell.x && obj.y == cell.y)
                            neighbours = []
                            neighbourMatch.neighbours.forEach(neighbour => {
                                let item = newBoard[neighbour.y - 1][neighbour.x - 1]
                                neighbours.push(item)
                            })

                            // have to add a mineCount to the square now that it is revealed
                            let mineNeighbours = 0;
                            neighbours.forEach(neighbour => { if (neighbour.isMine) { mineNeighbours++ } })
                            newBoard[cell.y - 1][cell.x - 1].mineCount = mineNeighbours;
                            newBoard[cell.y - 1][cell.x - 1].revealed = true

                            // need to make a new object to contain information for if
                            // the player loses and wishes to view the solver's solution
                            let replayObj = {
                                sourceTile: {
                                    x: tile.x,
                                    y: tile.y
                                },
                                actionTile: {
                                    x: cell.x,
                                    y: cell.y,
                                    mineNeighbours: mineNeighbours
                                },
                                actionTaken: "safeClick",
                                reason: "simpleSafe"
                            }
                            solver.replayArray.push(replayObj)
                        })
                        foundNewInfo = true;
                    }
                }
            })

            // if the solver has discovered that the chosen tile should be flagged using the easy solver,
            // then the player has failed and they lose
            if (newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1].isFlagged) {
                endGame()

                // we return true here because the findSolution function will be recalled
                // and return immediately, because the game is no longer active.
                return true;
            } else {
                testTiles = []
                return foundNewInfo
            }
        }

        const isOkState = (guesses) => {

            // isOk will tell the function if it should stop or not
            let isOk = true;

            // get all neighbours of border tiles, check them along with the guesses to see if they are compatible
            testTiles.forEach(tile => {
                if (!isOk) {
                    return;
                }
                let flagNeighbours = []
                let unknownNeighbours = []
                let guessMines = []
                let guessNotMines = []

                // using the persistent storage of neighbours in allMineNeighbours for each game, 
                // we can easily match up the neighbours for each tile
                let neighbourMatch = allMineNeighbours.find(obj => obj.x == tile.x && obj.y == tile.y)
                neighbourTiles = []
                neighbourMatch.neighbours.forEach(cell => {
                    let item = newBoard[cell.y - 1][cell.x - 1]
                    neighbourTiles.push(item)
                })


                neighbourTiles.forEach(neighbour => {
                    // if tile is already revealed it doesn't need to be handled here
                    // else
                    if (!neighbour.revealed) {
                        // if tile contains neither a flag nor a mine
                        if (!neighbour.isMine && !neighbour.isFlagged) {
                            unknownNeighbours.push(neighbour)
                        }
                        // if tile contains both a mine and a flag
                        else if (neighbour.isMine && neighbour.isFlagged) {
                            flagNeighbours.push(neighbour)
                        }
                        // if tile contains a mine OR a flag
                        else if (neighbour.isMine || neighbour.isFlagged) {
                            // if a tile contains a mine and no flag
                            if (neighbour.isMine) {
                                unknownNeighbours.push(neighbour)
                            }
                            // if a tile contains a flag and no mine
                            else if (neighbour.isFlagged) {
                                unknownNeighbours.push(neighbour)
                            }
                        }
                        // for guesses
                        guesses.forEach(guess => {
                            if (guess.x == neighbour.x && guess.y == neighbour.y) {
                                if (guess.guessMine) {
                                    guessMines.push(guess)
                                } else if (guess.guessNotMine) {
                                    guessNotMines.push(guess)
                                }
                            }
                        })
                    }
                })
                // get the number of unknown mines. 
                let unknownMines = tile.mineCount - flagNeighbours.length

                // if guesses for mines added to flag neighbours equals the minecount, and the guesses are 
                // equal to the unknown neighbours, then all is good :)
                if (guessMines.length + guessNotMines.length == unknownNeighbours.length && guessMines.length == unknownMines) {
                    // do nothing
                    ;
                }
                // if there are fewer guesses than there are unknown neighbours
                else if (guessMines.length + guessNotMines.length < unknownNeighbours.length) {
                    // if the mines guessed is less than the potential total, and the safe spaces guessed are 
                    // less than the number of spaces minus the potential total.
                    if (guessMines.length <= unknownMines && guessNotMines.length <= unknownNeighbours.length - unknownMines) {
                        // do nothing
                        ;
                    } else {
                        return isOk = false;
                    }
                } else {
                    return isOk = false;
                }
            })
            return isOk;
        }

        const getAllConfigs = (potentialMines, guesses) => {
            if (!isOkState(guesses) || !currentGame.active) {
                return [];
            }
            // all edge squares have a guess in them
            else if (guesses.length == potentialMines.length) {
                return [guesses];
            } else {
                // let x = get a new edge square that doesn't have a guess in it. 

                let newGuess = potentialMines[guesses.length]

                let guessesCopy1 = []
                let guessesCopy2 = []
                guesses.forEach(guess => {
                    let copy = Object.assign({}, guess)
                    guessesCopy1.push(copy)
                    guessesCopy2.push(copy)
                })

                for (let i = 0; i < 2; i++) {
                    newGuess = Object.assign({}, newGuess)
                    if (i == 0) {
                        newGuess.guessMine = true;
                        guessesCopy1.push(newGuess)
                    } else {
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
            if (result.length > 0) {
                // it can't be only safe (otherwise it wouldn't contain a mine in the first place)
                // so it is set to not a mine, and then the solver will output a new 
                // array of bordering unrevealed tiles with guesses,
                // then make it true in the board. 

                // Boolean to detect whether any decisions can be made
                let changedTile = false;

                potentialMines.forEach(tile => {
                    if (!currentGame.active) {
                        return;
                    }
                    let mine = 0
                    let notMine = 0
                    result.forEach(array => {
                        let match = array.find(element => element.x == tile.x && element.y == tile.y)
                        match.guessMine ? mine++ : notMine++
                    })
                    if (mine == result.length || notMine == result.length) {
                        // set changedTile to true so the function knows that it 
                        // has been able to determine a new tile
                        changedTile = true;

                        // if the tile must be a mine
                        if (mine == result.length) {
                            newBoard[tile.y - 1][tile.x - 1].isFlagged = true;
                            
                            // need to make a new object to contain information for if
                            // the player loses and wishes to view the solver's solution
                            let replayObj = {
                                actionTile: {
                                    x: tile.x,
                                    y: tile.y
                                },
                                actionTaken: "addFlag",
                                reason: "complexFlag"
                            }
                            solver.replayArray.push(replayObj)
                        }
                        // if the tile must be not a mine
                        else if (notMine == result.length) {
                            newBoard[tile.y - 1][tile.x - 1].revealed = true;
                            
                            // This will determine the number to be assigned to mineCount.
                            let mineNeighbours = 0;

                            // we have to get the new tile's mineCount as well if it is to be 
                            // useful for recurring the function
                            // using the persistent storage of neighbours in allMineNeighbours for each game, 
                            // we can easily match up the neighbours for each tile
                            let neighbourMatch = allMineNeighbours.find(obj => obj.x == tile.x && obj.y == tile.y)
                            neighbourTiles = []
                            neighbourMatch.neighbours.forEach(cell => {
                                let item = newBoard[cell.y - 1][cell.x - 1]
                                neighbourTiles.push(item)
                            })

                            // if tile is safe, it doesn't need to be dealt with here.
                            // if it isn't safe, then:
                            neighbourTiles.forEach(neighbour => {
                                if (neighbour.isMine) { mineNeighbours++ }
                            })

                            // finally, assign the mineCount to the tile
                            newBoard[tile.y - 1][tile.x - 1].mineCount = mineNeighbours;
                            
                            // need to make a new object to contain information for if
                            // the player loses and wishes to view the solver's solution
                            let replayObj = {
                                actionTile: {
                                    x: tile.x,
                                    y: tile.y,
                                    mineNeighbours: mineNeighbours
                                },
                                actionTaken: "safeClick",
                                reason: "complexSafe"
                            }
                            solver.replayArray.push(replayObj)
                        }
                        
                    } else {
                        // tile == possibly mine, possibly not
                    }
                })
                // must combine the potential mines entry with the newboard.

                // if the solver has discovered that the chosen tile should be flagged using the complex solver,
                // then the player has failed and they lose
                if (newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1].isFlagged) {
                    currentGame.active = false;
                    endGame()
                    return false
                } else {
                    if (changedTile) {
                        testTiles = []
                        return true
                    } else {
                        // no possible changes can be made
                        // if the solver gets this far, it means that the chosen tile can't 
                        // be discerned knowing current information.

                        // so:  if the tile is a part of the bordering unrevealed tiles, 
                        // take a possible combination of configurations
                        // where the chosen tile is not a mine.
                        if (potentialMines.some(item => item.x == targetTile.getAttribute("x") &&
                                item.y == targetTile.getAttribute("y"))) {

                            let stopLoop = false;
                            result.forEach(array => {
                                if (stopLoop) {
                                    return;
                                }
                                let match = array.find(item => item.x == targetTile.getAttribute("x") &&
                                    item.y == targetTile.getAttribute("y"));
                                if (match.guessNotMine) {
                                    let flagsOk = true;
                                    // need to get all flagged tiles without a mine, 
                                    // and find a config where they all have mines
                                    // if there is none, then they've probably made a mistake
                                    // and the program will throw a loss
                                    array.forEach(item => {
                                        if (item.isFlagged) {
                                            if (item.guessNotMine) {
                                                return flagsOk = false;
                                            }
                                        }
                                    })
                                    if (!flagsOk) {
                                        return;
                                    }

                                    // instead of just assigning the values, we have to clone each object 
                                    // so we can change it and compare it to the original.
                                    chosenConfig = []
                                    array.forEach(item => {
                                        let clone = Object.assign({}, item)
                                        chosenConfig.push(clone)
                                    })

                                    // configure the items according to the guesses
                                    chosenConfig.forEach(item => {
                                        if (!item.isMine && item.guessMine) {
                                            item.isMine = true
                                        } else if (item.isMine && item.guessNotMine) {
                                            if (item == match) {
                                                item.revealed = true
                                            }
                                            item.isMine = false
                                        }
                                    })

                                    let newMines = chosenConfig.filter(item => item.isMine)
                                    let oldMines = array.filter(item => item.isMine)

                                    if (newMines.length < oldMines.length || oldMines.length < newMines.length) {

                                        // get a random tile that is neither revealed to the player 
                                        // nor neighbours any of those tiles
                                        // need to refresh the ararys now that the target tile is revealed
                                        testTiles = []
                                        potentialMines = getTestTiles()

                                        // array to hold all potential new mines (we want to assign them randomly)
                                        let newMineAssign = []

                                        // if there aren't enough mines in the new configuration, 
                                        // we need to add more to make up the difference
                                        if (newMines.length < oldMines.length) {
                                            // get all appropriate tiles and push them
                                            newBoard.forEach(row => {
                                                row.forEach(tile => {
                                                    if ((!potentialMines.includes(tile) || !testTiles.includes(tile)) &&
                                                        !tile.isMine && !tile.revealed) {
                                                        newMineAssign.push(tile)
                                                    }
                                                })
                                            })
                                            for (let i = 0; i < oldMines.length - newMines.length; i++) {
                                                // get a random tile from those chosen and make it a mine, 
                                                // then push it
                                                let index = Math.floor(Math.random() * newMineAssign.length)
                                                let chosenMine = newMineAssign[index]
                                                chosenMine.isMine = true
                                                chosenConfig.push(chosenMine)

                                                // reset the possible spaces to only include tiles 
                                                // other than the one just added
                                                newMineAssign = newMineAssign.filter(item => !item.isMine)
                                            }
                                        } else if (oldMines.length < newMines.length) {
                                            // get all appropriate tiles and push them
                                            newBoard.forEach(row => {
                                                row.forEach(tile => {
                                                    if ((!potentialMines.includes(tile) || !testTiles.includes(tile)) &&
                                                        tile.isMine && !tile.revealed) {
                                                        newMineAssign.push(tile)
                                                    }
                                                })
                                            })
                                            for (let i = 0; i < newMines.length - oldMines.length; i++) {
                                                // get a random tile from those chosen and make it a mine, 
                                                // then push it
                                                let index = Math.floor(Math.random() * newMineAssign.length)
                                                let chosenSafe = newMineAssign[index]
                                                chosenSafe.isMine = false
                                                chosenConfig.push(chosenSafe)

                                                // reset the possible spaces to only include tiles 
                                                // other than the one just added
                                                newMineAssign = newMineAssign.filter(item => item.isMine)
                                            }
                                        } else {
                                            // do nothing
                                        }
                                    }

                                    stopLoop = true;
                                    return false;
                                }
                            })
                        }
                        // otherwise, if it's not in the bordering unrevealed tiles, 
                        // take the chosen mine and remove it,
                        // and put it in a random unrevealed tile.
                        else {
                            // the new array which will be used to edit the DOM board
                            chosenConfig = []
                            // get the chosen tile and change it to not a mine
                            let matchTarget = newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1]
                            matchTarget.revealed = true
                            matchTarget.isMine = false
                            chosenConfig.push(matchTarget)

                            // get a random tile that is neither revealed to the player 
                            // nor neighbours any of those tiles
                            // need to refresh the ararys now that the target tile is revealed
                            potentialMines = getTestTiles()

                            // array to hold all potential new mines (we want to assign them randomly)
                            let newMineAssign = []

                            // get all appropriate tiles and push them
                            newBoard.forEach(row => {
                                row.forEach(tile => {
                                    if ((!potentialMines.includes(tile) || !testTiles.includes(tile)) &&
                                        !tile.isMine && !tile.revealed) {
                                        newMineAssign.push(tile)
                                    }
                                })
                            })

                            // get a random tile from those chosen and make it a mine, then push it
                            let index = Math.floor(Math.random() * newMineAssign.length)
                            let chosenMine = newMineAssign[index]
                            chosenMine.isMine = true
                            chosenConfig.push(chosenMine)
                        }
                    }
                }
            } else {
                // handle failure
                console.log(newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1])
                if (!currentGame.active) {
                    return false;
                }
                currentGame.active = false;
                endGame()
                console.log("end solver")
            }
        }

        // Finally, call everything
        const findSolution = () => {
            if (!currentGame.active) {
                return;
            }
            let useEasy = easySolve()
            if (useEasy) {
                findSolution()
            } else {
                let useComplex = solveBoardProbs()
                if (useComplex) {
                    findSolution()
                } else {
                    return;
                }
            }
        }
        findSolution()

        if (chosenConfig != undefined) {
            return chosenConfig
        } else {
            if (!currentGame.active) {
                return;
            }
            endGame()
            return;
        }
    },
    replayArray: [],
    endBoardState: [],
    errorTile: null,
    currentMove: -1,
    changeMove: (direction) => {
        // reset the onclick and opacity of left arrow if moving from lowest option
        if (solver.currentMove == -1) {
            document.getElementById("leftArrow").style.opacity = "1.0"
            document.getElementById("leftArrow").setAttribute("onclick", "solver.changeMove(-1)")
        }

        // reset the onclick and opacity of right arrow if moving from highest option
        // note that it moves to the length and not length - 1 because we want 
        // an extra item at the end for the 'end of solver' case
        else if (solver.currentMove == solver.replayArray.length) {
            document.getElementById("rightArrow").style.opacity = "1.0"
            document.getElementById("rightArrow").setAttribute("onclick", "solver.changeMove(1)")
        }

        // take the oldGuess, and either ensure it stays (if moving forward)
        // or is removed (if moving back)
        let oldGuess = solver.replayArray[solver.currentMove]

        // handle the direction param and increment/decrement the currentMove
        // ensure the direction is a number and not a string
        direction = Number(direction)

        // change the current index
        solver.currentMove += direction

        // get the guess from the replayArray corresponding with the appropriate index
        let newGuess = solver.replayArray[solver.currentMove]

        // remove the onclick and reduce opacity of left arrow if as far left as poss
        if (solver.currentMove == -1) {
            document.getElementById("leftArrow").style.opacity = "0.5"
            document.getElementById("leftArrow").setAttribute("onclick", "")
        }

        // remove the onclick and reduce opacity of right arrow if as far right as poss
        else if (solver.currentMove == solver.replayArray.length) {
            document.getElementById("rightArrow").style.opacity = "0.5"
            document.getElementById("rightArrow").setAttribute("onclick", "")
        }
        
        // get the relevant tiles for adjusting below
        let table = document.getElementById("boardTable")

        if (direction == 1) {
            // if going forwards, then...
            // handle the oldGuess
            if (oldGuess) {
                if (oldGuess.sourceTile) {
                    let source;
                    source = table.children[oldGuess.sourceTile.y - 1].children[oldGuess.sourceTile.x - 1]
                    source.style.backgroundColor = "rgba(0, 0, 255, 0.3)"
                }
                if (oldGuess.actionTaken == "addFlag") {
                    let action = table.children[oldGuess.actionTile.y - 1].children[oldGuess.actionTile.x - 1]
                    if (oldGuess.actionTile.x == solver.errorTile.getAttribute("x") && 
                        oldGuess.actionTile.y == solver.errorTile.getAttribute("y")) {
                        action.style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                    }
                    else {
                        // Display a flag in the square
                        let flag = document.createElement("img")
                        flag.src = "./img/flag.png"
                        flag.setAttribute("class", "flag")
                        flag.style = "height: 100%; width: auto;"
                        action.append(flag)
                        
                        // reset the background color
                        action.style.backgroundColor = ""
                    }
                }
                else {
                    // mark the tile as safe
                    let action = table.children[oldGuess.actionTile.y - 1].children[oldGuess.actionTile.x - 1]
                    action.style.backgroundColor = "rgba(0, 0, 255, 0.3)"

                    // get its mineNeighbours and add this to the tile's text
                    if (oldGuess.actionTile.mineNeighbours > 0) {
                        action.textContent = `${oldGuess.actionTile.mineNeighbours}`
                    }
                }
            }
            // handle the newGuess
            if (newGuess) {
                let source 
                if (newGuess.sourceTile) {
                    source = table.children[newGuess.sourceTile.y - 1].children[newGuess.sourceTile.x - 1]
                    source.style.backgroundColor = "rgba(0, 200, 0, 1.0)"
                }
                let action = table.children[newGuess.actionTile.y - 1].children[newGuess.actionTile.x - 1]
                action.style.backgroundColor = "rgba(0, 200, 0, 0.3)"
            }
        }
        else {
            // if going backwards, then...
            if (oldGuess) {
                // mark the source tile as revealed
                if (oldGuess.sourceTile) {
                    let source = table.children[oldGuess.sourceTile.y - 1].children[oldGuess.sourceTile.x - 1]
                    source.style.backgroundColor = "rgba(0, 0, 255, 0.3)"
                    
                }
                // mark the action tile as unknown
                let action = table.children[oldGuess.actionTile.y - 1].children[oldGuess.actionTile.x - 1]
                action.style.backgroundColor = ""
            }

            // handle the newGuess
            if (newGuess) {
                let source;
                if (newGuess.sourceTile) {
                    source = table.children[newGuess.sourceTile.y - 1].children[newGuess.sourceTile.x - 1]
                    source.style.backgroundColor = "rgba(0, 200, 0, 1.0)"
                }
                let action = table.children[newGuess.actionTile.y - 1].children[newGuess.actionTile.x - 1]
                action.style.backgroundColor = "rgba(0, 200, 0, 0.3)"
                
                // remove the flag from the tile you're going back to, if one was added
                if (newGuess.actionTaken == "addFlag") {
                    if (newGuess.actionTile.x == solver.errorTile.getAttribute("x") &&
                        newGuess.actionTile.y == solver.errorTile.getAttribute("y")) {
                        // do nothing
                    }
                    else {
                        let removeFlag = action.children[1]
                        removeFlag.parentElement.removeChild(removeFlag)
                    }
                }
                else {
                    action.textContent = ""
                }
            }
                    
        }   

        // change text above board to reflect the reason for each guess
        let replayText = document.getElementById("replayText")

        if (newGuess) {
            if (newGuess.reason == "simpleFlag") {
                replayText.innerHTML = `All of the unknown neighbours around tile (${newGuess.sourceTile.x} , `
                    + `${newGuess.sourceTile.y}) must be mines. 
                    Therefore tile (${newGuess.actionTile.x} , ${newGuess.actionTile.y}) must be a mine.`
            } else if (newGuess.reason == "simpleSafe") {
                replayText.innerHTML = `All of the unknown neighbours around tile (${newGuess.sourceTile.x} , `
                    + `${newGuess.sourceTile.y}) must be safe. 
                    Therefore tile (${newGuess.actionTile.x} , ${newGuess.actionTile.y}) must be safe.`
            } else if (newGuess.reason == "complexFlag") {
                replayText.innerHTML = `In all possible configurations of potential mines around border tiles,
                    tile (${newGuess.actionTile.x} , ${newGuess.actionTile.y}) is always a mine.`
            } else if (newGuess.reason == "complexSafe") {
                replayText.innerHTML = `In all possible configurations of potential mines around border tiles,
                    tile (${newGuess.actionTile.x} , ${newGuess.actionTile.y}) is always safe.`
            }
        }
        else {
            replayText.innerHTML = `This is all that the solver deduced before deciding
            that the chosen tile contained a mine.`
        }

        // change text to reflect the tiles solved
        let countText = document.getElementById("tilesSolved")
        if (solver.currentMove == -1) {
            countText.innerHTML = "Tiles Solved: 0"
            replayText.innerHTML = "Game state before solver begins"
        }
        else {
            countText.innerHTML = "Tiles Solved: " + solver.currentMove
        }
    }
}

// pseudo for the hint system

/*
    There will be a 'use hint' button, which will toggle a property in the currentGame object
    to either true or false (i.e. on or off). 

    Presuming that the player has pressed the hint button, then
    they have clicked on a tile, this calls mineTest on that tile as normal. 

    Here is where the hint property check will be. 
    If the tile is deemed absolutely safe (no childNodes, basically), then the tile will show 0% in it, 
    to represent the mine probability. 

    If it contains a flag, the click won't be recognised anyway.

    If, however, it is a mine in the current config, the solver will run.
    If at any stage of the solver (easy/complex) the program determines that the chosen tile
    must be safe or must be a mine, it will check the hint property
    and if it's true, it will make the probability appear in the tile and end the solver.

    If, however, it is some probability between 0-100% (calculated by averaging the number of times
    it appears to be a mine from the result array from solveBoardProbs), then this probability
    will be calculated at the end of solveBoardProbs as long as the chosen tile is in that config. 
    This probability will then be displayed within the tile for the user to see. 
    
    At the end of mineTest, we will set the global hint property to false again, so that
    once the solver has run (if it needs to) the hint system is turned off for the next click. 

    We will need to temporarily store the hint tile in the global currentGame obj
    so that, when the user makes a new choice with left click, the probability is removed as
    the board may change after their click.
*/