module.exports.sendSuccess = (data, statusCode, res, extra = {}) => {
  if (statusCode === 204)
    return res.status(204).json({
      status: "success",
      data: null,
    });

  // If I forget in the upper function to check that document is exist or not
  // if (!doc)
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Document not found',
  //   });

  res.status(statusCode).json({
    status: "success",
    ...extra,
    data,
  });
};
