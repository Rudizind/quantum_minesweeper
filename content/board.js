const makeBoard = () => {
    // Get table
    let table = document.getElementById("boardTable")

    // Set the squares that are going to be mines.
    let mineSquares = []
    let totalTiles = currentGame.boardSize == 'xl' ? 480 :
                     currentGame.boardSize == 'l' ? 240 :
                     currentGame.boardSize == 'm' ? 117 :
                     currentGame.boardSize == 's' ? 56 :
                     currentGame.boardSize == 'xs' ? 25 : 117

    for (let m = 1; m <= currentGame.startMines; m++) {
        const chooseNum = () => {
            let newChoice = Math.ceil(Math.random() * totalTiles)
            mineSquares.includes(newChoice) ? chooseNum() : mineSquares.push(newChoice)
        }
        chooseNum()
    }

    if (isBrowser()) {  
        // test totalTiles
        let counts = [25, 56, 117, 240, 480]
        assert.oneOf(totalTiles, counts, 
            `totalTiles should be only one of the designated 5 counts`)

        // test mineSquares
        assert.equal(mineSquares.length, currentGame.startMines, `there should only 
            be mines equal to the designated start mines`);

        const checkIfArrayIsUnique = myArray => {
            return myArray.length === new Set(myArray).size;
        }
        assert.isTrue(checkIfArrayIsUnique(mineSquares), `mineSquares should only contain
            unique elements`)
    }
    else {
        describe('totalTiles', () => {
            it('should only be one of the five designated counts', () => {   
                let counts = [25, 56, 117, 240, 480]
                assert.oneOf(totalTiles, counts, 
                    `totalTiles should be only one of the designated 5 counts`)
            })
        })

        describe('mineSquares', () => {
            it('should only contain mines equal to the designated starting mines', () => {
                assert.equal(mineSquares.length, currentGame.startMines, `there should only 
                    be mines equal to the designated start mines`);
            })
            it('should contain only unique elements', () => {
                const checkIfArrayIsUnique = myArray => {
                    return myArray.length === new Set(myArray).size;
                }
                assert.isTrue(checkIfArrayIsUnique(mineSquares), `mineSquares should only contain
                    unique elements`)
            })
        })
    }

    mineSquares.sort((a, b) => a - b)

    // Initialise the cell count (for matching chosen numbers in mineSquares array above)
    let cellCount = 1;

    // Determine the dimensions of the board depending on the boardSize
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

    if (isBrowser()) {
        let widths = [5, 8, 13, 20, 30]
        assert.oneOf(boardwidth, widths, `boardwidth should only be one of the five
            designated widths`)

        let heights = [5, 7, 9, 12, 16]
        assert.oneOf(boardheight, heights, `boardheight should only be one of the five
            designated heights`)
    }
    else {
        describe('boardwidth', () => {
            it('should only be one of the five designated widths', () => {
                let widths = [5, 8, 13, 20, 30]
                assert.oneOf(boardwidth, widths, `boardwidth should only be one of the five
                    designated widths`)
            })
        })

        describe('boardheight', () => {
            it('should only be one of the five designated heights', () => {
                let heights = [5, 7, 9, 12, 16]
                assert.oneOf(boardheight, heights, `boardheight should only be one of the five
                    designated heights`)
            })
        })
    }
    
    // set the size of the board
    table.style = `height: auto; width: auto; margin-left: auto; margin-right: auto;`

    // Populate the board
    // For now the board will be the size of a standard expert level board: 
    // (30L x 16H / 480 squares / 99 mines)
    // This will be the number for y (rows of the table)
    for (let i = 0; i < boardheight; i++) {
        let newRow = document.createElement("tr")
        // This will be the number for x (columns of the table / cells of a row)
        for (let j = 0; j < boardwidth; j++) {
            let newCell = document.createElement("td")
            if (mineSquares.includes(cellCount)) {
                let mine = document.createElement("img")
                mine.setAttribute("class", "mine")
                mine.src = "./img/mine.png"
                mine.style = "height: 100%; width: auto; display: none;"
                mine.addEventListener("mouseup", squareChoice)
                if (currentGame.mineVision) {
                    newCell.style.backgroundColor = "rgba(200, 20, 0, 0.6)"
                }
                newCell.append(mine);
            }
            cellCount++

            // Assign the cell's x and y values (for doing adjacency checks)
            // x is left to right
            // y is top to bottom
            newCell.setAttribute("x", j + 1)
            newCell.setAttribute("y", i + 1)

            // set the max height and width of the squares
            newCell.style.height = "30px"
            newCell.style.width = "30px"

            // Assign the default 'revealed' boolean to false for the cell. 
            newCell.revealed = false;

            // Remove default popup menu for right click on the gameboard
            newCell.setAttribute("oncontextmenu", "event.preventDefault()")

            // Set the mouseevent for detecting which mouse button has been clicked.
            // It uses mouseup instead of mousedown so that a user can change their 
            // mind about a choice by moving their mouse away.
            newCell.addEventListener("mouseup", squareChoice)

            // Set ID for CSS styling of the squares
            newCell.setAttribute("class", "mineSquare")

            newRow.append(newCell)
        }
        table.append(newRow)
    }
}

