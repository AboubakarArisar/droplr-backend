const textService = require("../services/text.service");

exports.createText = async (req, res) => {
  try {
    const { latitude, longitude } = req;
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Text must be 10,000 characters or fewer",
      });
    }

    const savedText = await textService.createText({
      content,
      latitude,
      longitude,
    });

    setTimeout(async () => {
      try {
        await textService.deleteText(savedText._id);
      } catch (cleanupError) {
        console.error(
          `Failed to clean up expired text ${savedText._id}:`,
          cleanupError.message
        );
      }
    }, 20 * 60 * 1000);

    res.status(201).json({ success: true, data: savedText });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyTexts = async (req, res) => {
  try {
    const { latitude, longitude } = req;
    const userAccuracy = parseFloat(req.query.accuracy) || null;

    const texts = await textService.findNearbyTexts(
      latitude,
      longitude,
      userAccuracy
    );

    res.status(200).json({ success: true, data: texts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteText = async (req, res) => {
  try {
    const deletedText = await textService.deleteText(req.params.id);

    if (!deletedText) {
      return res.status(404).json({
        success: false,
        message: "Text not found",
      });
    }

    res.status(200).json({ success: true, message: "Text deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
