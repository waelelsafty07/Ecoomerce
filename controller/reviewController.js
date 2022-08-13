
const Reivew = require("../model/reviewModel");
const Factory = require("./handlerFactory");

// Nested Routes
// @desc       products/productId/reviews
// @route  GET products/productId/reviews

exports.  filterobj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// Nested Routes
// @desc       products/productId/reviews
// @route  POST products/productId/reviews
exports.setProductId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
/*  @desc   Get list of review
    @route  GET /api/v1/reviews
    @access Public  
*/
exports.getReviews = Factory.getAll(Reivew);

/*  @desc   Get specific Review by id
    @route  GET /api/v1/Reviews/:id
    @access Public  
*/
exports.getReview = Factory.getOne(Reivew);

/*  @desc   Update specific Review by id
    @route  Put /api/v1/reviews/:id
    @access Private/protect - user - admin - manager  
*/

exports.updateReview = Factory.updateOne(Reivew);

/*  @desc   Update specific Review by id
    @route  Delete /api/v1/reviews/:id
    @access Private/protect - user - admin - manager
*/
exports.deleteReview = Factory.deleteOne(Reivew);

/*  @desc   Create a new Review
    @route  POST   /api/v1/reviews
    @access Private/protect - user - admin - manager
*/
exports.createReview = Factory.createOne(Reivew);