const setNeighbours = (newBoard) => {
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

    newBoard.forEach(row => {
        row.forEach(tile => {
            let neighbours = []

            // get the neighbours around the current tile to store in allMineNeighbours
            // note that corner and border tiles have exceptions in the condition so that
            // corners only have 3 neighbours, side borders have 5, and every other tile has 8.
            for (let y = tile.y - 2; y <= tile.y; y++) {
                for (let x = tile.x - 2; x <= tile.x; x++) {
                    if (x >= 0 && x < boardwidth && y >= 0 && y < boardheight && tile != newBoard[y]
                        [x]) {
                        neighbours.push(newBoard[y][x])
                    }
                }
            }

            let newObj = {
                x: tile.x,
                y: tile.y,
                neighbours: neighbours
            }

            allMineNeighbours.push(newObj)
        })

    })
}

// click event handler - checks which mouse button was clicked as well as which mineSquare was chosen.
const squareChoice = e => {
    let click;
    let square;

    // Assign the mouse button choice to the click variable.
    e.button == 0 ? click = "left" :
        e.button == 2 ? click = "right" : false

    // If the user has clicked on the invisible mine, then the parent node 
    // must be chosen instead of the mine for the following code to work.
    square = (e.target.getAttribute("class") == "mine" || e.target.getAttribute("class") == "flag") ?
        e.target.parentElement : e.target

    // if a hint is currently being displayed, 
    // remove it now as the information is no longer relevant
    if (currentGame.currentHint != null) {
        currentGame.currentHint.style.boxShadow = ""
        currentGame.currentHint = null;
    }

    // Only pass the event choices through the mineTest if they're a valid choice.
    if (square.getAttribute("class") == "mineSquare") {
        mineTest(square, click)
    }
}

