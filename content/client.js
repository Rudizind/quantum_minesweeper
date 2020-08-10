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
                .catch(err => console.error(err))
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
        .catch(err => console.error(err))
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
    // the updates to be sent which will be filled in below:
    let updates = []

    // By default, confirmed will be true. If a game is ended by a user leaving early, 
    // then they'll be asked to confirm first that they wish to do so.
    // If a game is over, because of the default value, the user isn't asked to confirm.
    let confirmed = false;
    if (currentGame.active) {
        if (isBrowser()) {
            if (confirm("Are you sure you'd like to leave the game? This will be counted as a loss.")) {
                confirmed = true;
    
                // also send the server request to update the user's stats
                updates.push({ type: "loss", num: 1, id: Math.round(Math.random() * 99999999999999) })
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
            updates.push({ type: "game", num: 1, id: Math.round(Math.random() * 99999999999999) })
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
        document.getElementById("aboutInfo").setAttribute("class", "hidden")

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
            assert.equal(document.getElementById("aboutInfo").getAttribute("class"), "hidden", 
                `aboutInfo's class should be set to hidden`);
        }
        else {
            let replayButtCOPY = document.getElementById("replayButt").getAttribute("class")
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
                    assert.equal(replayButtCOPY, "hidden",
                        `replayButt's class should be set to hidden`)
                    assert.equal(document.getElementById("replayDisplay").getAttribute("class"), "hidden",
                        `replayDisplay's class should be set to hidden`)
                    assert.equal(document.getElementById("aboutInfo").getAttribute("class"), "hidden", 
                        `aboutInfo's class should be set to hidden`);
                })
            })
        }

        // Remove all the table rows so it can be repopulated for a next game.
        document.querySelectorAll("tr").forEach(node => {
            node.parentElement.removeChild(node)
        })

        // mocha/chai tests for whether all table rows have been removed
        if (isBrowser()) {
            let allRows = document.querySelectorAll("tr")
            assert.equal(allRows.length, 0, "There should be no tr elements remaining");
        }
        else {
            describe('table rows of gameboard', () => {
                it('should all be removed', () => {
                    let allRows = document.querySelectorAll("tr")
                    assert.equal(allRows.length, 0, "There should be no tr elements remaining");
                })
            })
        }

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
        let neighbourLength = allMineNeighbours.length

        // reset the solver's properties
        solver.replayArray = []
        solver.currentMove = -1
        solver.endBoardState = []
        let endBoardLength = solver.endBoardState.length
        solver.errorTile = null
        let nullVar = solver.errorTile == null ? null : undefined

        if (isBrowser()) {
            assert.isArray(allMineNeighbours, "allMineNeighbours should be an array");
            assert.equal(neighbourLength, 0, "allMineNeighbours should be empty")
            assert.isArray(solver.replayArray, "replayArray should be an array")
            assert.equal(solver.replayArray.length, 0, "replayArray should be empty");
            assert.equal(solver.currentMove, -1, "currentMove should be set to -1");
            assert.isArray(solver.endBoardState, "endBoardState should be an array");
            assert.equal(endBoardLength, 0, "endBoardState should be empty");
            assert.isNull(nullVar, "errorTile should be set to null");
        }
        else {
            describe('backHome var resets', () => {
                it('should have all vars set to default values', () => {
                    assert.isArray(allMineNeighbours, "allMineNeighbours should be an array");
                    assert.equal(neighbourLength, 0, "allMineNeighbours should be empty")
                    assert.isArray(solver.replayArray, "replayArray should be an array")
                    assert.equal(solver.replayArray.length, 0, "replayArray should be empty");
                    assert.equal(solver.currentMove, -1, "currentMove should be set to -1");
                    assert.isArray(solver.endBoardState, "endBoardState should be an array");
                    assert.equal(endBoardLength, 0, "endBoardState should be empty");
                    assert.isNull(nullVar, "errorTile should be set to null");
                })
            })
        }

        // reset the solver replay display
        document.getElementById("tilesSolved").innerHTML = "Tiles Solved: 0"
        document.getElementById("replayText").innerHTML = "Game state before solver begins"
        
        // reset the arrows for the replay
        document.getElementById("leftArrow").setAttribute("onclick", "")
        document.getElementById("leftArrow").style.opacity = "0.5"
        
        document.getElementById("rightArrow").setAttribute("onclick", "solver.changeMove(1)")
        document.getElementById("rightArrow").style.opacity = "1"

        // send the updates to the server
        if (isBrowser()) {
            updateStats(updates)
        }
    }
}

