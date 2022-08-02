const mongoose = require("mongoose");
// Create collection
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name must be required"],
      unique: [true, "Category name must be unique"],
      minlength: [3, "Category name must be at least 3 "],
      maxlength: [32, "Category name must be less than 50 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    priority: String,
    image: String,
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne, findAll and update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});
// Create Model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
