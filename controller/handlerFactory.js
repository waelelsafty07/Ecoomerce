const asyncHandler = require("express-async-handler");
const APIError = require("../utils/APIError");
const APIFeatures = require("../utils/APIFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new APIError(`No brand for this id${id}`, 400));
    }
    document.remove();
    res.status(204).send();
  });
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new APIError(`No Document for this id${req.params.id}`, 400));
    }
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });

exports.getOne = (Model, populateOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = await Model.findById(id);
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    const document = await query;
    if (!document) {
      return next(new APIError(`No Document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await Model.countDocuments();
    const APIFeature = new APIFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = APIFeature;
    let documents = await mongooseQuery;

    if (modelName === "Products") {
      if (res.locals.user) {
        const userWishlist = res.locals.user.wishlist;
        documents = documents.map((doc) => {
          if (userWishlist.includes(doc._id)) doc.isFav = true;
          return doc;
        });
      }
    }

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
