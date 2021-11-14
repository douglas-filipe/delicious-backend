const multer = require("multer");
const storage = multer.memoryStorage();
module.exports = multer({
  storage: storage,
  limits: 1024 * 1024,
  fileFilter: (req, file, cb) => {
    const isAccepted = ["image/png", "image/jpg", "image/jpeg"].find(
      (formatoAceito) => formatoAceito == file.mimetype
    );
    if (isAccepted) {
      return cb(null, true);
    }
    return cb(null, false);
  },
});
