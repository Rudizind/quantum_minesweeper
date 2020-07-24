// a short test for whether the code is being run through node or browser
const isBrowser = () => {
    return this === window ? true : false
}
let assert

if (!isBrowser()) {
    assert = require('chai').assert
}
else {
    assert = chai.assert
}

// Current user details, these are sent through the HTTP requests to be parsed by the authenticate middleware.
let currentUser = {
    username: "",
    password: "",
    stats: {}
}

// Variable to be used when a game is active, for tracking gameboard etc.
let currentGame = {};

// Persistent storage of mineTile neighbours for a game
let allMineNeighbours = []

// Register a new user by taking their details and sending them to the server 
// to be added to the database using an HTTP POST request.
const registerUser = () => {
    let username = document.getElementById("usernameBox").value
    let password = document.getElementById("passwordBox").value

    // Authenticate user input for username and password, and alert errors if they aren't ok. Otherwise, proceed.
    username.length < 8 ? alert("Your username must be at least 8 characters.") :
        username.length > 24 ? alert("Your username must be at most 24 characters.") :
        password.length < 8 ? alert("Your password must be at least 8 characters.") :
        password.length > 24 ? alert("Your username must be at most 24 characters.") :
        password == username ? alert("Your username and password must not be the same.") : (() => {
            let userDetails = {
                username: username,
                password: password
            }
            fetch('/api/newUser/', {
                    method: 'POST',
                    headers: {
                        "accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userDetails)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.status + " " + response.statusText)
                    } else {
                        alert(`Registered successfully. You may now log in.`)
                    }
                })
                .catch(err => alert(err))
        })()
}

// Log in a user by taking their input credentials and checking them 
// against the database using a post HTTP request.
const loginUser = () => {
    let username = document.getElementById("usernameBox").value
    let password = document.getElementById("passwordBox").value
    let userDetails = {
        username: username,
        password: password
    }
    fetch('/api/loginUser/', {
            method: 'POST',
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status + " " + response.statusText)
            } else {
                alert(`Logged in successfully.`)
                return response.json()
            }
        })
        .then(data => {
            let userData = data;
            currentUser.username = userData._id
            currentUser.password = userData.password
            currentUser.stats = userData.stats
            document.getElementById("login").setAttribute("class", "hidden")
            document.getElementById("mineVisionCheck").checked = false;
            document.getElementById("boardSizeChoice").value = "Medium (13 x 9)"
            document.getElementById("mineChoice").value = "Normal (1.0x)"
            document.getElementById("newgame").setAttribute("class", "container-fluid align-middle")
        })
        .catch(err => alert(err))
}

