
 (function() {
    const dbURL = "localhost:2222"
    const username = "crr3"
    const password = "Rfp3tbHP"
    var db_info = {
        url: dbURL, 
        username: username,
        password: password,
        userDatabase: 'sweepers'
    };
    if (typeof __dirname != 'undefined'){
        module.exports = db_info;
    }
}())