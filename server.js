const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const basicAuth = require('basic-auth');

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
(function () {
    const usersCheck = () => {
        my_nano.db.get('sweepers')
            .then(body => users = my_nano.use(db_info.userDatabase), console.log('using users database'))
            .catch(err => {
                if (err.reason == 'no_db_file') {
                    console.log('created users database');
                    my_nano.db.create('sweepers')
                    users = my_nano.use(db_info.userDatabase)
                    // create the view for all users (used to create the leaderboard)
                    let user_views = new Object()

                    user_views.allUsers = {
                        map: function(doc) {
                            if (doc.password && doc._id && doc.stats) {
                                emit(doc._id, {name: doc._id, stats: doc.stats})
                            }
                        }
                    }

                    users.insert({ "views": user_views }, '_design/users')
                        .then(body => console.log('All Users view added!'))
                        .catch(err => console.log(err))
                } else {
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
    } else {
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
                users.insert({ _id: username, password: password, stats: { gamesPlayed: 0, gamesWon: 0, gamesLost: 0, quantumSaves: 0 } })
                    .then(doc => res.status(200).send("Registered successfully. Welcome to Quantum Minesweeper!"))
                    .catch(err => res.status(500).send("Error processing request. Refresh the page and try again."))
            } else {
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
            if (doc._id == username && doc.password == password) {
                res.json(doc)
            } else {
                res.status(400).send("Wrong password. Please try again.")
            }
        })
        .catch(err => {
            console.log(err)
            res.status(404).send("User not found.")
        })

    
})

app.post('/api/updateStats/:username', authenticate, (req, res, next) => {
    // take the stat update sent by the client and change the figures on couchdb
    users.get(req.params.username)
        .then(doc => {
            // handle update on couchdb
            let update = req.body
            let newStats = Object.assign({}, doc.stats)

            if (update.type == "game") {
                newStats.gamesPlayed++
            }
            else if (update.type == "win") {
                newStats.gamesWon++
            }
            else if (update.type == "loss") {
                newStats.gamesLost++
            }
            else if (update.type == "save") {
                newStats.quantumSaves++
            }
            else {
                throw new Error('invalid request')
            }
            
            let newDoc = { stats: newStats, _rev: doc._rev }
            doc.stats = Object.assign(doc.stats, newStats)
            users.insert(doc, doc._id)
                .then(doc => res.json(doc))
                .catch(err => console.log(err))
        })
        .catch(err => console.log(error))
})

app.get('/api/getSingleStats/:username', authenticate, (req, res, next) => {
    users.get(req.params.username)
        .then(doc => res.json(doc))
        .catch(err => console.log(err))
})

app.get('/api/getAllStats/', authenticate, (req, res, next) => {
    users.view('users', 'allUsers')
        .then(body => res.json(body))
        .catch(err => console.log(err))
})

app.listen(3000, console.log("server started"))