// Start the game board and initialise the game.
const startGame = () => {
    // Adjust display
    document.getElementById("newgame").setAttribute("class", "hidden")
    document.getElementById("gameboard").setAttribute("class", "container-fluid align-middle")
    document.getElementById("hotbar").setAttribute("class", "container-fluid align-middle")

    // adjust the boardSize value according to the user's choice.
    let boardSize;
    let boardSizeChoice = document.getElementById("boardSizeChoice").value
    boardSize = boardSizeChoice == "Extra Small (5 x 5)" ? 'xs' :
                boardSizeChoice == "Small (8 x 7)" ? 's' :
                boardSizeChoice == "Medium (13 x 9)" ? 'm' :
                boardSizeChoice == "Large (20 x 12)" ? 'l' :
                boardSizeChoice == "Extra Large (30 x 16)" ? 'xl' : 'm'

    // mocha/chai test for initial boardSize (both in browser and in node)
    if (isBrowser()) {
        let sizes = ["xs", "s", "m", "l", "xl"]
        assert.oneOf(boardSize, sizes, 
            `boardSize should be only one of the designated 5 sizes`)
    }
    else {
        describe('boardSize', () => {
            it('should only be one of the five designated sizes', () => {   
                let sizes = ["xs", "s", "m", "l", "xl"]
                assert.oneOf(boardSize, sizes, 
                    `boardSize should be only one of the designated 5 sizes`)
            })
        })
    }

    // using the board size from above, calculate the number of mines in the board.
    let totalMines;
    // get the normal number of mines
    totalMines = boardSize == 'xl' ? 99 :
                 boardSize == 'l' ? 55 :
                 boardSize == 'm' ? 30 :
                 boardSize == 's' ? 14 :
                 boardSize == 'xs' ? 5 : 30

    // mocha/chai test for initial totalMines (both in browser and in node)
    if (isBrowser()) {
        let mineCounts = [99, 55, 30, 14, 5]
        assert.oneOf(totalMines, mineCounts, 
            `totalMines should only equal one of the five chosen counts`)
    }
    else {
        describe('totalMines', () => {
            it('should only be one of the five designated counts', () => {   
                let mineCounts = [99, 55, 30, 14, 5]
                assert.oneOf(totalMines, mineCounts, 
                    `totalMines should only equal one of the five chosen counts`)
            })
        })
    }

    // then adjust it according to the multiplier given
    let mineChoice = document.getElementById("mineChoice").value
    let mineMultiplier = mineChoice == "Minimum (0.7x)" ? 0.7 :
                         mineChoice == "Normal (1.0x)" ? 1 :
                         mineChoice == "Maximum (1.3x)" ? 1.3 : 1

    // mocha/chai test for mineMultiplier (both in browser and in node)
    if (isBrowser()) {
        let multipliers = [0.7, 1, 1.3]
        assert.oneOf(mineMultiplier, multipliers, 
            `mineMultiplier should only be one of the three chosen numbers`)
    }
    else {
        describe('mineMultiplier', () => {
            it('should only be one of the three designated numbers', () => {   
                let multipliers = [0.7, 1, 1.3]
                assert.oneOf(mineMultiplier, multipliers, 
                    `mineMultiplier should only be one of the three chosen numbers`)
            })
        })
    }

    // find the final number of mines
    let endMines = Math.round(totalMines * mineMultiplier)
    
    // mocha/chai test for endMines (both in browser and in node)
    if (isBrowser()) {
        assert.equal(endMines, Math.round(totalMines * mineMultiplier),
            `totalMines should equal totalMines * the multiplier`)
    }
    else {
        describe('endMines', () => {
            it('should equal the totalMines * the multiplier', () => {   
                assert.equal(endMines, Math.round(totalMines * mineMultiplier),
                    `endMines should equal totalMines * mineMultiplier`)
            })
        })
    }

    // Set the starting board parameters (in global scope)
    currentGame = {
        active: true,
        startMines: endMines,
        flagsPlaced: 0,
        boardSize: boardSize,
        timerCount: 0,
        mineVision: document.getElementById("mineVisionCheck").checked ? true : false,
        hintsActive: document.getElementById("hintCheck").checked ? true : false,
        hint: false,
        currentHint: null,
        viewingStats: false,
        timerStart: () => {
            this.timerCount = setInterval(tickUp, 1000)
        },
        timerStop: () => {
            window.clearInterval(this.timerCount)
        }
    }

    // mocha/chai test for currentGame in startGame() (both in browser and in node)
    if (isBrowser()) {
        // it should have the appopriate number of properties
        assert.equal(Object.keys(currentGame).length, 12, "currentGame should have 12 properties");

        // extensive testing would ensure all properties have the appropriate type and so on
        // but for this project we will not waste time doing these tests now
    }
    else {
        describe('currentGame', () => {
            it('should have 12 properties', () => {   
                assert.equal(Object.keys(currentGame).length, 12, "currentGame should have 12 properties");
            })
        })
    }

    document.getElementById("scoreDisplay").innerHTML = "Mines left: " + currentGame.startMines

    // Call the makeBoard function from ./board.js
    makeBoard()

    // Display the backHome() button
    document.getElementById("homeButt").setAttribute("class", "container-fluid align-middle")
    // if hints enabled, show the hint button
    if (currentGame.hintsActive) {
        document.getElementById("hintButt").setAttribute("class", "btn")
    }

    // Start the timer
    currentGame.timerStart()
}

// the callback function for the setInterval used above in currentGame.timerStart()
const tickUp = () => {
    currentGame.timerCount++
    document.getElementById("gameTimer").innerHTML = "Time Elapsed: " + currentGame.timerCount
}

