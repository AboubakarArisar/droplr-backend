const fileService = require("../services/file.service");
const bcrypt = require("bcrypt");

exports.uploadFile = async (req, res) => {
  try {
    const { latitude, longitude } = req;
    const file = req.file;
    const { password, visibility } = req.body;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    const fileData = {
      filename: file.originalname,
      fileUrl: file.path,
      publicId: file.filename,
      latitude,
      longitude,
      visibility: visibility === "private" ? "private" : "public",
    };

    if (password) {
      const saltRounds = 10;
      fileData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const savedFile = await fileService.createFile(fileData);

    setTimeout(async () => {
      await fileService.deleteFile(savedFile._id);
      await cloudinary.uploader.destroy(fileData.publicId);
    }, 20 * 60 * 1000);

    res.status(201).json({ success: true, data: savedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyFiles = async (req, res) => {
  try {
    const { latitude, longitude } = req;
    const userAccuracy = parseFloat(req.query.accuracy) || null;

    const files = await fileService.findNearbyFiles(
      latitude,
      longitude,
      userAccuracy
    );
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const file = await require("../models/file.model").findById(id);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }
    if (file.visibility === "private" && file.passwordHash) {
      if (!password) {
        return res
          .status(401)
          .json({ success: false, message: "Password required" });
      }
      const match = await bcrypt.compare(password, file.passwordHash);
      if (!match) {
        return res
          .status(403)
          .json({ success: false, message: "Incorrect password" });
      }
    }
    // Public files or private files without passwordHash are accessible without password
    res
      .status(200)
      .json({
        success: true,
        data: { fileUrl: file.fileUrl, filename: file.filename },
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
