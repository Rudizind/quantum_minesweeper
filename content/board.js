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
            newCell.style.minHeight = "30px"
            newCell.style.minWidth = "30px"

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
        if (square.childNodes.length > 0) {
            // If left click
            if (click == "left") {
                // If there's a flag in the square, do nothing.
                if (square.childNodes.length == 2) {
                    return false;
                }
                // Otherwise, they've made a mistake and might have lost the game. 
                // The solver from solver.js will run, and find out whether 
                // this error could have been avoided without guessing. 
                // If it could have been avoided, the user loses. 
                // If it was completely impossible to know without guessing, 
                // the board will change such that the chosen square does NOT contain a mine. 
                else if (square.childNodes[0].getAttribute("class") == "mine") {
                    resolveBoard(square)
                }
            }
            // If right click
            else if (click == "right") {
                // If mine and flag present, remove flag
                if (square.childNodes.length == 2) {
                    // increase mine count by 1
                    currentGame.flagsPlaced--

                    // remove the flag
                    square.childNodes[1].parentElement.removeChild(square.childNodes[1])
                }
                // If only flag present, remove flag
                else if (square.childNodes[0].getAttribute("class") == "flag") {
                    // increase mine count by 1
                    currentGame.flagsPlaced--

                    square.childNodes[0].parentElement.removeChild(square.childNodes[0])
                }
                // If only mine present, add flag
                else {
                    // Reduce minecount by 1
                    currentGame.flagsPlaced++

                    // Display a flag in the square
                    let flag = document.createElement("img")
                    flag.src = "./img/flag.png"
                    flag.setAttribute("class", "flag")
                    flag.style = "height: 100%; width: auto;"
                    square.append(flag)

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
                flag.style = "height: 100%; width: auto;"
                square.append(flag)

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
                            if (cell.childNodes.length != 0) {
                                if (cell.textContent == "") {
                                    if (cell.childNodes[0].getAttribute("class") == "mine") {
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
                    if (element.childNodes.length == 0) {
                        mine.addEventListener("mouseup", squareChoice)
                        element.append(mine)
                    }
                    else if (element.childNodes[0].getAttribute("class") == "flag") {
                        element.insertBefore(mine, element.childNodes[0]) 
                    }
                }
                
            } else if (!match.isMine) {
                if (element.children.length > 0) {
                    if (element.children[0].getAttribute("class") == "mine") {
                        let mineRemove = element.children[0]
                        element.removeChild(mineRemove)
                        element.style.backgroundColor = ""
        
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
            for (let i = 0; i < totalDiff; i++) {
                allMines.forEach(square => {
                    if (minesToRemove.length == totalDiff) {
                        return;
                    }
                    else if (square.parentElement.childNodes.length == 1) {
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
                            minesToRemove.push(square)
                        }
                    }
                })
            }
            minesToRemove.forEach(item => {
                let mine = item.childNodes[0]
                item.removeChild(mine)
            })
        }
    }
    checkMineCount()

    square.style = "background-color: rgb(150, 150, 150);"
    square.revealed = true;

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
                if (cell.childNodes.length != 0) {
                    if (cell.textContent == "") {
                        if (cell.childNodes[0].getAttribute("class") == "mine") {
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