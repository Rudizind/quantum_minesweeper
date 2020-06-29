const makeBoard = () => {
    // Get table
    let table = document.getElementById("boardTable")
    
    // Set the squares that are going to be mines.
    let mineSquares = []
    for (m=1;m<=currentGame.startMines;m++) {
        const chooseNum = () => {
            let newChoice = Math.ceil(Math.random() * 480)
            mineSquares.includes(newChoice) ? chooseNum() : mineSquares.push(newChoice)
        }
        chooseNum()
    }

    mineSquares.sort((a, b) => a-b)

    // Initialise the cell count (for matching chosen numbers in mineSquares array above)
    cellCount = 1;

    // Determine the dimensions of the board depending on the boardSize
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

    // Populate the board
    // For now the board will be the size of a standard expert level board (30L x 16H / 480 squares / 99 mines)
    // This will be the number for y (rows of the table)
    for (i=0;i<boardheight;i++) {
        let newRow = document.createElement("tr")
        // This will be the number for x (columns of the table / cells of a row)
        for (j=0;j<boardwidth;j++) {
            let newCell = document.createElement("td")
            if (mineSquares.includes(cellCount)) {
                let mine = document.createElement("img")
                mine.setAttribute("class", "mine")
                mine.src = "./img/mine.png"
                mine.style = "height: 100%; width: auto; display: none;"
                mine.addEventListener("mouseup", squareChoice)
                newCell.append(mine);
                newCell.style.backgroundColor = "rgba(120, 120, 0, 0.3)"
            }
            cellCount++

            // Assign the cell's x and y values (for doing adjacency checks)
            // x is left to right
            // y is top to bottom
            newCell.setAttribute("x", j + 1)
            newCell.setAttribute("y", i + 1)

            // Assign the default 'revealed' boolean to false for the cell. 
            newCell.revealed = false;

            // Remove default popup menu for right click on the gameboard
            newCell.setAttribute("oncontextmenu", "event.preventDefault()")

            // Set the mouseevent for detecting which mouse button has been clicked.
            // It uses mouseup instead of mousedown so that a user can change their mind about a choice by moving their mouse away.
            newCell.addEventListener("mouseup", squareChoice)

            // Set ID for CSS styling of the squares
            newCell.setAttribute("class", "mineSquare")

            newRow.append(newCell)
        }
        table.append(newRow)
    }
}

// click event handler - checks which mouse button was clicked as well as which mineSquare was chosen.
const squareChoice = e => {
    let click;
    let square;

    // Assign the mouse button choice to the click variable.
    e.button == 0 ? click = "left" :
    e.button == 2 ? click = "right" : console.log("invalid click")
    
    // If the user has clicked on the invisible mine, then the parent node must be chosen instead of the mine for the following code to work.
    square = (e.target.getAttribute("class") == "mine" || e.target.getAttribute("class") == "flag") ? e.target.parentElement : e.target

    // Only pass the event choices through the mineTest if they're a valid choice.
    if (square.getAttribute("class") == "mineSquare") {
        console.log("fail")
        mineTest(square, click)
    }
}

// Called from the click event handler squareChoice()
const mineTest = (square, click) => {
    if (square.revealed == true) {
        return;
    }
    else {
        // If either a mine or flag is present (or both)
        if (square.childNodes.length > 0) {
            // If left click
            if (click == "left") {
                // If there's a flag in the square, do nothing.
                if (square.childNodes.length == 2) {
                    return;
                }
                // Otherwise, they've made a mistake and might have lost the game. 
                // The solver from solver.js will run, and find out whether this error could have been avoided without guessing. 
                // If it could have been avoided, the user loses. If it was completely impossible to know without guessing, the board will change.
                // It will change to a board state such that the chosen square does NOT contain a mine. 
                else if (square.childNodes[0].getAttribute("class") == "mine") {
                    console.log("this is successful calling of solver")
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
                document.getElementById("scoreDisplay").innerHTML = "Mines left: " + (currentGame.startMines - currentGame.flagsPlaced)
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
                document.getElementById("scoreDisplay").innerHTML = "Mines left: " + (currentGame.startMines - currentGame.flagsPlaced)
            }
            // If empty, and left click, run the adjacency checks until an endpoint is reached. 
            else if (click == "left") {
                // Make the chosen square 'safe'
                console.log("this is to mark a square as safe")
                square.style = "background-color: rgba(0, 0, 255, 0.3);"
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
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) || 
                            // -1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // -1 / 1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // 0 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) && cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // 0 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) && cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                            // +1 / -1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                            // +1 / 0
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                            // +1 / +1
                            (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) 
                        ) {
                            squareNeighbours.push(cell)
                            if (cell.childNodes.length != 0) {
                                if (cell.textContent == "") {
                                    if (cell.childNodes[0].getAttribute("class") == "mine") {
                                        mineCount++
                                    }
                                }
                            }
                        }
                        else if ((Number(cell.getAttribute("y")) - 1) > square.getAttribute("y")) {
                            return;
                        }
                    })
                })
                if (mineCount == 0) {
                    squareNeighbours.forEach(node => {
                        square.revealed = true;
                        mineTest(node, "left")
                    })
                }
                else {
                    square.innerHTML = `${mineCount}`
                }
                
            }
        }
    }
}

const resolveBoard = square => {
    let changeTiles = solver.test(square)
    let board = document.querySelectorAll(".mineSquare")
    console.log(board)
    changeTiles.forEach(tile => {
        let match
        board.forEach(element => {
            if (element.getAttribute("x") == tile.x && element.getAttribute("y") == tile.y) {
                match = element;
                return;
            }
        });
        if (tile.isMine == true) {
            let mine = document.createElement("img")
            mine.setAttribute("class", "mine")
            mine.src = "./img/mine.png"
            mine.style = "height: 100%; width: auto; display: none;"
            mine.addEventListener("mouseup", squareChoice)
            match.style.backgroundColor = "rgba(120, 120, 0, 0.3)"
            match.append(mine)
        }
        else {
            let mineRemove = match.childNodes[0]
            console.log(mineRemove)
            match.removeChild(mineRemove)
            match.style.backgroundColor = ""
        }
    })

    square.style = "background-color: rgba(0, 0, 255, 0.3);"
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
                (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) || 
                // -1 / 0
                (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                // -1 / 1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) - 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                // 0 / -1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) && cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                // 0 / +1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) && cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) ||
                // +1 / -1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) - 1) ||
                // +1 / 0
                (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(square.getAttribute("y"))) ||
                // +1 / +1
                (cell.getAttribute("x") == Number(square.getAttribute("x")) + 1 && cell.getAttribute("y") == Number(square.getAttribute("y")) + 1) 
            ) {
                squareNeighbours.push(cell)
                if (cell.childNodes.length != 0) {
                    if (cell.textContent == "") {
                        if (cell.childNodes[0].getAttribute("class") == "mine") {
                            mineCount++
                        }
                    }
                }
            }
            else if ((Number(cell.getAttribute("y")) - 1) > square.getAttribute("y")) {
                return;
            }
        })
    })
    if (mineCount == 0) {
        squareNeighbours.forEach(node => {
            square.revealed = true;
            mineTest(node, "left")
        })
    }
    else {
        square.innerHTML = `${mineCount}`
    }
}
