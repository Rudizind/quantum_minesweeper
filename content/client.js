// Current user details, these are sent through the HTTP requests to be parsed by the authenticate middleware.
let currentUser = {
    username: "",
    password: ""
}

// Variable to be used when a game is active, for tracking gameboard etc.
let currentGame = {};

// Register a new user by taking their details and sending them to the server to be added to the database using an HTTP POST request.
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
                throw new Error (response.status + " " + response.statusText)
            }
            else {
                alert(`Registered successfully. You may now log in.`)
            }
        })
        .catch(err => alert(err))
    })()
}

// Log in a user by taking their input credentials and checking them against the database using a post HTTP request.
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
            throw new Error (response.status + " " + response.statusText)
        }
        else {
            alert(`Logged in successfully.`)
            return response.json()
        }
    })
    .then(data => {
        let userData = data;
        currentUser.username = userData._id
        currentUser.password = userData.password
        document.getElementById("login").setAttribute("class", "hidden")
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

    // Set the starting board parameters (in global scope)
    currentGame = {
        active: true,
        startMines: 99,
        flagsPlaced: 0,
        boardSize: 'xl',
        timerCount: 0,
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
    // By default, confirmed will be true. If a game is ended by a user leaving early, then they'll be asked to confirm first that they wish to do so.
    // If a game is over, because of the default value, the user isn't asked to confirm.
    let confirmed = true;
    if (currentGame.active) {
        confirmed = confirm("Are you sure you'd like to leave the game? This will be counted as a loss.")
    }
    if (confirmed) {

        // Hide all UI for the gameboard and HUD.
        document.getElementById("hotbar").setAttribute("class", "hidden")
        document.getElementById("gameboard").setAttribute("class", "hidden")
        document.getElementById("homeButt").setAttribute("class", "hidden")

        // Remove all the table rows so it can be repopulated for a next game.
        document.querySelectorAll("tr").forEach(node => {
            console.log(node)
            node.parentElement.removeChild(node)
        })

        // Stop the timer
        currentGame.timerStop()

        // Reset the timer to 0 for the next game
        document.getElementById("gameTimer").innerHTML = "Time Elapsed: 0"

        // Show the newgame div, containing the startGame button.
        document.getElementById("newgame").setAttribute("class", "container-fluid align-middle")
    }

    // Reset the localized currentGame object.
    currentGame = {};
}