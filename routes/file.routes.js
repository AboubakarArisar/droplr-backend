const express = require("express");
const fileController = require("../controller/file.controller");
const { locationMiddleware } = require("../middlewares/location.middleware");
const upload = require("../middlewares/upload.middleware");
const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  locationMiddleware,
  fileController.uploadFile
);

router.get("/nearby", locationMiddleware, fileController.getNearbyFiles);

module.exports = router;
