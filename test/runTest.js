// module imports
const assert = require('chai').assert
const jsdom =  require('jsdom')
const concat = require('concat')
require('jsdom-global')()
const { JSDOM } = jsdom;

// this delay allows all files to load before any testing is carried out.
// it also makes the tests readable as they're being done which is interesting.
beforeEach(done => setTimeout(done, 150));

// this resets the HTML so we can test multiple functions in the same suite
// otherwise the results of the functions can get confused by each other
afterEach(() => {
    html = new JSDOM(`<html lang="en"> 
        <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Quantum Minesweeper</title> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"> <link rel="stylesheet" href="./client.css"> <link rel="icon" href="./favicon/favicon.ico" type="image/x-icon"> <link rel="apple-touch-icon" sizes="180x180" href="./favicon/apple-touch-icon.png"> <link rel="icon" type="image/png" sizes="32x32" href="./favicon/favicon-32x32.png"> <link rel="icon" type="image/png" sizes="16x16" href="./favicon/favicon-16x16.png"> <link rel="manifest" href="./favicon/site.webmanifest"> <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/8.0.1/mocha.min.js"></script> <script src="http://chaijs.com/chai.js"></script> <script src="./client.js"></script> <script src="./board.js"></script> <script src="./solver.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/8.0.1/mocha.min.js"></script> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> </head> <body> <div class="container-fluid" style="height: 11%; background-color: rgb(38, 46, 83); color: white; margin-bottom: 2%;"> <h1 style="margin-left: 5%;">Quantum Minesweeper</h1> </div><div class="container-fluid align-middle" id="login" style="width: 80%; height: 20%; vertical-align: middle; text-align: center;"> <div class="row"> <div class="col-sm-2"> <p>Log in to play!</p></div><div class="col-sm-3"> <label>Username:</label> <input id="usernameBox" type="text" placeholder="Enter username here..."> </div><div class="col-sm-3"> <label>Password:</label> <input id="passwordBox" type="password" placeholder="Enter password here..."> </div><div class="col-sm-2"> <button id="regButt" class="btn" onclick="registerUser()">Register</button> </div><div class="col-sm-2"> <button id="logButt" class="btn" onclick="loginUser()">Log in</button> </div></div></div><div class="hidden" id="newgame" style="width: 80%; text-align: center;"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-3" style="margin: auto;"> <p style="vertical-align: middle;">Start a new game of Quantum Minesweeper!</p></div><div class="col-sm-3" style="margin: auto;"> <button id="startGameButt" class="btn" onclick="startGame()">Start</button> </div><div class="col-sm-3"></div></div><div class="row align-middle"> <div class="col-sm-2"></div><div class="col-sm-2" style="margin: auto;"> <p style="padding-top: 8.5px;">View your Stats!</p></div><div class="col-sm-2" style="margin: auto;"> <button id="viewStatsButt" class="btn" onclick="viewStats('single')">Stats</button> </div><div class="col-sm-2" style="margin: auto;"> <p style="padding-top: 8.5px;">View the Leaderboard!</p></div><div class="col-sm-2" style="margin: auto;"> <button id="viewLeaderboardButt" class="btn" onclick="viewStats('all')">Leaderboard</button> </div><div class="col-sm-2"></div></div><div class="row align-middle" style="padding-top: 5%;"> <div class="col-sm-4"></div><div class="col-sm-4" style="margin: auto;"> <h5>Game Options</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Board Size:</label> </div><div class="col-sm-2" style="margin: auto;"> <select id="boardSizeChoice"> <option>Extra Small (5 x 5)</option> <option>Small (8 x 7)</option> <option>Medium (13 x 9)</option> <option>Large (20 x 12)</option> <option>Extra Large (30 x 16)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Number of Mines:</label> </div><div class="col-sm-2" style="margin: auto;"> <select id="mineChoice"> <option>Minimum (0.7x)</option> <option>Normal (1.0x)</option> <option>Maximum (1.3x)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle" style="padding-top: 5%; margin: auto;"> <div class="col-sm-4"></div><div class="col-sm-4" style="margin: auto;"> <h5>Additional Features</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Enable Mine Vision:</label> </div><div class="col-sm-2" style="margin: auto;"> <input type="checkbox" id="mineVisionCheck"></input> </div><div class="col-sm-1"> <div class="tooltipShow">? <span class="tooltiptext"> Mine Vision lets you see the inner workings of Quantum Minesweeper. All mines are marked out by their darker colour with this option, and when the quantum safety feature kicks in you get to see how the program has transformed the game board! </span> </div></div><div class="col-sm-3"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2"> <label>Enable Hints:</label> </div><div class="col-sm-2"> <input type="checkbox" id="hintCheck"></input> </div><div class="col-sm-1"> <div class="tooltipShow">? <span class="tooltiptext"> Hints can help you out if you're stuck at a particular point in the game. When you use a hint, your chosen tile will receive one of these three border colors:</br> - <span style="color: green;">Green:</span> Chosen tile is safe to click. Definitely not a mine.</br> - <span style="color: yellow;">Yellow:</span> Chosen tile is safe to click. Might be a mine. Quantum safety will kick in.</br> - <span style="color: red;">Red:</span> Chosen tile is NOT safe to click. Definitely a mine. <strong>Will result in game loss</strong>. </span> </div></div><div class="col-sm-3"></div></div></div><div class="hidden" id="hotbar"> <div class="row"> <div class="col-sm-3"></div><div class="col-sm-2" style="text-align: center;"> <p id="scoreDisplay">Mines left: 0</script></p></div><div class="col-sm-2" style="text-align: center;"> <p id="activeGame">Active Game</p></div><div class="col-sm-2" style="text-align: center;"> <p id="gameTimer">Time Elapsed: 0</p></div><div class="col-sm-3"></div></div></div><div class="hidden" id="replayDisplay"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-6"> <p id="replayText" style="text-align: center;">Game state before solver begins</p></div><div class="col-sm-3"></div></div><div class="row align-middle" style="padding-bottom: 1%;"> <div class="col-sm-4"></div><div class="col-sm-1" style="text-align: center;"> <button id="leftArrow" class="btn" onclick="" style="opacity:0.5;"><</button> </div><div class="col-sm-2" style="text-align:center; align-items: center;"> <p id="tilesSolved" style="padding-top: 8px;">Tiles solved: 0</p></div><div class="col-sm-1" style="text-align: center;"> <button id="rightArrow" class="btn" onclick="solver.changeMove(1)">></button> </div><div class="col-sm-4"></div></div></div><div class="hidden" id="gameboard" style="text-align: center; margin-bottom: 1%;"> <table id="boardTable"> </table> </div><div class="hidden" id="statsDisplay" style="text-align: center; margin-bottom: 1%;"> <h5 id="statsHeading"></h5> <table id="statsTable" style="width: 80%; border: 2px solid black; margin: auto;"> </table> </div><div class="hidden" id="homeButt" style="text-align: center; height: 4%; margin-bottom: 1%;"> <button class="btn" onclick="backHome()">Return to Menu</button> <button class="hidden" id="hintButt" onclick="toggleHint()">Use Hint</button> <button class="hidden" id="replayButt" onclick="showReplay()">See the solver's actions</button> </div></body></html>`)
    global.window = html.window
    global.document = html.window.document
})
// initialise imports variable
let importJS