// Send the user back to the home page which has startGame button. 
const backHome = () => {
    // By default, confirmed will be true. If a game is ended by a user leaving early, 
    // then they'll be asked to confirm first that they wish to do so.
    // If a game is over, because of the default value, the user isn't asked to confirm.
    let confirmed = false;
    if (currentGame.active) {
        if (isBrowser()) {
            if (confirm("Are you sure you'd like to leave the game? This will be counted as a loss.")) {
                confirmed = true;
    
                // also send the server request to update the user's stats
                updateStats({ type: "loss", num: 1 })
            }
        }
        else {
            confirmed = true;
        }
    } else {
        confirmed = true;
    }
    if (confirmed) {
        // send the server request to update the user's stats
        if (!currentGame.viewingStats) {
            if (isBrowser()) {
                updateStats({ type: "game", num: 1 })
            }
        }
        else {
            document.getElementById("statsDisplay").setAttribute("class", "hidden")
            let rows = document.querySelectorAll(".statsRow")
            rows.forEach(row => row.parentElement.removeChild(row))
            document.getElementById("statsHeading").innerHTML = ""
        }

        // Hide all UI for the gameboard and HUD.
        document.getElementById("hotbar").setAttribute("class", "hidden")
        document.getElementById("gameboard").setAttribute("class", "hidden")
        document.getElementById("homeButt").setAttribute("class", "hidden")
        document.getElementById("hintButt").setAttribute("class", "hidden")
        document.getElementById("replayButt").setAttribute("class", "hidden")
        document.getElementById("replayDisplay").setAttribute("class", "hidden")

        // mocha/chai test for UI hidden changes (both in browser and in node)
        if (isBrowser()) {
            // all the below items class should be set to hidden. 
            assert.equal(document.getElementById("hotbar").getAttribute("class"), "hidden",
                `hotbar's class should be set to hidden`)
            assert.equal(document.getElementById("gameboard").getAttribute("class"), "hidden",
                `gameboard's class should be set to hidden`)
            assert.equal(document.getElementById("homeButt").getAttribute("class"), "hidden",
                `homeButt's class should be set to hidden`)
            assert.equal(document.getElementById("hintButt").getAttribute("class"), "hidden",
                `hintButt's class should be set to hidden`)
            assert.equal(document.getElementById("replayButt").getAttribute("class"), "hidden",
                `replayButt's class should be set to hidden`)
            assert.equal(document.getElementById("replayDisplay").getAttribute("class"), "hidden",
                `replayDisplay's class should be set to hidden`)
        }
        else {
            describe('UI set to hidden', () => {
                it('should set various elements class to hidden', () => {   
                    // make all the classes for these elements hidden
                    assert.equal(document.getElementById("hotbar").getAttribute("class"), "hidden",
                    `hotbar's class should be set to hidden`)
                    assert.equal(document.getElementById("gameboard").getAttribute("class"), "hidden",
                        `gameboard's class should be set to hidden`)
                    assert.equal(document.getElementById("homeButt").getAttribute("class"), "hidden",
                        `homeButt's class should be set to hidden`)
                    assert.equal(document.getElementById("hintButt").getAttribute("class"), "hidden",
                        `hintButt's class should be set to hidden`)
                    // replayButt not tested as it is changed elsewhere
                    assert.equal(document.getElementById("replayDisplay").getAttribute("class"), "hidden",
                        `replayDisplay's class should be set to hidden`)
                })
            })
        }

        // Remove all the table rows so it can be repopulated for a next game.
        document.querySelectorAll("tr").forEach(node => {
            node.parentElement.removeChild(node)
        })

        // Stop the timer
        if (!currentGame.viewingStats) {
            currentGame.timerStop()
        }

        // Reset the timer to 0 for the next game
        document.getElementById("gameTimer").innerHTML = "Time Elapsed: 0"

        // Show the newgame div, containing the startGame button.
        document.getElementById("newgame").setAttribute("class", "container-fluid align-middle")

        // Reset the localized currentGame object.
        if (isBrowser()) {
            currentGame = {};
        }

        // reset the mineNeighbours for the next game
        allMineNeighbours = []

        // reset the solver's properties
        solver.replayArray = []
        solver.currentMove = -1
        solver.endBoardState = []
        solver.errorTile = null

        // reset the solver replay display
        document.getElementById("tilesSolved").innerHTML = "Tiles Solved: 0"
        document.getElementById("replayText").innerHTML = "Game state before solver begins"
        
        // reset the arrows for the replay
        document.getElementById("leftArrow").setAttribute("onclick", "")
        document.getElementById("leftArrow").style.opacity = "0.5"
        
        document.getElementById("rightArrow").setAttribute("onclick", "solver.changeMove(1)")
        document.getElementById("rightArrow").style.opacity = "1"
    }
}

