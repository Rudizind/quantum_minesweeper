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
            newCell.x = j + 1
            newCell.y = i + 1

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

const squareChoice = e => {
    let click;
    let square;

    // Assign the mouse button choice to the click variable.
    e.button == 0 ? click = "left" :
    e.button == 2 ? click = "right" : console.log("invalid click")
    
    // If the user has clicked on the invisible mine, then the parent node must be chosen instead of the mine for the following code to work.
    square = (e.target.getAttribute("class") == "mine" || e.target.getAttribute("class") == "flag") ? e.target.parentElement : e.target

    console.log(square)

    if (square.getAttribute("class") == "mineSquare") {
        if (square.revealed == true) {
            return;
        }
        else {
            // If either a mine or flag is present (or both)
            if (square.childNodes.length != 0) {
                // If left click
                if (click == "left") {
                    // If there's a flag in the square, do nothing.
                    if (square.childNodes.length == 2 || square.childNodes[0].getAttribute("class") == "flag") {
                        return;
                    }
                    // Otherwise, they've made a mistake and lost the game. The board is revealed with all mines.
                    else {
                        let mineNodes = document.querySelectorAll(".mine")
                        mineNodes.forEach(node => {
                            node.style.display = "block"
                            node.parentElement.style.backgroundColor = "red"
                        })
                    }
                }
                // If right click
                else if (click == "right") {
                    // If mine and flag present, remove flag
                    if (square.childNodes.length == 2) {
                        // increase mine count by 1

                        // remove the flag
                        square.childNodes[1].parentElement.removeChild(square.childNodes[1])                
                    }
                    // If only flag present, remove flag
                    else if (square.childNodes[0].getAttribute("class") == "flag") {
                        square.childNodes[0].parentElement.removeChild(square.childNodes[0])
                    }
                    // If only mine present, add flag
                    else {
                        // Reduce minecount by 1

                        // Display a flag in the square
                        let flag = document.createElement("img")
                        flag.src = "./img/flag.png"
                        flag.setAttribute("class", "flag")
                        flag.style = "height: 100%; width: auto;"
                        square.append(flag)
                    }
                }
            }
            // If no child nodes of chosen square present
            else {
                // If empty, and right click, place a flag inside.
                if (click == "right") {
                    // Reduce minecount by 1

                    // Display a flag in the square
                    let flag = document.createElement("img")
                    flag.src = "./img/flag.png"
                    flag.setAttribute("class", "flag")
                    flag.style = "height: 100%; width: auto;"
                    square.append(flag)
                }
                // If empty, and left click, run the adjacency checks until an endpoint is reached. 
                else if (click == "left") {
                    // Make the chosen square 'safe'
                    square.style = "background-color: rgba(0, 0, 255, 0.5);"
                    /*





                    CODE FOR DOING ADJACENT SQUARES AND NUMBERS





                    */
                }
            }
        }
    }

    // Handle the click event for mines and so on down below here
    console.log(click)
}

// Function to end a game and show the user the entire board as well as some kind of 'game over' screen.
const endGame = () => {
    //do the thing
}