// set the virtual DOM
let html = new JSDOM(`<html lang="en"> 
<head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Quantum Minesweeper</title> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"> <link rel="stylesheet" href="./client.css"> <link rel="icon" href="./favicon/favicon.ico" type="image/x-icon"> <link rel="apple-touch-icon" sizes="180x180" href="./favicon/apple-touch-icon.png"> <link rel="icon" type="image/png" sizes="32x32" href="./favicon/favicon-32x32.png"> <link rel="icon" type="image/png" sizes="16x16" href="./favicon/favicon-16x16.png"> <link rel="manifest" href="./favicon/site.webmanifest"> <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/8.0.1/mocha.min.js"></script> <script src="http://chaijs.com/chai.js"></script> <script src="./client.js"></script> <script src="./board.js"></script> <script src="./solver.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/8.0.1/mocha.min.js"></script> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> </head> <body> <div class="container-fluid" style="height: 11%; background-color: rgb(38, 46, 83); color: white; margin-bottom: 2%;"> <h1 style="margin-left: 5%;">Quantum Minesweeper</h1> </div><div class="container-fluid align-middle" id="login" style="width: 80%; height: 20%; vertical-align: middle; text-align: center;"> <div class="row"> <div class="col-sm-2"> <p>Log in to play!</p></div><div class="col-sm-3"> <label>Username:</label> <input id="usernameBox" type="text" placeholder="Enter username here..."> </div><div class="col-sm-3"> <label>Password:</label> <input id="passwordBox" type="password" placeholder="Enter password here..."> </div><div class="col-sm-2"> <button id="regButt" class="btn" onclick="registerUser()">Register</button> </div><div class="col-sm-2"> <button id="logButt" class="btn" onclick="loginUser()">Log in</button> </div></div></div><div class="hidden" id="newgame" style="width: 80%; text-align: center;"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-3" style="margin: auto;"> <p style="vertical-align: middle;">Start a new game of Quantum Minesweeper!</p></div><div class="col-sm-3" style="margin: auto;"> <button id="startGameButt" class="btn" onclick="startGame()">Start</button> </div><div class="col-sm-3"></div></div><div class="row align-middle"> <div class="col-sm-2"></div><div class="col-sm-2" style="margin: auto;"> <p style="padding-top: 8.5px;">View your Stats!</p></div><div class="col-sm-2" style="margin: auto;"> <button id="viewStatsButt" class="btn" onclick="viewStats('single')">Stats</button> </div><div class="col-sm-2" style="margin: auto;"> <p style="padding-top: 8.5px;">View the Leaderboard!</p></div><div class="col-sm-2" style="margin: auto;"> <button id="viewLeaderboardButt" class="btn" onclick="viewStats('all')">Leaderboard</button> </div><div class="col-sm-2"></div></div><div class="row align-middle" style="padding-top: 5%;"> <div class="col-sm-4"></div><div class="col-sm-4" style="margin: auto;"> <h5>Game Options</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Board Size:</label> </div><div class="col-sm-2" style="margin: auto;"> <select id="boardSizeChoice"> <option>Extra Small (5 x 5)</option> <option>Small (8 x 7)</option> <option>Medium (13 x 9)</option> <option>Large (20 x 12)</option> <option>Extra Large (30 x 16)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Number of Mines:</label> </div><div class="col-sm-2" style="margin: auto;"> <select id="mineChoice"> <option>Minimum (0.7x)</option> <option>Normal (1.0x)</option> <option>Maximum (1.3x)</option> </select> </div><div class="col-sm-4"></div></div><div class="row align-middle" style="padding-top: 5%; margin: auto;"> <div class="col-sm-4"></div><div class="col-sm-4" style="margin: auto;"> <h5>Additional Features</h5> </div><div class="col-sm-4"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2" style="margin: auto;"> <label>Enable Mine Vision:</label> </div><div class="col-sm-2" style="margin: auto;"> <input type="checkbox" id="mineVisionCheck"></input> </div><div class="col-sm-1"> <div class="tooltipShow">? <span class="tooltiptext"> Mine Vision lets you see the inner workings of Quantum Minesweeper. All mines are marked out by their darker colour with this option, and when the quantum safety feature kicks in you get to see how the program has transformed the game board! </span> </div></div><div class="col-sm-3"></div></div><div class="row align-middle"> <div class="col-sm-4"></div><div class="col-sm-2"> <label>Enable Hints:</label> </div><div class="col-sm-2"> <input type="checkbox" id="hintCheck"></input> </div><div class="col-sm-1"> <div class="tooltipShow">? <span class="tooltiptext"> Hints can help you out if you're stuck at a particular point in the game. When you use a hint, your chosen tile will receive one of these three border colors:</br> - <span style="color: green;">Green:</span> Chosen tile is safe to click. Definitely not a mine.</br> - <span style="color: yellow;">Yellow:</span> Chosen tile is safe to click. Might be a mine. Quantum safety will kick in.</br> - <span style="color: red;">Red:</span> Chosen tile is NOT safe to click. Definitely a mine. <strong>Will result in game loss</strong>. </span> </div></div><div class="col-sm-3"></div></div></div><div class="hidden" id="hotbar"> <div class="row"> <div class="col-sm-3"></div><div class="col-sm-2" style="text-align: center;"> <p id="scoreDisplay">Mines left: 0</script></p></div><div class="col-sm-2" style="text-align: center;"> <p id="activeGame">Active Game</p></div><div class="col-sm-2" style="text-align: center;"> <p id="gameTimer">Time Elapsed: 0</p></div><div class="col-sm-3"></div></div></div><div class="hidden" id="replayDisplay"> <div class="row align-middle"> <div class="col-sm-3"></div><div class="col-sm-6"> <p id="replayText" style="text-align: center;">Game state before solver begins</p></div><div class="col-sm-3"></div></div><div class="row align-middle" style="padding-bottom: 1%;"> <div class="col-sm-4"></div><div class="col-sm-1" style="text-align: center;"> <button id="leftArrow" class="btn" onclick="" style="opacity:0.5;"><</button> </div><div class="col-sm-2" style="text-align:center; align-items: center;"> <p id="tilesSolved" style="padding-top: 8px;">Tiles solved: 0</p></div><div class="col-sm-1" style="text-align: center;"> <button id="rightArrow" class="btn" onclick="solver.changeMove(1)">></button> </div><div class="col-sm-4"></div></div></div><div class="hidden" id="gameboard" style="text-align: center; margin-bottom: 1%;"> <table id="boardTable"> </table> </div><div class="hidden" id="statsDisplay" style="text-align: center; margin-bottom: 1%;"> <h5 id="statsHeading"></h5> <table id="statsTable" style="width: 80%; border: 2px solid black; margin: auto;"> </table> </div><div class="hidden" id="homeButt" style="text-align: center; height: 4%; margin-bottom: 1%;"> <button class="btn" onclick="backHome()">Return to Menu</button> <button class="hidden" id="hintButt" onclick="toggleHint()">Use Hint</button> <button class="hidden" id="replayButt" onclick="showReplay()">See the solver's actions</button> </div></body></html>`)
global.window = html.window
global.document = html.window.document

