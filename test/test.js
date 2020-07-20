// module imports
const assert = require('chai').assert
const jsdom =  require('jsdom')
require('jsdom-global')()
const { JSDOM } = jsdom;

// other js imports
const client = require("../content/client.js");
const board = require("../content/board.js")
const solver = require("../content/solver.js")

// set the virtual DOM
const html = new JSDOM(`<html lang="en"> 
<head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Quantum Minesweeper</title> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"> <link rel="stylesheet" href="./client.css"> <script src="./board.js"></script> <script src="./client.js"></script> <script src="./solver.js"></script> <script src="http://chaijs.com/chai.js"></script> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> </head> <body> <div class="container-fluid" style="height: 11%; background-color: rgb(38, 46, 83); color: white; margin-bottom: 5%;"> <h1 style="margin-left: 5%;">Quantum Minesweeper</h1> </div><div class="container-fluid align-middle" id="login" style="width: 80%; height: 20%; vertical-align: middle; text-align: center;"> <div class="row"> <div style="height: 100%;" class="col-sm-2"> <p>Log in to play!</p></div><div style="height: 100%;" class="col-sm-3"> <label>Username:</label> <input id="usernameBox" type="text" placeholder="Enter username here..."> </div><div style="height: 100%;" class="col-sm-3"> <label>Password:</label> <input id="passwordBox" type="password" placeholder="Enter password here..."> </div><div style="height: 100%;" class="col-sm-2"> <button id="regButt" class="btn" onclick="registerUser()">Register</button> </div><div style="height: 100%;" class="col-sm-2"> <button id="logButt" class="btn" onclick="loginUser()">Log in</button> </div></div></div><div class="hidden" id="newgame" style="width: 80%; text-align: center;"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-3"> <p>Start a new game of Quantum Minesweeper!</p></div><div class="col-sm-3"> <button id="startGameButt" class="btn" onclick="startGame()">Start</button> </div><div class="col-sm-3"></div></div><div class="row align-middle" style="padding-top: 10%;"> <div class="col-sm-4"></div><div class="col-sm-4"> <h5>Game Options</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2"> <label>Board Size:</label> </div><div class="col-sm-2"> <select id="boardSizeChoice"> <option>Extra Small (5 x 5)</option> <option>Small (8 x 7)</option> <option>Medium (13 x 9)</option> <option>Large (20 x 12)</option> <option>Extra Large (30 x 16)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2"> <label>Number of Mines:</label> </div><div class="col-sm-2"> <select id="mineChoice"> <option>Minimum (0.7x)</option> <option>Normal (1.0x)</option> <option>Maximum (1.3x)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle" style="padding-top: 10%;"> <div class="col-sm-4"></div><div class="col-sm-4"> <h5>Additional Features</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2"> <label>Mine Vision:</label> </div><div class="col-sm-2"> <input type="checkbox" id="mineVisionCheck"></input> </div><div class="col-sm-4"></div></div></div><div class="hidden" id="hotbar"> <div class="row"> <div class="col-sm-3"></div><div class="col-sm-2" style="text-align: center;"> <p id="scoreDisplay">Mines left: 0</script></p></div><div class="col-sm-2" style="text-align: center;"> <p id="activeGame">Active Game</p></div><div class="col-sm-2" style="text-align: center;"> <p id="gameTimer">Time Elapsed: 0</p></div><div class="col-sm-3"></div></div></div><div class="hidden" id="replayDisplay"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-6"> <p id="replayText" style="text-align: center;">Game state before solver begins</p></div><div class="col-sm-3"></div></div><div class="row align-middle" style="padding-bottom: 1%;"> <div class="col-sm-4"></div><div class="col-sm-1" style="text-align: center;"> <button id="leftArrow" class="btn" onclick="" style="opacity:0.5;"><</button> </div><div class="col-sm-2" style="text-align:center; align-items: center;"> <p id="tilesSolved" style="padding-top: 8px;">Tiles solved: 0</p></div><div class="col-sm-1" style="text-align: center;"> <button id="rightArrow" class="btn" onclick="solver.changeMove(1)">></button> </div><div class="col-sm-4"></div></div></div><div class="hidden" id="gameboard" style="text-align: center; margin-bottom: 2.5%;"> <table id="boardTable"> </table> </div><div class="hidden" id="homeButt" style="text-align: center; height: 5%; margin-bottom: 2.5%;"> <button class="btn" onclick="backHome()">Return to Menu</button> <button class="hidden" id="replayButt" onclick="showReplay()">See the solver's actions</button> </body></html>`)
global.window = html.window
global.document = html.window.document

console.log(document.getElementById("newgame").getAttribute("class"))

// testing client.js

describe('currentUser', () => {
    startGame = client.startGame
    startGame()
    let currentUser = client.currentUser
    it('should be an object with two properties', () => {
        assert.equal(Object.keys(currentUser).length, 2, `currentUser should
            have two properties.`);
        assert.isObject(currentUser, "currentUser should be an object");
    })
    it('should have a username property that is a string', () => {
        assert.typeOf(currentUser.username, "string", "currentUser.username should be a string");
    })
    it('should have a password property that is a string', () => {
        assert.typeOf(currentUser.password, "string", "currentUser.password should be a string");
    })
})
describe('currentGame', () => {
    it('should be an object')
})