exports.locationMiddleware = (req, res, next) => {
  const latitude = parseFloat(req.query.latitude || req.body.latitude);
  const longitude = parseFloat(req.query.longitude || req.body.longitude);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: "Valid latitude and longitude are required",
    });
  }

  req.latitude = latitude;
  req.longitude = longitude;
  next();
};
