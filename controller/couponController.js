const Coupon = require("../model/couponModel");
const Factory = require("./handlerFactory");

/*  @desc   Get list of coupon
    @route  GET /api/v1/coupons
    @access private/Admin - Manager  
*/
exports.getCoupons = Factory.getAll(Coupon);

/*  @desc   Get specific coupon by id
    @route  GET /api/v1/coupons/:id
    @access private/Admin - Manager  
*/
exports.getCoupon = Factory.getOne(Coupon);

/*  @desc   Create a new Coupon
    @route  POST   /api/v1/coupons
    @access Private/admin or manager
*/

exports.createCoupon = Factory.createOne(Coupon);

/*  @desc   Update specific coupon by id
    @route  Put /api/v1/coupons/:id
    @access Private/admin or manager  
*/
exports.updateCoupon = Factory.updateOne(Coupon);

/*  @desc   Update specific coupon by id
    @route  Delete /api/v1/coupons/:id
    @access @access Private/admin or manager
*/
exports.deleteCoupon = Factory.deleteOne(Coupon);
