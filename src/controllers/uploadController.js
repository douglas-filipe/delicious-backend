const firebase = require("../firebaseApp");
require("firebase/compat/storage");

const storage = firebase.storage().ref();

global.XMLHttpRequest = require("xhr2");

const addImage = async (req, res) => {
  try {
    const file = req.file;

    const timestamp = Date.now();
    const name = file.originalname.split(".")[0];
    const type = file.originalname.split(".")[1];
    const fileName = `${name}_${timestamp}.${type}`;

    const imageRef = storage.child(fileName);
    const snapshot = await imageRef.put(file.buffer);
    const downloadURL = await snapshot.ref.getDownloadURL();
    res.status(201).send({ url: downloadURL });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Check file format or size" });
  }
};

module.exports = {
  addImage,
};