// concatenate the current version of the JS from content.js
concat(["./content/client.js", "./content/board.js", "./content/solver.js"], "./test/importedCode.js")
    .then(result => importJS = fetchImports())
    .then(result => assignVars())
    .catch(err => console.log(err))

const fetchImports = () => {
    // import the code from importedCode.js
    let returnObj = require("./importedCode.js")
    return returnObj
}

// vars to be imported
let currentUser
let currentGame
let allMineNeighbours
let startGame
let backHome
let endGame
let winGame
let makeBoard
let setNeighbours
let mineTest
let getTextColor
let resolveBoard
let solver

// import.js variables
const assignVars = () => {
    currentUser = importJS.currentUser
    currentGame = importJS.currentGame
    allMineNeighbours = importJS.allMineNeighbours
    startGame = importJS.startGame
    backHome = importJS.backHome
    endGame = importJS.endGame
    winGame = importJS.winGame
    makeBoard = importJS.makeBoard
    setNeighbours = importJS.setNeighbours
    mineTest = importJS.mineTest
    getTextColor = importJS.getTextColor
    resolveBoard = importJS.resolveBoard
    solver = importJS.solver
}

// note that for this project there will be no testing of server.js, 
// though this would be necessary in a deployment setting

// start of client.js testing

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
describe('allMineNeighbours', () => {
    it('should be an array', () => {
        assert.isArray(allMineNeighbours, "allMineNeighbours should be an array");
    })
})

