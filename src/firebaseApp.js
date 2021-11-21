const firebase = require("firebase/compat/app");
const config = require("./config");

const firebaseApp = firebase.initializeApp(config.firebaseConfig);


module.exports = firebaseApp;