// If the solver finds that the player could've discovered that the current square was a mine, they lose.
const endGame = () => {
    // send the server request to update the user's stats
    if (isBrowser()) {
        updateStats({ type: "loss", num: 1 })
    }

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

    // mocha/chai test mineNodes colour in endGame() (both in browser and in node)
    if (isBrowser()) {
        mineNodes.forEach(node => {
            // it should add the appropriate colours to nodes as above
            if (node.parentElement.childNodes.length == 2) {
                assert.equal(node.parentElement.style.backgroundColor, "orange", 
                    "correctly guessed nodes should turn orange");
            }
            else {
                assert.equal(node.parentElement.style.backgroundColor, "red", 
                    "nodes with only mines should turn red");
            }
        })
    }
    else {
        describe('mineNodes colour', () => {
            it('should turn all mineNodes either orange or red correctly', () => {   
                mineNodes.forEach(node => {
                    // it should add the appropriate colours to nodes as above
                    if (node.parentElement.childNodes.length == 2) {
                        assert.equal(node.parentElement.style.backgroundColor, "orange", 
                            "correctly guessed nodes should turn orange");
                    }
                    else {
                        assert.equal(node.parentElement.style.backgroundColor, "red", 
                            "nodes with only mines should turn red");
                    }
                })
            })
        })
    }

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

    // Display the showReplay() button and disable the hint button
    document.getElementById("replayButt").setAttribute("class", "btn")
    if (currentGame.hintsActive) {
        document.getElementById("hintButt").setAttribute("class", "hidden")
        document.getElementById("hintButt").style.backgroundColor = ""
    }

    // Stop the timer
    currentGame.timerStop()
}

// display the 'you won the game' screen if the user correctly identifies
// all of the mines in the gameboard
// note that this may be called and then not resolve - as the user must correctly
// identify all mines - not just randomly place them.
const winGame = () => {
    let allFlags = document.querySelectorAll(".flag")
    let winner = true;
    allFlags.forEach(flag => {
        if (flag.parentElement.childNodes.length == 1) {
            winner = false;
        } else {
            return;
        }
    })

    if (winner) {
        // send the server request to update the user's stats
        updateStats({ type: "win", num: 1 })

        // perform all UI updates
        alert("Congratulations, you found all the mines!")

        // Remove the click event listener from all squares.
        let allSquares = document.querySelectorAll(".mineSquare")
        allSquares.forEach(node => {
            node.removeEventListener("mouseup", squareChoice)
            node.style.backgroundColor = "rgba(0, 255, 0, 0.3)"
        })

        // Remove the mine count
        document.getElementById("scoreDisplay").innerHTML = "Mines left: 0"

        // Signify to the backHome button that the game is no longer active so it doesn't have to confirm().
        currentGame.active = false;

        // Stop the timer
        currentGame.timerStop()
    }
}

const showReplay = () => {
    // Hide the UI for an active game
    document.getElementById("hotbar").setAttribute("class", "hidden")

    // Hide the show replay button
    document.getElementById("replayButt").setAttribute("class", "hidden")

    // Show the replay display along the top of the board
    document.getElementById("replayDisplay").setAttribute("class", "container-fluid align-middle")

    // reset the board display so that it matches the board the user saw
    // before they made a mistake
    let allNodes = document.querySelectorAll(".mineSquare")
    allNodes.forEach(node => {
        if (node.childNodes.length > 0 && node.textContent == "") {
            // if there's a cross in the tile, remove it and put a flag back in it
            if (node.childNodes.length == 1) {
                node.childNodes[0].style.display = "none"

                if (node.style.backgroundColor == "orange") {
                    // Display a flag in the square
                    let flag = document.createElement("img")
                    flag.src = "./img/flag.png"
                    flag.setAttribute("class", "flag")
                    flag.style = "height: 100%; width: auto;"
                    node.append(flag)
                }
            }
        }
        if (!node.revealed) {
            node.style.backgroundColor = ""
        }
    })

    // show the target tile the user chose
    let cross = document.createElement("img")
    cross.setAttribute("class", "cross")
    cross.src = "./img/x.png"
    cross.style = "height: 100%; width: auto;"
    solver.errorTile.appendChild(cross);
}