// call startGame to test this function
describe('startGame', () => {
    it('should be a function', () => {
        assert.isFunction(startGame, "startGame should be a function");
    })
    it('should fulfil all unit tests within the startGame function', () => {
        startGame()
    })
})
describe('backHome', () => {
    it('should be a function', () => {
        assert.isFunction(backHome, "backHome should be a function");
    })
    it('should fulfil all unit tests within the backHome function', () => {
        backHome()
    })
})

describe('endGame', () => {
    it('should be a function', () => {
        assert.isFunction(endGame, "endGame should be a function");
    })
    it('should fulfil all unit tests within the endGame function', () => {
        endGame()
    })
})

describe('winGame', () => {
    it('should be a function', () => {
        assert.isFunction(winGame, "winGame should be a function");
    })
    it('should fulfil all unit tests within the winGame function', () => {
        currentGame.boardSize = "xl"
        currentGame.startMines = 99
        makeBoard()
        let allMines = document.querySelectorAll(".mine")
        allMines.forEach(mine => {
            let parent = mine.parentElement

            // Display a flag in the square
            let flag = document.createElement("img")
            flag.src = "./img/flag.png"
            flag.setAttribute("class", "flag")
            flag.style = "height: 100%; width: auto;"
            parent.appendChild(flag)
        })
        winGame()
    })
})

