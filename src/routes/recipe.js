const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const multer = require("../middlewares/uploadFotos");
const verifyToken = require("../middlewares/verifyToken");
const fs = require("fs");

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

//Feito
//Search one recipe
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById({ _id: req.params.id })
      .populate("author", "username")
      .populate("_id")
      .sort({ createdAt: -1 });
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

//Feito
router.post("/", multer.single("img"), verifyToken, async (req, res) => {
  const { title, description, category, level, preparation, ingredients, time } = req.body;
  try {
    const recipe = new Recipe({
      title,
      description,
      img: req.file.path,
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
router.put("/:id", multer.single("img"), verifyToken, async (req, res) => {
  try {
    const updateRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
        img: req.file.path,
      },
    )
    fs.unlink(updateRecipe.img, () => { })
    const findNewRecipe = await Recipe.findById(req.params.id)
    return res.status(200).json({ findNewRecipe });
  } catch (e) {
    return res.status(404).json({ message: "Erro ao atualizar" });
  }
});

//feito
//Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    recipeDelete = await Recipe.findById(req.params.id)
    fs.unlink(recipeDelete.img, () => { })
    result = await Recipe.findByIdAndDelete(req.params.id)
    if (result == null) return res.status(400).json({ "message": "Id inexistente" })
    res.status(200).json({ message: "Deletado com sucesso!" })
  } catch {
    res.status(400).json({ message: "Erro ao deletar" })
  }
});

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

//Receitas favoritas
router.get("/favorites/:id", verifyToken, async(req, res) => {
  try{
    const favoritesRecipes = await Recipe.find({likes: req.params.id})
    res.status(200).json(favoritesRecipes)
  }catch{
    res.status(400).json({ "message": "Erro ao listar favoritos" })
  }
})

module.exports = router;

