// Current user details, these are sent through the HTTP requests to be parsed by the authenticate middleware.
let currentUser = {
    username: "",
    password: ""
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

    // using the board size from above, calculate the number of mines in the board.
    let totalMines;
    let mineChoice = document.getElementById("mineChoice").value
    console.log(mineChoice)
    // get the normal number of mines
    totalMines = boardSize == 'xl' ? 99 :
                 boardSize == 'l' ? 55 :
                 boardSize == 'm' ? 30 :
                 boardSize == 's' ? 14 :
                 boardSize == 'xs' ? 5 : 30

    // then adjust it according to the multiplier given
    let mineMultiplier = mineChoice == "Minimum (0.7x)" ? 0.7 :
                         mineChoice == "Normal (1.0x)" ? 1 :
                         mineChoice == "Maximum (1.3x)" ? 1.3 : 1

    console.log(mineMultiplier)
    totalMines = Math.round(totalMines * mineMultiplier)
    console.log(totalMines)

    // Set the starting board parameters (in global scope)
    currentGame = {
        active: true,
        startMines: totalMines,
        flagsPlaced: 0,
        boardSize: boardSize,
        timerCount: 0,
        mineVision: document.getElementById("mineVisionCheck").checked ? true : false,
        timerStart: () => {
            this.timerCount = setInterval(tickUp, 1000)
        },
        timerStop: () => {
            window.clearInterval(this.timerCount)
        }
    }

    document.getElementById("scoreDisplay").innerHTML = "Mines left: " + currentGame.startMines

    // Call the makeBoard function from ./board.js
    makeBoard()

    // Display the backHome() button
    document.getElementById("homeButt").setAttribute("class", "container-fluid align-middle")

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
        if (confirm("Are you sure you'd like to leave the game? This will be counted as a loss.")) {
            confirmed = true;
        }
    } else {
        confirmed = true;
    }
    if (confirmed) {

        // Hide all UI for the gameboard and HUD.
        document.getElementById("hotbar").setAttribute("class", "hidden")
        document.getElementById("gameboard").setAttribute("class", "hidden")
        document.getElementById("homeButt").setAttribute("class", "hidden")
        document.getElementById("replayButt").setAttribute("class", "hidden")
        document.getElementById("replayDisplay").setAttribute("class", "hidden")

        // Remove all the table rows so it can be repopulated for a next game.
        document.querySelectorAll("tr").forEach(node => {
            node.parentElement.removeChild(node)
        })

        // Stop the timer
        currentGame.timerStop()

        // Reset the timer to 0 for the next game
        document.getElementById("gameTimer").innerHTML = "Time Elapsed: 0"

        // Show the newgame div, containing the startGame button.
        document.getElementById("newgame").setAttribute("class", "container-fluid align-middle")

        // Reset the localized currentGame object.
        currentGame = {};

        // reset the solver's replay array
        solver.replayArray = []
    }
}

// If the solver finds that the player could've discovered that the current square was a mine, they lose.
const endGame = () => {

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

    // reset the mineNeighbours for the next game
    allMineNeighbours = []

    // Signify to the backHome button that the game is no longer active so it doesn't have to confirm().
    currentGame.active = false;

    // Display the showReplay() button
    document.getElementById("replayButt").setAttribute("class", "btn")

    // Stop the timer
    currentGame.timerStop()
}

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
        alert("Congratulations, you found all the mines!")

        // Remove the click event listener from all squares.
        let allSquares = document.querySelectorAll(".mineSquare")
        allSquares.forEach(node => {
            node.removeEventListener("mouseup", squareChoice)
            node.style.backgroundColor = "rgba(0, 255, 0, 0.3)"
        })

        // Remove the mine count
        document.getElementById("scoreDisplay").innerHTML = "Mines left: 0"

        // reset the mineNeighbours for the next game
        allMineNeighbours = []

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
        if (!node.revealed) {
            node.style.backgroundColor = ""
        }
        if (node.childNodes.length > 0 && node.textContent == "") {
            // if there's a cross in the tile, remove it and put a flag back in it
            if (node.childNodes[0].getAttribute("class") == "cross") {
                node.removeChild(node.childNodes[0])

                // Display a flag in the square
                let flag = document.createElement("img")
                flag.src = "./img/flag.png"
                flag.setAttribute("class", "flag")
                flag.style = "height: 100%; width: auto;"
                node.append(flag)
            }
            else if (node.childNodes.length == 2) {
                node.childNodes[0].style.display = "none"
            }
            else if (node.childNodes.length == 1 && node.childNodes[0].getAttribute("class") == "mine") {
                node.childNodes[0].style.display = "none"
            }
        }
    })

    // show the target tile the user chose
    solver.errorTile.style.backgroundColor = "rgba(130, 0, 0, 0.55)"
}