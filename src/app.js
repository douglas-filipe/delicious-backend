const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const User = require('./routes/user')
const Recipe = require("./routes/recipe")
const Comment = require("./routes/comment")
const swaggerDocs = require("./swagger.json")
const swaggerUi = require('swagger-ui-express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect(process.env.MONGO)
  .then(()=>{
    console.log("DB running")
  })
  .catch((e)=>{
    console.log(e)
  })

app.use(cors())
app.use(express.json())

dotenv.config()

const DisableTryItOutPlugin = function () {
    return {
      statePlugins: {
        spec: {
          wrapSelectors: {
            allowTryItOutFor: () => () => false,
          },
        },
      },
    };
  };
  
  const options = {
    swaggerOptions: {
      plugins: [DisableTryItOutPlugin],
    },
  };
  
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));  
app.use("/users", User)
app.use("/recipe", Recipe)
app.use("/comment", Comment)

app.use("/uploads", express.static('uploads'))

app.listen(process.env.PORT || 3001, () => {
    console.log("App running: " + 3001)
})