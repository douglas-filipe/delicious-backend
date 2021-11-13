const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const Comment = require("../models/Comment");

//Mostrar comentários por receita
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.find({recipeId: req.params.id})
      .populate("author", "username")
      .populate("_id")
      .sort({ createdAt: -1 });
    res.status(200).json(comment);
  } catch (e) {
    res.status(500).json({ error: "Not found" });
  }
});

//Criar
router.post("/", verifyToken, async (req, res) => {
  const { recipeId, description } = req.body;
  try {
    const comment = new Comment({ author: req.user._id, recipeId, description });
    await comment.save();
    return res.status(201).json({ comment });
  } catch (e) {
    return res.status(400).json({ message: "Error ao adicionar o comentário" });
  }
});

//Atualizar
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updateComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json({ updateComment });
  } catch (e) {
    return res.status(404).json({ message: "Erro ao atualizar" });
  }
});

//Deletar
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    commentDelete = await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deletado com sucesso!" });
} catch {
    res.status(400).json({ message: "Id não existe" });
  }
});

module.exports = router;
