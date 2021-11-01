const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const multer = require("../middlewares/uploadFotos");
const verifyToken = require("../middlewares/verifyToken");
const fs = require("fs");

router.get("/", async (req, res) => {
  try {
    const recipe = await Recipe.find()
      .populate("author", "username")
      .populate("_id")
      .sort({ createdAt: -1 });
    res.status(200).json(recipe);
  } catch (e) {
    res.status(500).json({ error: "Not found" });
  }
});

//Search By Category
router.get("/:category", async (req, res) => {
  const category = req.params.category;
  console.log(category);
  try {
    const recipe = await Recipe.find({ category: category });
    res.status(200).json(recipe);
  } catch (e) {
    res.status(500).json({ error: "Problem to get a category" });
  }
});

router.get("/search", async (req, res) => {
  const query = req.query.title;
  try {
    const recipe = await Recipe.find({
      title: { $regex: query, $options: "i" },
    });
    //$text: { $search: query },
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", multer.single("img"), verifyToken, async (req, res) => {
  const { title, description, category, level } = req.body;
  try {
    const recipe = new Recipe({
      title,
      description,
      img: req.file.path,
      category,
      level,
      author: req.user._id,
    });
    await recipe.save();
    return res.status(201).json({ recipe });
  } catch (e) {
    return res.status(400).json({ message: "Erro" });
  }
});

router.get("/:user", async (req, res) => {
  const userId = req.params.user;
  try {
    const recipe = await Recipe.find({ author: userId })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Problem to get a recipe" });
  }
});

//Update
router.put("/:id", multer.single("img"), verifyToken, async (req, res) => {
  try {
    const updateRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
        img: req.file.path,
      },
    )
    fs.unlink(updateRecipe.img, () => {})
    const findNewRecipe = await Recipe.findById(req.params.id)
    return res.status(200).json({ findNewRecipe });
  } catch (e) {
    return res.status(404).json({message: "Erro ao atualizar"});
  }
});

//Delete
router.delete("/:id", verifyToken, async (req, res) => {
  Recipe.findByIdAndDelete(req.params.id, (error, result) => {
    console.log(result)
    return "Teste"
  })
  /*await Recipe.findOneAndDelete({ _id: req.params.id }).exec((err, item)=>{
    if(err){
      return res.status(404).json({msg: "Erro ao processar"})
    }
    try{
      fs.unlink(item.img, () => {})
      return res.status(200).json("Ok");
    }catch{
      return res.status(404).json({msg: "Não encontrado"})
    }

  })*/
});

module.exports = router;

/**
 * const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
  fileFilter: (req, file, cb) => {
    const isAccepted = ["image/png", "image/jpg", "image/jpeg"].find(
      (formatoAceito) => formatoAceito == file.mimetype
    );
    if (isAccepted) {
      // Executamos o callback com o segundo argumento true (validação aceita)
      return cb(null, true);
    }

    // Se o arquivo não bateu com nenhum aceito, executamos o callback com o segundo valor false (validação falhouo)
    return cb(null, false);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
 */
