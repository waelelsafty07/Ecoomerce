const mongoose = require("mongoose");
// Create collection
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name must be required"],
      unique: [true, "SubCategory name must be unique"],
      minlength: [3, "SubCategory name must be at least 3 "],
      maxlength: [32, "SubCategory name must be less than 50 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Category name must be required"],
    },
    image: String,
  },
  {
    timestamps: true,
  }
);
// Create Model
const subCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = subCategoryModel;