// end of client.js testing (not testing anything with HTTP requests)

// start of board.js testing

describe('makeBoard', () => {
    it('should be a function', () => {
        assert.isFunction(makeBoard, "makeBoard should be a function");
    })
    it('should fulfil all unit tests within the makeBoard function', () => {
        currentGame.boardSize = 'xl'
        currentGame.startMines = 99
    })
})

describe('setNeighbours', () => {
    it('should be a function', () => {
        assert.isFunction(setNeighbours, "setNeighbours should be a function");
    })
    it('should fulfil all unit tests within the setNeighbours function', () => {
        currentGame.boardSize = "xl"
        currentGame.startMines = 99
        makeBoard()
        let foundMine = document.querySelector(".mine")
        let mineSquare = foundMine.parentElement
        solver.test(mineSquare)
    })
})

describe('mineTest', () => {
    it('should be a function', () => {
        assert.isFunction(mineTest, "mineTest should be a function");
    })
    it(`should return undefined if given a tile that is revealed or using hints 
        and you right click`, () => {
        currentGame.boardSize = "xl"
        currentGame.startMines = 99
        makeBoard()
        let chosenTile
        let allTiles = document.querySelectorAll(".mineSquare")
        allTiles.forEach(tile => {
            if (tile.childNodes.length == 0 && !tile.revealed) {
                chosenTile = tile;
            }
        })

        chosenTile.revealed = true
        assert.isFalse(mineTest(chosenTile, "left"), `mineTest should return false
            if you left click a revealed tile`)

        currentGame.hint = true;
        assert.isFalse(mineTest(chosenTile, "right"), `mineTest should return false
            if you right click a tile while using a hint`);
    })
    it('should return false if you left click a tile contains a flag', () => {
        currentGame.boardSize = "xl"
        currentGame.startMines = 99
        makeBoard()
        let chosenMineTile
        let chosenSafeTile
        let allTiles = document.querySelectorAll(".mineSquare")
        allTiles.forEach(tile => {
            if (tile.childNodes.length > 0) {
                chosenMineTile = tile;
            }
            else if (tile.childNodes.length == 0) {
                chosenSafeTile = tile;
            }
        })

        // Display a flag in the square
        let flag = document.createElement("img")
        flag.src = "./img/flag.png"
        flag.setAttribute("class", "flag")
        flag.style = "height: 100%; width: auto;"
        chosenMineTile.appendChild(flag)
        chosenSafeTile.appendChild(flag)

        assert.isUndefined(mineTest(chosenMineTile, "left"), `If a flag is placed over a mine,
            a left click should cause mineTest to return undefined`)
        assert.isUndefined(mineTest(chosenSafeTile, "left"), `If a flag is incorrectly placed,
            a left click should cause mineTest to return undefined`)
    })

    // should probably test if the above tests *don't* change the board
    it('should fulfil all unit tests within mineTest', () => {
        currentGame.boardSize = "xl"
        currentGame.startMines = 99
        makeBoard()
        let allTiles = document.querySelectorAll(".mineSquare")
        let safeSquare
        let mineSquare
        let foundTiles = false
        allTiles.forEach(tile => {
            if (!foundTiles) {
                if (tile.childNodes.length > 0) {
                    mineSquare = tile;
                    if (safeSquare != undefined && mineSquare != undefined) {
                        foundTiles = true;
                    }
                }
                else if (tile.childNodes.length == 0) {
                    safeSquare = tile;
                    if (safeSquare != undefined && mineSquare != undefined) {
                        foundTiles = true;
                    }
                }
            }
        })
        mineTest(safeSquare, "left")
        mineTest(safeSquare, "right")
        // mineTest(mineSquare, "left") - this option is left out for now
            // because it will be handled in solver testing
        mineTest(mineSquare, "right")
    })
})