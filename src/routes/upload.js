const express = require("express");
const multer = require("../middlewares/uploadFotos");
const { addImage } = require("../controllers/uploadController");

const router = express.Router();

router.post("/upload", multer.single("file"), addImage);

module.exports.routes = router;
