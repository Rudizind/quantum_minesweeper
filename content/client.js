// Current user details, these are sent through the HTTP requests to be parsed by the authenticate middleware.
let currentUser = {
    username: "",
    password: ""
}

// Register a new user by taking their details and sending them to the server to be added to the database using an HTTP POST request.
const registerUser = () => {
    let username = document.getElementById("usernameBox").value
    let password = document.getElementById("passwordBox").value
    let userDetails = {
        username: username,
        password: password
    }
    fetch('/api/newUser', {
        method: 'POST',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userDetails)
    })
    .then(response => {
        console.log(response)
        if (!response.ok) {
            throw new Error (response.status + " " + response.statusText)
        }
        else {
            alert(`Registered successfully.`)
        }
    })
    .catch(err => alert(err))
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
            document.getElementById("idReg").style.display = "none"
            return response.json()
        }
    })
    .then(data => {
        let userData = data;
        currentUser.username = userData._id
        currentUser.password = userData.password

        // Set the runInfo to contain an updated list of recent runs and the user's profile.
        getUserProfile()
        if (currentUser.preferences.sort == "Popularity") {
            getEvents('Popular', "")
        }
        else if (currentUser.preferences.sort == "Suitability") {
            getEvents('Suitable', "")
        }
        else {
            getEvents('Most Recent', "")
        }
        document.getElementById("newRunButt").style.display = ""
        document.getElementById("runInfo").style.display = "flex"
    })
    .catch(err => alert(err))
}