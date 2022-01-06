const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const verifyToken = require("../middlewares/verifyToken");
const fs = require("fs");
const multer = require('../middlewares/uploadFotos')
const firebase = require("../firebaseApp")
require("firebase/compat/storage");
const storage = firebase.storage().ref();


//Feito
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

router.get("/first", async (req, res) => {
  try {
    const recipe = await Recipe.find()
      .populate("author", "username")
      .populate("_id")
      .sort({ createdAt: -1 })
      .limit(3)
    res.status(200).json({ data: recipe });
  } catch (e) {
    res.status(500).json({ error: "Not found" });
  }
});

//Feito
//Search one recipe
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById({ _id: req.params.id })
      .populate("author", "username")
      .populate("_id")
    res.status(200).json(recipe);
  } catch (e) {
    res.status(500).json({ error: "Not found" });
  }
});

//Feito
//Search By Category
router.get("/category/:name_category", async (req, res) => {
  const category = req.params.name_category;
  try {
    const recipe = await Recipe.find({ category: category });
    res.status(200).json(recipe);
  } catch (e) {
    res.status(500).json({ error: "Problem to get a category" });
  }
});

//Feito
router.get("/search", async (req, res) => {
  const query = req.query.title;
  try {
    const recipe = await Recipe.find({
      title: { $regex: query, $options: "i" },
    });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

//Feito
router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const recipe = await Recipe.find({ author: userId })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Problem to get a recipe" });
  }
});

//Feito multer.single("img")
router.post("/", verifyToken, multer.single('img'), async (req, res) => {

  const file = req.file;

  if (!file) {
    return res.status(400).json({ "message": "Insira uma imagem" })
  }

  const timestamp = Date.now();
  const name = file.originalname.split(".")[0];
  const type = file.originalname.split(".")[1];
  const fileName = `${name}_${timestamp}.${type}`;

  const imageRef = storage.child(fileName);
  const snapshot = await imageRef.put(file.buffer);
  const downloadURL = await snapshot.ref.getDownloadURL();

  const { title, description, category, level, preparation, ingredients, time } = req.body;
  try {
    const recipe = new Recipe({
      title,
      description,
      imgUrl: downloadURL,
      imgName: fileName,
      category,
      level,
      author: req.user._id,
      preparation,
      ingredients,
      time
    });
    await recipe.save();
    return res.status(201).json({ recipe });
  } catch (e) {
    fs.unlink(req.file.path, () => { })
    return res.status(400).json({ message: "Erro" });
  }
});

//feito
//Update
//, multer.single("img")
router.put("/:id", verifyToken, multer.single('img'), async (req, res) => {

  const file = req.file;

  if (!file) {
    return res.status(400).json({ "message": "Insira uma imagem" })
  }

  const timestamp = Date.now();
  const name = file.originalname.split(".")[0];
  const type = file.originalname.split(".")[1];
  const fileName = `${name}_${timestamp}.${type}`;

  const imageRef = storage.child(fileName);
  const snapshot = await imageRef.put(file.buffer);
  const downloadURL = await snapshot.ref.getDownloadURL();

  try {
    recipeDelete = await Recipe.findById(req.params.id)
    const desertRef = await storage.child(recipeDelete.imgName)
    await desertRef.delete()
    const updateRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
        imgUrl: downloadURL,
        imgName: fileName,
      },
      {new: true}
    )
    return res.status(200).json({ updateRecipe });
  } catch (e) {
    const desertRef = await storage.child(fileName)
    await desertRef.delete()
    return res.status(404).json({ message: "Receita não encontrada" });
  }
});

//feito
//Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    recipeDelete = await Recipe.findById(req.params.id)
    const desertRef = await storage.child(recipeDelete.imgName)
    await desertRef.delete()
    result = await Recipe.findByIdAndDelete(req.params.id)
    if (result == null) return res.status(400).json({ "message": "Id inexistente" })
    res.status(200).json({ message: "Deletado com sucesso!" })
  } catch {
    res.status(400).json({ message: "Erro ao deletar" })
  }
});

//Feito
//Like / Deslike
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
    if (!recipe.likes.includes(req.body.userId)) {
      await recipe.updateOne({ $push: { likes: req.body.userId } })
      res.status(200).json({ "message": "Adicionado aos favoritos" })
    } else {
      await recipe.updateOne({ $pull: { likes: req.body.userId } })
      res.status(200).json({ "message": "Removido dos favoritos" })
    }
  } catch {
    res.status(400).json({ "message": "Erro ao adicionar aos favoritos" })
  }
})

//Feito
//Receitas favoritas
router.get("/favorites/:id", verifyToken, async (req, res) => {
  try {
    const favoritesRecipes = await Recipe.find({ likes: req.params.id })
      .populate("author", "username")
      .populate("_id")
    res.status(200).json(favoritesRecipes)
  } catch {
    res.status(400).json({ "message": "Erro ao listar favoritos" })
  }
})

module.exports = router;

