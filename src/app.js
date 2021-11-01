const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const User = require('./routes/user')
const Recipe = require("./routes/recipe")

require('./config/database') 

const app = express()

app.use(cors())
app.use(express.json())

dotenv.config()

app.use("/users", User)

app.use("/recipe", Recipe)
app.use("/uploads", express.static('uploads'))

app.listen(process.env.PORT || 3001, () => {
    console.log("App running: " + 3001)
})