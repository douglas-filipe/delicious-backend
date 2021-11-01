const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/delicious', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('DB running')
}).catch(e=>{
    console.log(e)
})