const toggleHint = () => {
    // toggle currentGame.hint
    currentGame.hint = !currentGame.hint

    // toggle the background colour of the button
    currentGame.hint ? document.getElementById("hintButt").style.backgroundColor = "orange" :
        document.getElementById("hintButt").style.backgroundColor = ""
}

const viewStats = type => {
    document.getElementById("newgame").setAttribute("class", "hidden")
    document.getElementById("homeButt").setAttribute("class", "container-fluid align-middle")
    currentGame.viewingStats = true
    type == "all" ? getAllStats() : getSingleStats()
}

const getSingleStats = () => {
    fetch(`/api/getSingleStats/${currentUser.username}`, {
        method: 'GET',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(currentUser.username + ":" + currentUser.password)
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status + " " + response.statusText)
        }
        else {
            return response.json()
        }
    })
    .then(data => {
        let container = document.getElementById("statsDisplay")
        let table = document.getElementById("statsTable")
        let heading = document.getElementById("statsHeading")

        container.setAttribute("class", "container-fluid align-middle")
        heading.innerHTML = `${currentUser.username}'s Quantum Minesweeper stats`
        
        // create the table heading
        let headerRow = document.createElement("tr")
        headerRow.setAttribute("class", "statsRow")
        for (let i = 0; i <= 3; i++) {
            let newCell = document.createElement("th")
            newCell.innerHTML = i == 0 ? "Games Played" :
                                i == 1 ? "Games Won" :
                                i == 2 ? "Games Lost" :
                                "Times saved by Quantum Safety"
            newCell.style = "width: 25%; text-align: center; padding-top: 10px; padding-bottom: 10px;"
            headerRow.append(newCell)
        }
        headerRow.style = "border-bottom: 2px solid black;"
        table.append(headerRow)

        // create the table content
        let newRow = document.createElement("tr")
        newRow.setAttribute("class", "statsRow")
        for (let i = 0; i <= 3; i++) {
            let newCell = document.createElement("td")
            newCell.innerHTML = i == 0 ? data.stats.gamesPlayed :
                                i == 1 ? data.stats.gamesWon :
                                i == 2 ? data.stats.gamesLost :
                                data.stats.quantumSaves
            newCell.style = "width: 25%; text-align: center; padding-top: 10px; padding-bottom: 10px;"
            newRow.append(newCell)
        }
        table.append(newRow)
    })
    .catch(err => alert(err))
}

