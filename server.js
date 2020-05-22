const express = require('express');
const app = express();
const bodyparser = require('body-parser');

app.use(express.static("content"))
app.use(bodyparser.json())
app.use(express.json())


app.listen(3000, console.log("server started"))