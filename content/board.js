const makeBoard = () => {
    // Get table
    let table = document.getElementById("boardTable")

    // Set the total mine count - later this will be customizable.
    let mineCount = 99
    
    // Set the squares that are going to be mines.
    let mineSquares = []
    for (m=1;m<=99;m++) {
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

    // Populate the board
    // For now the board will be the size of a standard expert level board (30L x 16H / 480 squares / 99 mines)
    // This will be the number for y (rows of the table)
    for (i=0;i<16;i++) {
        let newRow = document.createElement("tr")
        // This will be the number for x (columns of the table / cells of a row)
        for (j=0;j<30;j++) {
            let newCell = document.createElement("td")
            if (mineSquares.includes(cellCount)) {
                let mine = document.createElement("img")
                mine.src = "./img/mine.png"
                mine.style = "height: 100%; width: auto;"
                newCell.append(mine);
            }
            cellCount++

            // Remove default popup menu for right click on the gameboard
            newCell.setAttribute("oncontextmenu", "event.preventDefault()")

            // Set the mouseevent for detecting which mouse button has been clicked.
            // It uses mouseup instead of mousedown so that a user can change their mind about a choice by moving their mouse away.
            newCell.addEventListener("mouseup", squareChoice)

            // Set ID for CSS styling of the squares
            newCell.id = "mineSquare"

            newRow.append(newCell)
        }
        table.append(newRow)
    }
}

const squareChoice = e => {
    let click;
    e.button == 0 ? click = "left" :
    e.button == 2 ? click = "right" : console.log("invalid click")

    // Handle the click event for mines and so on down below here
    console.log(click)
}