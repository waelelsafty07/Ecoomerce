const mongoose = require("mongoose");
// Create collection
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name must be required"],
      unique: [true, "Brand name must be unique"],
      minlength: [3, "Brand name must be at least 3 "],
      maxlength: [32, "Brand name must be less than 50 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne, findAll and update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});
// Create Model
const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