// Called from the click event handler squareChoice()
const mineTest = (square, click) => {
    if (square.revealed || (click == "right" && currentGame.hint)) {
        return false;
    } else {
        // If either a mine or flag is present (or both)
        if (square.children.length > 0) {
            // If left click
            if (click == "left") {
                // If there's a flag in the square, do nothing.
                if (square.children.length == 2) {
                    return false;
                }
                // Otherwise, they've made a mistake and might have lost the game. 
                // The solver from solver.js will run, and find out whether 
                // this error could have been avoided without guessing. 
                // If it could have been avoided, the user loses. 
                // If it was completely impossible to know without guessing, 
                // the board will change such that the chosen square does NOT contain a mine. 
                else if (square.children[0].getAttribute("class") == "mine") {
                    resolveBoard(square)
                }
            }
            // If right click
            else if (click == "right") {
                // If mine and flag present, remove flag
                if (square.children.length == 2) {
                    // increase mine count by 1
                    currentGame.flagsPlaced--

                    // remove the flag
                    square.children[1].parentElement.removeChild(square.children[1])
                }
                // If only flag present, remove flag
                else if (square.children[0].getAttribute("class") == "flag") {
                    // increase mine count by 1
                    currentGame.flagsPlaced--

                    square.children[0].parentElement.removeChild(square.children[0])
                }
                // If only mine present, add flag
                else {
                    // Reduce minecount by 1
                    currentGame.flagsPlaced++

                    // Display a flag in the square
                    let flag = document.createElement("img")
                    flag.src = "./img/flag.png"
                    flag.setAttribute("class", "flag")
                    flag.style = "height: 27px; width: 27px;"
                    square.append(flag)

                    if (isBrowser()) {
                        assert.equal(square.children.length, 2, `there should be two
                            children present - a mine and a flag`);
                        assert.equal(square.children[1].getAttribute("class"), "flag",
                            `the second childNode should be a flag`)
                    }
                    else {
                        describe('mineTest(tile, "right") - 1', () => {
                            it('should append a flag to the tile', () => {
                                assert.equal(square.children.length, 2, `there should be two
                                    children present - a mine and a flag`);
                                assert.equal(square.children[1].getAttribute("class"), "flag",
                                    `the second childNode should be a flag`)
                            })
                        })
                    }

                    // end game test
                    if (currentGame.flagsPlaced == currentGame.startMines) {
                        winGame()
                    }
                }

                // Set remaining mines in UI
                document.getElementById("scoreDisplay").innerHTML = "Mines left: " +
                    (currentGame.startMines - currentGame.flagsPlaced)
            }
        }
        // If no child nodes of chosen square present
        else {
            // If empty, and right click, place a flag inside.
            if (click == "right") {
                // Reduce minecount by 1
                currentGame.flagsPlaced++

                // Display a flag in the square
                let flag = document.createElement("img")
                flag.src = "./img/flag.png"
                flag.setAttribute("class", "flag")
                flag.style = "height: 27px; width: 27px;"
                square.append(flag)

                if (isBrowser()) {
                    assert.equal(square.children.length, 1, `there should be one
                        childNode present`);
                    assert.equal(square.children[0].getAttribute("class"), "flag",
                        `the childNode should be a flag`)
                }
                else {
                    describe('mineTest(tile, "right") - 2', () => {
                        it('should append a flag to the tile', () => {
                            assert.equal(square.children.length, 1, `there should be one
                                childNode present`);
                            assert.equal(square.children[0].getAttribute("class"), "flag",
                                `the childNode should be a flag`)
                        })
                    })
                }

                // Set remaining mines in UI
                document.getElementById("scoreDisplay").innerHTML = "Mines left: " +
                    (currentGame.startMines - currentGame.flagsPlaced)
            }
            // If empty, and left click, run the adjacency checks until an endpoint is reached. 
            else if (click == "left") {
                if (currentGame.hint) {
                    resolveBoard(square)
                    return;
                }
                // Make the chosen square 'safe'
                square.style = "background-color: rgb(150, 150, 150);"
                square.revealed = true;

                if (isBrowser()) {
                    assert.equal(square.style.backgroundColor, "rgb(150, 150, 150)", `The tile's
                        background color should be set to rgb(150, 150, 150)`);
                    assert.isTrue(square.revealed, `square.revealed should be set to true`);
                }
                else {
                    describe('mineTest(tile, "left" - safe tile', () => {
                        it(`should set the tile's background color to rgb(150, 150, 150)`, () => {
                            assert.equal(square.style.backgroundColor, "rgb(150, 150, 150)", `The tile's
                                background color should be set to rgb(150, 150, 150)`);
                        })
                        it('should set tile.revealed to true', () => {
                            assert.isTrue(square.revealed, `square.revealed should be set to true`);
                        })
                    })
                }

                // Check if any mines around the chosen square
                // Nest for loops to test all 8 squares around
                let mineCount = 0

                // For consistency with above, i will cover y and j will cover x

                // array for storing chosen square's up to 8 neighbour squares
                let squareNeighbours = [];

                let table = document.getElementById("boardTable")
                table.childNodes.forEach(row => {
                    row.childNodes.forEach(cell => {
                        // The code for this is rather convoluted, but is necessary in this case
                        // because DOM elements aren't handled as easily as the version in the model,
                        // which can be done with much simpler loops.
                        if (
                            // -1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // -1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // -1 / 1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // 0 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // 0 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // +1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // +1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // +1 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1)
                        ) {
                            squareNeighbours.push(cell)
                            if (cell.children.length != 0) {
                                if (cell.textContent == "") {
                                    if (cell.children[0].getAttribute("class") == "mine") {
                                        mineCount++
                                    }
                                }
                            }
                        } else if ((Number(cell.getAttribute("y")) - 1) > square.getAttribute(
                            "y")) {
                            return;
                        }
                    })
                })
                if (mineCount == 0) {
                    squareNeighbours.forEach(node => {
                        square.revealed = true;
                        mineTest(node, "left")
                    })
                } else {
                    let colour = getTextColor(mineCount)
                    square.style.color = colour
                    square.innerHTML = `${mineCount}`
                }
            }
        }
    }
}

