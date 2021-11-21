const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imgUrl: { type: String, required: true },
    imgName: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    preparation: { type: Array, required: true },
    ingredients: { type: String, required: true },
    time: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
