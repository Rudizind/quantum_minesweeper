const assert = chai.assert;

// test the currentUser object
describe('currentUser', () => {
    it('should have ONLY two properties, called "username" and "password"', () => {
        assert.hasAllKeys(currentUser, ["username", "password"], `currentUser 
            must only have two properties called "username" and "password"`)
    })
    it('should have a string for the username property value', () => {
        assert.typeOf(currentUser.username, "string", "username must be a string");
    })
    it('should have a string for the password property value', () => {
        assert.typeOf(currentUser.password, "string", "password must be a string");
    })
})

describe('allMineNeighbours', () => {
    it('should start as an empty array', () => {
        assert.isArray(allMineNeighbours, "allMineNeighbours must be an array");
        assert.lengthOf(allMineNeighbours, 0, "allMineNeighbours should start empty");
    })
})

describe('registerUser', () => {
    // testing this will involve setting up a test circuit on node.js
    // this is not a priority here
})

describe('loginUser', () => {
    // testing this will involve setting up a test circuit on node.js
    // this is not a priority here
})

describe('startGame', () => {
    it('should be a function', () => {
        assert.isFunction(startGame, "startGame should be a function");
    })

    // call the function with the test argument as true
    // so we can have all appropriate vars returned 
    let testVars = startGame(true)
    console.log(testVars)
    
    // test boardSize within startGame
    describe('boardSize', () => {
        it('should start as undefined', () => {
            assert.equal(testVars.boardSize1, undefined, "boardSize should start undefined");
        })
        it ('should later equal "m"', () => {
            assert.equal(testVars.boardSize2, "m",
                'boardSize should resolve to "m" for the test')
        })
    })

    describe('currentGame', () => {
        it('should start as an empty object', () => {
            assert.isObject(currentGame, "currentGame should be an object");
        })
    })
})