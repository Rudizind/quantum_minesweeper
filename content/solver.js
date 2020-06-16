let solver = {
    test: (square) => {
        // will return with Boolean - if true, means square can be resolved; if false, means square cannot be resolved, therefore change() is called. 
        
        // variables we will need:
        
        // have to get an array of all revealed tiles that have hidden tiles in their borders. then have to get an array of all unrevealed neighbours of those tiles. 
        let revealedTiles = []
        
        // First, get all revealed tiles.
        let tiles = document.querySelectorAll(".mineSquare")
        tiles.forEach(tile => {
            if (tile.revealed == true) {
                revealedTiles.push(tile)
            }
        })
        console.log(revealedTiles)

        // Then, get any neighbours of revealed tiles that are hidden
        let searchTiles = []

        let squareInfo = []
        
        // this will tell the function at the end whether it should continue recursing or not.
        let changeTest = false;

        revealedTiles.forEach(square => {
            let safeNeighbours = []
            let flagNeighbours = []
            let unknownNeighbours = []


            tiles.forEach(cell => {
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
                    // if tile is already revealed
                    if (revealedTiles.includes(cell)) {
                        safeNeighbours.push(cell)
                    }
                    // if tile contains nothing but isn't revealed yet
                    else if (!revealedTiles.includes(cell) && cell.childNodes.length == 0) {
                        unknownNeighbours.push(cell)
                    }
                    // if tile contains a mine OR a flag
                    else if (cell.revealed == false && cell.childNodes.length == 1) {
                        console.log(cell)
                        console.log(cell.childNodes[0])
                        // if a tile contains a mine and no flag
                        if (cell.childNodes[0].getAttribute("class") == "mine") {
                            unknownNeighbours.push(cell)
                        }
                        // if a tile contains a flag and no mine
                        else if (cell.childNodes[0].getAttribute("class") == "flag") {
                            flagNeighbours.push(cell)
                        }
                    }
                    // if tile contains both a mine and a flag
                    else if (!revealedTiles.includes(cell) && cell.childNodes.length == 2) {
                        flagNeighbours.push(cell)
                    }
                }
            })

            // a catch all for when a square is completely safe:
            if (unknownNeighbours.length == 0) {
                return;
            }
            else {
                // heuristic one - if no. of hidden spaces around revealed square is equal to the number in its text minues the flags around it,
                // then all remaining spaces must be mines. 
                if ((square.textContent - flagNeighbours.length) == unknownNeighbours.length) {
                    // Display a flag in the square
                    console.log(square.textContent)
                    console.log(flagNeighbours.length)
                    console.log(unknownNeighbours.length)
                    unknownNeighbours.forEach(tile => mineTest(tile, "right"))
                    changeTest = true;
                }
                // heuristic two - if no. of flagged spaces around revealed square is equal to the number in its text,
                // then all remaining spaces must be safe.
                else if (square.textContent == flagNeighbours.length) {
                    // make all other squares safe
                    console.log(square.textContent)
                    console.log(flagNeighbours.length)
                    console.log(unknownNeighbours.length)
                    unknownNeighbours.forEach(tile => mineTest(tile, "left"))
                    changeTest = true;
                }
            }
        })
        if ((currentGame.startMines - currentGame.flagsPlaced) > 0) {
            // do it again only if something has changed
            if (changeTest == true) {
                changeTest = false;
                solver.test(square)
            }
        }

        // 
        // if can't resolve, end the game.
    },
    change: () => {
        // changes gameboard if appropriate from this.test()
    }
}