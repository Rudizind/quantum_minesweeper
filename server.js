const express = require('express');
const app = express();
const bodyparser = require('body-parser');

app.use(express.static("content"))
app.use(bodyparser.json())
app.use(express.json())

// Initialise pretty-error for use with Node.
require('pretty-error').start();

// Import module holding db config credentials.
let db_info = require('./config-db.js')

// Initialise Nano for database access with CouchDB.    
const nano = require('nano')

// Connection to couchdb is held here.
let my_nano = nano(`http://${db_info.username}:${db_info.password}@${db_info.url}`)

// Initialise the users database connection. If it doesn't exist, it's created then used. Otherwise it's just used.
let users;
(function() {
    const usersCheck = () => {
        my_nano.db.get('sweepers')
            .then(body => users = my_nano.use(db_info.userDatabase), console.log('using users database'))
            .catch(err => {
                if (err.reason == 'no_db_file') {
                    console.log('created users database');
                    my_nano.db.create('sweepers')
                    users = my_nano.use(db_info.userDatabase), console.log('using users database')
                }
                else {
                    console.log('error using users database:', err); 
                }
            })
    }
    usersCheck()
}())

// Authenticate middleware for testing users credentials using basic-auth.
const authenticate = (req, res, next) => {
    let user = basicAuth(req)
    if (!user) {
        res.status(400).send("No Authorization request header provided.")
    }
    else {
        users.get(user.name)
            .then(doc => {
                if (user.name == doc._id && user.pass == doc.password) {
                    next()
                }
            })
            .catch(err => {
                console.log(err)
                res.status(404).send("You must be logged in to continue. Please return to the login page.")
            })
    }
}

app.post('/api/newUser/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    users.get(username)
        .then(() => {
            res.status(400).send(`User ${username} already exists.`)
        })
        .catch(err => {
            if (err.reason == 'missing') {
                users.insert({ _id: username, password: password })
                    .then(doc => res.status(200).send("Registered successfully. Welcome to Quantum Minesweeper!"))
                    .catch(err => res.status(500).send("Error processing request. Refresh the page and try again."))
            }
            else {
                console.log(err)
                res.status(500).send("Error processing request. Refresh the page and try again.")
            }
        })
    
})

app.post('/api/loginUser/', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;

    users.get(username)
        .then(doc => {
            if (doc._id == username && doc.password == password){
                res.json(doc)
            }
            else {
                res.status(400).send("Wrong password. Please try again.")
            }
        })
        .catch(err => {
            console.log(err)
            res.status(404).send("User not found.")
        })
})


app.listen(3000, console.log("server started"))