const getAllStats = () => {
    fetch(`/api/getAllStats/`, {
        method: 'GET',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(currentUser.username + ":" + currentUser.password)
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status + " " + response.statusText)
        }
        else {
            return response.json()
        }
    })
    .then(data => {
        console.log(data)
        // format the response object
        data = data.rows

        // get each user's win rate
        data.forEach(user => {
            user.value.stats.winRate = user.value.stats.gamesPlayed == 0 ? 0 :
                Math.round((user.value.stats.gamesWon / user.value.stats.gamesPlayed) * 100)
        })

        // sort the users in order of win rate

        data.sort((a, b) => {
            return b.value.stats.winRate - a.value.stats.winRate
        })

        let container = document.getElementById("statsDisplay")
        let table = document.getElementById("statsTable")
        let heading = document.getElementById("statsHeading")

        container.setAttribute("class", "container-fluid align-middle")
        heading.innerHTML = `Quantum Minesweeper Leaderboard`

        // create the table heading
        let headerRow = document.createElement("tr")
        headerRow.setAttribute("class", "statsRow")
        for (let i = 0; i <= 5; i++) {
            let newCell = document.createElement("th")
            newCell.innerHTML = i == 0 ? "Username" :
                                i == 1 ? "Games Played" :
                                i == 2 ? "Games Won" :
                                i == 3 ? "Games Lost" :
                                i == 4 ? "Win Rate" :
                                "Times saved by Quantum Safety"
            newCell.style = "width: 16.6666667%; text-align: center; padding-top: 10px; padding-bottom: 10px;"
            headerRow.append(newCell)
        }
        headerRow.style = "border-bottom: 2px solid black;"
        table.append(headerRow)

        // for every player, make a row and populate it
        // then append it

        data.forEach(user => {
            // create the table content
            let newRow = document.createElement("tr")
            newRow.setAttribute("class", "statsRow")
            for (let i = 0; i <= 5; i++) {
                let newCell = document.createElement("td")
                newCell.innerHTML = i == 0 ? user.value.name :
                                    i == 1 ? user.value.stats.gamesPlayed :
                                    i == 2 ? user.value.stats.gamesWon :
                                    i == 3 ? user.value.stats.gamesLost :
                                    i == 4 ? `${user.value.stats.winRate}%` :
                                    user.value.stats.quantumSaves
                newCell.style = "width: 16.6666667%; text-align: center; padding-top: 10px; padding-bottom: 10px;"
                newRow.append(newCell)
            }
            table.append(newRow)
        })
    })
    .catch(err => alert(err))
}

const updateStats = statUpdate => {
    fetch(`/api/updateStats/${currentUser.username}`, {
        method: 'POST',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(currentUser.username + ":" + currentUser.password)
        },
        body: JSON.stringify(statUpdate)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status + " " + response.statusText)
        } else {
            return response.json()
        }
    })
    .then(data => {
        // handle returned data
    })
    .catch(err => alert(err))
}