// If the solver finds that the player could've discovered that the current square was a mine, they lose.
const endGame = () => {
    // the updates to be sent which will be filled in below:
    let updates = []

    // send the server request to update the user's stats
    updates.push({ type: "loss", num: 1, id: Math.round(Math.random() * 99999999999999) })

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
        
        if (isBrowser()) {
            assert.equal(parent.style.backgroundColor, "orange",
                `All former flagNodes should have an orange background`);
        }
        else {
            describe('flagNodes', () => {
                it('should all have an orange background', () => {
                    assert.equal(parent.style.backgroundColor, "orange",
                        `All former flagNodes should have an orange background`);
                })
            })
        }
    })

    if (isBrowser()) {
        let remainingFlags = document.querySelectorAll(".flag")
        assert.equal(remainingFlags.length, 0, "There should be no remaining flags");
    }
    else {
        describe('remaining flags on board', () => {
            it('should have no remaining flags', () => {
                let remainingFlags = document.querySelectorAll(".flag")
                assert.equal(remainingFlags.length, 0, "There should be no remaining flags");
            })
        })
    }

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

    // send the updates
    if (isBrowser()) {
        updateStats(updates)
    }
}

// display the 'you won the game' screen if the user correctly identifies
// all of the mines in the gameboard
// note that this may be called and then not resolve - as the user must correctly
// identify all mines - not just randomly place them.
const winGame = () => {
    // the updates to be sent which will be filled in below:
    let updates = []

    let allFlags = document.querySelectorAll(".flag")
    let winner = true;
    allFlags.forEach(flag => {
        if (flag.parentElement.childNodes.length == 1) {
            winner = false;
        } else {
            return;
        }
    })

    if (isBrowser()) {
        if (winner) {
            let checkFlags = document.querySelectorAll(".flag")
            assert.equal(checkFlags.length, currentGame.startMines, 
                `the number of flags should match the number of startMines`)
            
            checkFlags.forEach(flag => {
                assert.equal(flag.parentElement.childNodes.length, 2,
                    `all flags should be covering a mine (i.e. correctly placed)`);
            })
        }
        else {
            assert.notEqual(checkFlags.length, currentGame.startMines, 
                `the number of flags should not match the number of startMines`)
        }
    }
    else {
        describe('allFlagsCheck', () => {
            let checkFlags = document.querySelectorAll(".flag")
            it('should only count as a win if no. of flags = no. of startMines', () => {
                if (winner) {
                    assert.equal(checkFlags.length, currentGame.startMines, 
                        `the number of flags should match the number of startMines`)
                }
                else {
                    assert.notEqual(checkFlags.length, currentGame.startMines, 
                        `the number of flags should not match the number of startMines`)
                }
            })
            it('should only count as a win if all flags are correctly placed', () => {
                let allOk = true;
                checkFlags.forEach(flag => {
                    if (!flag.parentElement.childNodes.length == 2) {
                        allOk = false;
                    }
                })
                if (winner) {
                    assert.isTrue(allOk, "all flags should be correct to win");
                }
                else {
                    assert.isFalse(allOk, "if at least one flag is wrong, you shouldn't win");
                }
            })
        })
    }

    if (winner) {
        if (isBrowser()) {
            // send the server request to update the user's stats
            updates.push({ type: "win", num: 1, id: Math.round(Math.random() * 99999999999999) })

            alert("Congratulations, you cleared all the mines!")
        }

        // Remove the click event listener from all squares.
        let allSquares = document.querySelectorAll(".mineSquare")
        allSquares.forEach(node => {
            node.removeEventListener("mouseup", squareChoice)
            node.style.backgroundColor = "rgba(0, 255, 0, 0.3)"
        })

        // mocha/chai test that all nodes have been turned green
        if (isBrowser()) {
            allSquares.forEach(square => {
                assert.equal(square.style.backgroundColor, "rgba(0, 255, 0, 0.3)", 
                    `is you win, all nodes should turn green`);
            })
        }
        else {
            describe('all tiles green', () => {
                it('should turn all tiles green if you win the game', () => {
                    allSquares.forEach(square => {
                        assert.equal(square.style.backgroundColor, "rgba(0, 255, 0, 0.3)", 
                            `is you win, all nodes should turn green`);
                    })
                })
            })
        }

        // Remove the mine count
        document.getElementById("scoreDisplay").innerHTML = "Mines left: 0"

        // Signify to the backHome button that the game is no longer active so it doesn't have to confirm().
        currentGame.active = false;

        // Stop the timer
        currentGame.timerStop()

        if (isBrowser()) {
            updateStats(updates)
        }
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
                    flag.style = "height: 27px; width: 27px;"
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
    .catch(err => console.error(err))
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
    .catch(err => console.error(err))
}

const updateStats = statUpdate => {
    if (statUpdate.length > 0) {
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
                return response;
            }
        })
        .then(() => console.log("stats updated"))
        .catch(err => console.error(err))
    }
}

const showAboutInfo = () => {
    // Adjust display
    document.getElementById("newgame").setAttribute("class", "hidden")
    document.getElementById("aboutInfo").setAttribute("class", "container-fluid align-middle")
    document.getElementById("homeButt").setAttribute("class", "container-fluid align-middle")

    // use .viewingStats to avoid errors from the backHome function
    currentGame.viewingStats = true;
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
    module.exports.showAboutInfo = showAboutInfo
}