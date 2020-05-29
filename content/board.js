const makeBoard = () => {
    // Get table
    let table = document.getElementById("boardTable")
    
    // Set the squares that are going to be mines.
    let mineSquares = []
    for (m=1;m<=currentGame.startMines;m++) {
        const chooseNum = () => {
            let newChoice = Math.ceil(Math.random() * 480)
            console.log(newChoice)
            mineSquares.includes(newChoice) ? chooseNum() : mineSquares.push(newChoice)
        }
        chooseNum()
    }

    mineSquares.sort((a, b) => a-b)
    console.log(mineSquares)

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

    console.log(boardwidth, ", ", boardheight)

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
        mineTest(square, click)
    }
}

// Called from the click event handler squareChoice()
const mineTest = (square, click) => {
    if (square.revealed == true) {
        console.log("bleh")
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
                // Otherwise, they've made a mistake and lost the game. The board is revealed with all mines.
                else if (square.childNodes[0].getAttribute("class") == "mine") {
                    // Make mines visible and colour their squares appropriately
                    let mineNodes = document.querySelectorAll(".mine")
                    mineNodes.forEach(node => {
                        // Display all mines
                        node.style.display = "inline"
                        // if there was a mine and the user had marked it, the mine is shown with orange (i.e. deactivated).
                        if (node.parentElement.childNodes.length == 2) {
                            node.parentElement.style.backgroundColor = "orange"
                        }
                        // otherwise it is shown with red to show it was not flagged.
                        else {
                            node.parentElement.style.backgroundColor = "red"
                        }

                        // Remove the event listener from mines
                        node.removeEventListener("mouseup", squareChoice)
                    })

                    // Remove flags and replace them with crosses if they were wrong guesses at mines
                    let flagNodes = document.querySelectorAll(".flag")
                    flagNodes.forEach(node => {
                        let parent = node.parentElement

                        // If a flag was NOT correctly placed:
                        if (parent.childNodes.length != 2) {
                            let cross = document.createElement("img")
                            cross.setAttribute("class", "cross")
                            cross.src = "./img/x.png"
                            cross.style = "height: 100%; width: auto;"
                            parent.appendChild(cross);
                        } // otherwise it's handled above
                        
                        parent.removeChild(node)
                        parent.style.backgroundColor = "orange"
                    })

                    // Remove the click event listener from all squares.
                    let allSquares = document.querySelectorAll(".mineSquare")
                    allSquares.forEach(node => {
                        node.removeEventListener("mouseup", squareChoice)
                    })

                    // Remove the mine count
                    document.getElementById("scoreDisplay").innerHTML = "Mines left: :("

                    // Signify to the backHome button that the game is no longer active so it doesn't have to confirm().
                    currentGame.active = false;
                    
                    // Stop the timer
                    currentGame.timerStop()
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
                square.style = "background-color: rgba(0, 0, 255, 0.3);"
                square.revealed = true;

                console.log(square)

                // Check if any mines around the chosen square
                // Nest for loops to test all 8 squares around
                let mineCount = 0

                // For consistency with above, i will cover y and j will cover x
                console.log(mineCount)

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
                            console.log(cell)
                            squareNeighbours.push(cell)
                            if (cell.childNodes.length != 0) {
                                console.log(cell.childNodes)
                                if (cell.textContent == "") {
                                    if (cell.childNodes[0].getAttribute("class") == "mine") {
                                        mineCount++
                                        console.log("hey ho")
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
                    console.log(squareNeighbours)
                    squareNeighbours.forEach(node => {
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

// end game:
//       - mine count is NaN
        // - interval is not being removed properly.