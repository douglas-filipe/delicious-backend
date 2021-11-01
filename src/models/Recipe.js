const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    preparo: String,
    ingredientes: String,
    tempo: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Revenue", recipeSchema);
