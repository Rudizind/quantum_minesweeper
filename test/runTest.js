// module imports
const assert = require('chai').assert
const jsdom =  require('jsdom')
const concat = require('concat')
require('jsdom-global')()
const { JSDOM } = jsdom;

// concatenate the current version of the JS from content.js
concat(["./content/client.js", "./content/board.js", "./content/solver.js"], "./test/importedCode.js")

// js imports
let importJS = require("./importedCode.js");

// set the virtual DOM
const html = new JSDOM(`<html lang="en"> 
<head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Quantum Minesweeper</title> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"> <link rel="stylesheet" href="./client.css"> <script src="./board.js"></script> <script src="./client.js"></script> <script src="./solver.js"></script> <script src="http://chaijs.com/chai.js"></script> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> </head> <body> <div class="container-fluid" style="height: 11%; background-color: rgb(38, 46, 83); color: white; margin-bottom: 2%;"> <h1 style="margin-left: 5%;">Quantum Minesweeper</h1> </div><div class="container-fluid align-middle" id="login" style="width: 80%; height: 20%; vertical-align: middle; text-align: center;"> <div class="row"> <div class="col-sm-2"> <p>Log in to play!</p></div><div class="col-sm-3"> <label>Username:</label> <input id="usernameBox" type="text" placeholder="Enter username here..."> </div><div class="col-sm-3"> <label>Password:</label> <input id="passwordBox" type="password" placeholder="Enter password here..."> </div><div class="col-sm-2"> <button id="regButt" class="btn" onclick="registerUser()">Register</button> </div><div class="col-sm-2"> <button id="logButt" class="btn" onclick="loginUser()">Log in</button> </div></div></div><div class="hidden" id="newgame" style="width: 80%; text-align: center;"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-3" style="margin: auto;"> <p style="vertical-align: middle;">Start a new game of Quantum Minesweeper!</p></div><div class="col-sm-3" style="margin: auto;"> <button id="startGameButt" class="btn" onclick="startGame()">Start</button> </div><div class="col-sm-3"></div></div><div class="row align-middle"> <div class="col-sm-2"></div><div class="col-sm-2" style="margin: auto;"> <p style="padding-top: 8.5px;">View your Stats!</p></div><div class="col-sm-2" style="margin: auto;"> <button id="viewStatsButt" class="btn" onclick="viewStats('single')">Stats</button> </div><div class="col-sm-2" style="margin: auto;"> <p style="padding-top: 8.5px;">View the Leaderboard!</p></div><div class="col-sm-2" style="margin: auto;"> <button id="viewLeaderboardButt" class="btn" onclick="viewStats('all')">Leaderboard</button> </div><div class="col-sm-2"></div></div><div class="row align-middle" style="padding-top: 5%;"> <div class="col-sm-4"></div><div class="col-sm-4" style="margin: auto;"> <h5>Game Options</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Board Size:</label> </div><div class="col-sm-2" style="margin: auto;"> <select id="boardSizeChoice"> <option>Extra Small (5 x 5)</option> <option>Small (8 x 7)</option> <option>Medium (13 x 9)</option> <option>Large (20 x 12)</option> <option>Extra Large (30 x 16)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Number of Mines:</label> </div><div class="col-sm-2" style="margin: auto;"> <select id="mineChoice"> <option>Minimum (0.7x)</option> <option>Normal (1.0x)</option> <option>Maximum (1.3x)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle" style="padding-top: 5%; margin: auto;"> <div class="col-sm-4"></div><div class="col-sm-4" style="margin: auto;"> <h5>Additional Features</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Enable Mine Vision:</label> </div><div class="col-sm-2" style="margin: auto;"> <input type="checkbox" id="mineVisionCheck"></input> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2"> <label>Enable Hints:</label> </div><div class="col-sm-2"> <input type="checkbox" id="hintCheck"></input> </div><div class="col-sm-4"></div></div></div><div class="hidden" id="hotbar"> <div class="row"> <div class="col-sm-3"></div><div class="col-sm-2" style="text-align: center;"> <p id="scoreDisplay">Mines left: 0</script></p></div><div class="col-sm-2" style="text-align: center;"> <p id="activeGame">Active Game</p></div><div class="col-sm-2" style="text-align: center;"> <p id="gameTimer">Time Elapsed: 0</p></div><div class="col-sm-3"></div></div></div><div class="hidden" id="replayDisplay"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-6"> <p id="replayText" style="text-align: center;">Game state before solver begins</p></div><div class="col-sm-3"></div></div><div class="row align-middle" style="padding-bottom: 1%;"> <div class="col-sm-4"></div><div class="col-sm-1" style="text-align: center;"> <button id="leftArrow" class="btn" onclick="" style="opacity:0.5;"><</button> </div><div class="col-sm-2" style="text-align:center; align-items: center;"> <p id="tilesSolved" style="padding-top: 8px;">Tiles solved: 0</p></div><div class="col-sm-1" style="text-align: center;"> <button id="rightArrow" class="btn" onclick="solver.changeMove(1)">></button> </div><div class="col-sm-4"></div></div></div><div class="hidden" id="gameboard" style="text-align: center; margin-bottom: 1%;"> <table id="boardTable"> </table> </div><div class="hidden" id="statsDisplay" style="text-align: center; margin-bottom: 1%;"> <h5 id="statsHeading"></h5> <table id="statsTable" style="width: 80%; border: 2px solid black; margin: auto;"> </table> </div><div class="hidden" id="homeButt" style="text-align: center; height: 4%; margin-bottom: 1%;"> <button class="btn" onclick="backHome()">Return to Menu</button> <button class="hidden" id="hintButt" onclick="toggleHint()">Use Hint</button> <button class="hidden" id="replayButt" onclick="showReplay()">See the solver's actions</button> </div></body></html>`)
global.window = html.window
global.document = html.window.document

// make import.js variables
let currentUser = importJS.currentUser
let currentGame = importJS.currentGame
let allMineNeighbours = importJS.allMineNeighbours
const registerUser = importJS.registerUser
const loginUser = importJS.loginUser
const startGame = importJS.startGame
const tickUp = importJS.tickUp
const backHome = importJS.backHome
const endGame = importJS.endGame
const winGame = importJS.winGame
const showReplay = importJS.showReplay
const toggleHint = importJS.toggleHint
const viewStats = importJS.viewStats
const getSingleStats = importJS.getSingleStats
const getAllStats = importJS.getAllStats
const updateStats = importJS.updateStats
const makeBoard = importJS.makeBoard
const setNeighbours = importJS.setNeighbours
const squareChoice = importJS.squareChoice
const mineTest = importJS.mineTest
const getTextColor = importJS.getTextColor
const resolveBoard = importJS.resolveBoard
const solver = importJS.solver

// note that for this project there will be no testing of server.js, 
// though this would be necessary in a deployment setting

describe('currentUser', () => {
    it('should be an object with three properties', () => {
        assert.equal(Object.keys(currentUser).length, 3, `currentUser should
            have two properties.`);
        assert.isObject(currentUser, "currentUser should be an object");
    })
    it('should have a username property that is a string', () => {
        assert.typeOf(currentUser.username, "string", "currentUser.username should be a string");
    })
    it('should have a password property that is a string', () => {
        assert.typeOf(currentUser.password, "string", "currentUser.password should be a string");
    })
    it('should have a stats property that is an object', () => {
        assert.typeOf(currentUser.stats, "object", "currentUser.stats should be an object");
    })
})

describe('currentGame', () => {
    it('should be an object', () => {
        assert.isObject(currentGame, "currentGame should be an object");
    })
})

describe('startGame', () => {

})