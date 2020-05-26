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
        startMines: 99,
        flagsPlaced: 0,
        displayedMines: this.startMines - this.flagsPlaced,
        boardSize: 'xl',
        turn: 0
    }

    // Call the makeBoard function from ./board.js
    makeBoard()
}