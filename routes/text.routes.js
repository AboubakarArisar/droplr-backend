const express = require("express");
const textController = require("../controller/text.controller");
const { locationMiddleware } = require("../middlewares/location.middleware");
const router = express.Router();

router.post("/", locationMiddleware, textController.createText);
router.get("/nearby", locationMiddleware, textController.getNearbyTexts);
router.delete("/:id", textController.deleteText);

module.exports = router;