// Takes an input number between 1 and 8, and returns the corresponding colour. 
const getTextColor = num => {
    let colour = num == 1 ? "rgba(0, 0, 200, 1)" :
                 num == 2 ? "rgba(0, 100, 0, 1)" :
                 num == 3 ? "rgba(200, 0, 0, 1)" :
                 num == 4 ? "rgba(0, 0, 120, 1)" :
                 num == 5 ? "rgba(128, 0, 0, 1)" :
                 num == 6 ? "rgba(64, 224, 208, 1)" :
                 num == 7 ? "rgba(0, 0, 0, 1)" : 
                 num == 8 ? "rgba(50, 50, 50, 1)" : null

    return colour
}

const resolveBoard = square => {
    // if a hint is currently being used, the solver will be called but 
    if (currentGame.hint) {
        // run the solver with hint parameter active
        let percentChance = solver.test(square)
        
        // if the tile is definitely a mine, it gets a red border
        if (percentChance == 100) {
            square.style.boxShadow = "0px 0px 0px 5px red inset"
        }
        // if the tile is definitely safe, it gets a green border
        else if (percentChance == 0) {
            square.style.boxShadow = "0px 0px 0px 5px green inset"
        }
        // if the solver isn't able to even reach that tile or can't determine if it's a mine,
        // it gets a yellow border
        else {
            square.style.boxShadow = "0px 0px 0px 5px yellow inset"
        }
        // keep a record of the tile currently being shown as a hint
        currentGame.currentHint = square
        currentGame.hint = false
        document.getElementById("hintButt").style.backgroundColor = ""
        return;
    }
    // if not using hints, then the standard solver method is called
    let changeTiles = solver.test(square)

    // if the solver returns undefined, then the game is over, so just return
    if (changeTiles == undefined) {
        return;
    }

    // otherwise, change the board (and update stats)
    // stat update for times saved by solver
    if (isBrowser()) {
        updateStats([{ type: "save", num: 1, id: Math.round(Math.random() * 99999999999999) }])
    }

    let allFlags = document.querySelectorAll('.flag')
    let startFlagCount = allFlags.length

    let board = document.querySelectorAll(".mineSquare")
    board.forEach(element => {
        let match = changeTiles.find(item => item.x == Number(element.getAttribute("x")) &&
            item.y == Number(element.getAttribute("y")))
        if (match != undefined) {
            if (match.isMine) {
                let addMine = false;
                if (element.children.length  == 0) {
                    addMine = true;
                }
                else if (element.children[0].getAttribute("class") == "flag") {
                    addMine = true;
                }
                
                if (addMine) {
                    let mine = document.createElement("img")
                    mine.setAttribute("class", "mine")
                    mine.src = "./img/mine.png"
                    mine.style = "height: 100%; width: auto; display: none;"
                    if (currentGame.mineVision) {
                        element.style.backgroundColor = "rgba(200, 20, 0, 0.6)"
                    }
                    if (element.children.length == 0) {
                        mine.addEventListener("mouseup", squareChoice)
                        element.append(mine)
                    }
                    else if (element.children[0].getAttribute("class") == "flag") {
                        element.insertBefore(mine, element.children[0]) 
                    }
                    // mocha/chai tests for board manipulation here
                    if (isBrowser()) {
                        if (currentGame.mineVision) {
                            assert.equal(element.style.backgroundColor, "rgba(200, 20, 0, 0.6)", 
                                "if mineVision is active, any new mine tiles should change colour");
                        }
                        assert.equal(element.children[0].getAttribute("class"), "mine", 
                            `a mine should be inserted as the first child of each new mine tile`);
                    }
                    else {
                        describe('board changes after solver concludes', () => {
                            it('should change the mine tiles colour if mineVision is active', () => {
                                if (currentGame.mineVision) {
                                    assert.equal(element.style.backgroundColor, "rgba(200, 20, 0, 0.6)", 
                                        "if mineVision is active, any new mine tiles should change colour");
                                }
                            })
                            it('should insert a mine as the first childNode of new mine nodes', () => {
                                assert.equal(element.children[0].getAttribute("class"), "mine", 
                                    `a mine should be inserted as the first child of each new mine tile`);
                            })
                        })
                    }
                }
                
            } else if (!match.isMine) {
                if (element.children.length > 0) {
                    if (element.children[0].getAttribute("class") == "mine") {
                        let mineRemove = element.children[0]
                        element.removeChild(mineRemove)
                        element.style.backgroundColor = ""
        
                        if (!isBrowser()) {
                            it('should have removed any mines for new safe nodes', () => {    
                                assert.equal(element.children.length, 0, `there should be no children remaining 
                                    for new safe nodes`);
                            })
                            it('should set the background color back to "" for new safe nodes', () => {
                                assert.equal(element.style.backgroundColor, "", `the tile's background colour should
                                    be set back to the default`)
                            })
                        }
                    }
                }
            }
        }
        else {
            
        }
        return;
    });

    const checkMineCount = () => {
        let allMines = document.querySelectorAll(".mine")
        if (allMines.length > currentGame.startMines) {
            let totalDiff = allMines.length - currentGame.startMines
            let minesToRemove = []
            let allTiles = document.querySelectorAll(".mineSquare")
            allMines.forEach(square => {
                if (minesToRemove.length == totalDiff) {
                    return;
                }
                else if (square.parentElement.children.length == 1) {
                    square = square.parentElement
                    let squareNeighbours = []
                    allTiles.forEach(cell => {
                        if (
                            // -1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // -1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // -1 / 1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // 0 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // 0 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // +1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // +1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // +1 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1)
                        ) {
                            squareNeighbours.push(cell)
                        }
                    })
                    let neighbourCheck = true;
                    squareNeighbours.forEach(item => {
                        if (item.revealed) {
                            neighbourCheck = false;
                        }
                    })
                    if (neighbourCheck) {
                        if (!minesToRemove.includes(item => item == square)) {
                            minesToRemove.push(square)
                        }
                    }
                }
            })
            
        
            // if the solver can't organise the mine changes in a way that works for the board, end the game
            if (minesToRemove.length < totalDiff) {
                endGame()
            }
            else {   
                minesToRemove.forEach(item => {
                    let mine = item.children[0]
                    item.removeChild(mine)
                })
            }
        }
        else if (allMines.length < currentGame.startMines) {
            let totalDiff = currentGame.startMines - allMines.length
            let minesToAdd = []
            let allTiles = document.querySelectorAll(".mineSquare")
            let safeTiles = []
            allTiles.forEach(tile => {
                if (tile.children.length > 0) {
                    if (tile.children[0].getAttribute("class") == "mine") {
                        // do nothing
                    }
                    else {
                        safeTiles.push(tile)
                    }
                }
                else {
                    safeTiles.push(tile)
                }
            })
            safeTiles.forEach(square => {
                if (minesToAdd.length == totalDiff) {
                    return;
                }
                else {
                    let squareNeighbours = []
                    allTiles.forEach(cell => {
                        if (
                            // -1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // -1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // -1 / 1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // 0 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // 0 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // +1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // +1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // +1 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                                cell.getAttribute("y") == Number(square.getAttribute("y")) + 1)
                        ) {
                            squareNeighbours.push(cell)
                        }
                    })
                    let neighbourCheck = true;
                    squareNeighbours.forEach(item => {
                        if (item.revealed) {
                            neighbourCheck = false;
                        }
                    })
                    if (neighbourCheck) {
                        if (!minesToAdd.includes(item => item == square)) {
                            minesToAdd.push(square)
                        }
                    }
                }
            })
        
            // if the solver can't organise the mine changes in a way that works for the board, end the game
            if (minesToAdd.length < totalDiff) {
                endGame()
            }
            else {
                minesToAdd.forEach(item => {
                    let mine = document.createElement("img")
                    mine.setAttribute("class", "mine")
                    mine.src = "./img/mine.png"
                    mine.style = "height: 100%; width: auto; display: none;"
                    mine.addEventListener("mouseup", squareChoice)
                    if (currentGame.mineVision) {
                        newCell.style.backgroundColor = "rgba(200, 20, 0, 0.6)"
                    }
                    item.append(mine);
                })
            }
        }
    }
    checkMineCount()

    if (!isBrowser()) {
        describe('mineCount after solver resolution', () => {
            it('should never exceed the number of startMines for the game', () => {
                let allMines = document.querySelectorAll(".mine")
                assert.equal(allMines.length, currentGame.startMines, `the number of mines in the board should
                    never exceed the number of starting mines in the game`);
            })
        })
    }

    square.style = "background-color: rgb(150, 150, 150);"
    square.revealed = true;

    if (isBrowser()) {
        assert.equal(square.style.backgroundColor, "rgb(150, 150, 150)", `it should set the 
            tile's background color to grey.`);
        assert.isTrue(square.revealed, `square.revealed should be set to true`);

        // also test the flagCount at this point
        let newFlagCount = document.querySelectorAll(".flag").length
        assert.equal(startFlagCount, newFlagCount, `the number of flags should not change
            after the solver has run`);
    }
    else {
        describe('UI changes to targetTile', () => {
            it(`should set the tile's background color to grey`, () => {
                assert.equal(square.style.backgroundColor, "rgb(150, 150, 150)", `it should set the 
                    tile's background color to grey.`);
            })
            it(`should set tile.revealed to true`, () => {
                assert.isTrue(square.revealed, `square.revealed should be set to true`);
            })
        })

        // also test the flagCount at this point
        describe('post-solver flag check', () => {
            it('should have the same mine count as before the solver ran', () => {
                let newFlagCount = document.querySelectorAll(".flag").length
                assert.equal(startFlagCount, newFlagCount, `the number of flags should not change
                    after the solver has run`);
            })
        })
    }

    // Check if any mines around the chosen square
    // Nest for loops to test all 8 squares around
    let mineCount = 0

    // For consistency with above, i will cover y and j will cover x

    // array for storing chosen square's up to 8 neighbour squares
    let squareNeighbours = [];

    // ignore the current cell
    let table = document.getElementById("boardTable")
    table.childNodes.forEach(row => {
        row.childNodes.forEach(cell => {
            if (
                // -1 / -1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                    cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                // -1 / 0
                (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                    cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                // -1 / 1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 &&
                    cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                // 0 / -1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                    cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                // 0 / +1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) &&
                    cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                // +1 / -1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                    cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                // +1 / 0
                (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                    cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                // +1 / +1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 &&
                    cell.getAttribute("y") == Number(square.getAttribute("y")) + 1)
            ) {
                squareNeighbours.push(cell)
                if (cell.children.length != 0) {
                    if (cell.textContent == "") {
                        if (cell.children[0].getAttribute("class") == "mine") {
                            mineCount++
                        }
                    }
                }
            } else if ((Number(cell.getAttribute("y")) - 1) > square.getAttribute("y")) {
                return;
            }
        })
    })
    if (mineCount == 0) {
        squareNeighbours.forEach(node => {
            square.revealed = true;
            mineTest(node, "left")
        })
    } else {
        let colour = getTextColor(mineCount)
        square.style.color = colour
        square.innerHTML = `${mineCount}`
    }
}

// export all variables (if in node environment)
if (!isBrowser()) {
    module.exports.makeBoard = makeBoard
    module.exports.setNeighbours = setNeighbours
    module.exports.squareChoice = squareChoice
    module.exports.mineTest = mineTest
    module.exports.getTextColor = getTextColor
    module.exports.resolveBoard = resolveBoard
}