// export all variables (if in node environment)
if (!isBrowser()) {
    module.exports.isBrowser = isBrowser
    module.exports.currentUser = currentUser
    module.exports.currentGame = currentGame
    module.exports.allMineNeighbours = allMineNeighbours
    module.exports.registerUser = registerUser
    module.exports.loginUser = loginUser
    module.exports.startGame = startGame
    module.exports.tickUp = tickUp
    module.exports.backHome = backHome
    module.exports.endGame = endGame
    module.exports.winGame = winGame
    module.exports.showReplay = showReplay
    module.exports.toggleHint = toggleHint
    module.exports.viewStats = viewStats
    module.exports.getSingleStats = getSingleStats
    module.exports.getAllStats = getAllStats
    module.exports.updateStats = updateStats
}
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
        return;
    } else {
        // If either a mine or flag is present (or both)
        if (square.childNodes.length > 0) {
            // If left click
            if (click == "left") {
                // If there's a flag in the square, do nothing.
                if (square.childNodes.length == 2) {
                    return;
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
                square.style = "background-color: rgba(150, 150, 150, 1);"
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
                 num == 7 ? "rgba(0, 0, 0, 1)" : "rgba(50, 50, 50, 1)" 

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
    updateStats({ type: "save", num: 1 })

    let board = document.querySelectorAll(".mineSquare")
    board.forEach(element => {
        let match = changeTiles.find(item => item.x == Number(element.getAttribute("x")) &&
            item.y == Number(element.getAttribute("y")))
        if (match != undefined) {
            
            if (match.isMine) {
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
            } else if (!match.isMine && element.childNodes.length == 1) {
                let mineRemove = element.childNodes[0]
                element.removeChild(mineRemove)
                element.style.backgroundColor = ""
            }
        }
        else {
            
        }
        return;
    });

    square.style = "background-color: rgba(150, 150, 150, 1);"
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
let solver = {
    test: (targetTile) => {
        // reset the replay array 
        solver.replayArray = []

        // initialise the percentage used by the hints
        let percentage

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
                if (!currentGame.active || (currentGame.hint && percentage != undefined)) {
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
                            if (solver.replayArray.length > 0) {
                                let lastAdded = solver.replayArray[solver.replayArray.length - 1]
                                if (lastAdded.actionTile.x != targetTile.getAttribute("x") ||
                                    lastAdded.actionTile.y != targetTile.getAttribute("y")) {
                                        solver.replayArray.push(replayObj)
                                }
                            }
                            else {
                                solver.replayArray.push(replayObj)
                            }

                            newBoard[square.y - 1][square.x - 1].isFlagged = true
                        })

                        foundNewInfo = true;
                    }
                    // heuristic two - if no. of flagged spaces around revealed tile is equal to the number in its text,
                    // then all remaining spaces must be safe.
                    else if (tile.mineCount == flagNeighbours.length && unknownNeighbours.length > 0) {
                        unknownNeighbours.forEach(cell => {
                            // if hint mode is on:
                            if (currentGame.hint && cell.x == targetTile.getAttribute("x") &&
                                cell.y == targetTile.getAttribute("y")) {
                                return percentage = 0
                            }

                            // otherwise: 
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
                            if (solver.replayArray.length > 0) {
                                let lastAdded = solver.replayArray[solver.replayArray.length - 1]
                                if (lastAdded.actionTile.x != targetTile.getAttribute("x") ||
                                    lastAdded.actionTile.y != targetTile.getAttribute("y")) {
                                        solver.replayArray.push(replayObj)
                                }
                            }
                            else {
                                solver.replayArray.push(replayObj)
                            }
                        })
                        foundNewInfo = true;
                    }
                }
            })

            // if the solver has discovered that the chosen tile should be flagged using the easy solver,
            // then the player has failed and they lose
            if (newBoard[targetTile.getAttribute("y") - 1][targetTile.getAttribute("x") - 1].isFlagged) {
                if (!currentGame.hint) {
                    endGame()
                }
                else {
                    return percentage = 100
                }

                // we return true here because the findSolution function will be recalled
                // and return immediately, because the game is no longer active.
                return true;
            } else {
                // if using hint mode, return the percentage if there is one
                if (currentGame.hint && percentage != undefined) {
                    return percentage
                }
                // otherwise, continue
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
                            if (currentGame.hint && tile.x == targetTile.getAttribute("x") &&
                                tile.y == targetTile.getAttribute("y")) {
                                return percentage = 100
                            }
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
                            if (solver.replayArray.length > 0) {
                                let lastAdded = solver.replayArray[solver.replayArray.length - 1]
                                if (lastAdded.actionTile.x != targetTile.getAttribute("x") ||
                                    lastAdded.actionTile.y != targetTile.getAttribute("y")) {
                                        solver.replayArray.push(replayObj)
                                }
                            }
                            else {
                                solver.replayArray.push(replayObj)
                            }
                        }
                        // if the tile must be not a mine
                        else if (notMine == result.length) {
                            newBoard[tile.y - 1][tile.x - 1].revealed = true;
                            
                            if (currentGame.hint && tile.x == targetTile.getAttribute("x") &&
                                tile.y == targetTile.getAttribute("y")) {
                                return percentage = 0
                            }
                            
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
                            if (solver.replayArray.length > 0) {
                                let lastAdded = solver.replayArray[solver.replayArray.length - 1]
                                if (lastAdded.actionTile.x != targetTile.getAttribute("x") ||
                                    lastAdded.actionTile.y != targetTile.getAttribute("y")) {
                                        solver.replayArray.push(replayObj)
                                }
                            }
                            else {
                                solver.replayArray.push(replayObj)
                            }
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
            if (!currentGame.active || (currentGame.hint && percentage != undefined)) {
                return;
            }
            let useEasy = easySolve()
            if (!currentGame.hint || percentage == undefined) {
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
        }
        findSolution()
        if (currentGame.hint) {
            if (percentage != undefined) {
                return percentage;
            }
            else {
                return -1
            }
        }
        else {
            if (chosenConfig != undefined) {
                return chosenConfig
            } else {
                if (!currentGame.active) {
                    return;
                }
                endGame()
                return;
            }
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
                    source.style.backgroundColor = "rgba(150, 150, 150, 1)"
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
                    action.style.backgroundColor = "rgba(150, 150, 150, 1)"

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
                    source.style.backgroundColor = "rgba(150, 150, 150, 1)"
                    
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

// export all variables (if in node environment)
if (!isBrowser()) {
    module.exports.solver = solver
}
