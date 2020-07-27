(function () {
    const dbURL = "localhost:2222" // *EDIT HERE*
    const username = "crr3" // *EDIT HERE*
    const password = "Rfp3tbHP" // *EDIT HERE*
    var db_info = {
        url: dbURL,
        username: username,
        password: password,
        userDatabase: 'sweepers'
    };
    if (typeof __dirname != 'undefined') {
        module.exports = db_info;
    }
}())