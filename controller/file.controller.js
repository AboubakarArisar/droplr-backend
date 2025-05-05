const fileService = require("../services/file.service");

exports.uploadFile = async (req, res) => {
  try {
    const { latitude, longitude } = req;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    const fileData = {
      filename: file.originalname,
      fileUrl: file.path, // Cloudinary secure URL
      publicId: file.filename, // Cloudinary public ID
      latitude,
      longitude,
    };

    const savedFile = await fileService.createFile(fileData);

    // Schedule deletion after 20 minutes
    setTimeout(async () => {
      await fileService.deleteFile(savedFile._id); // Delete from DB
      await cloudinary.uploader.destroy(fileData.publicId); // Delete from Cloudinary
    }, 20 * 60 * 1000); // 20 minutes in milliseconds

    res.status(201).json({ success: true, data: savedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyFiles = async (req, res) => {
  try {
    const { latitude, longitude } = req;

    const files = await fileService.findNearbyFiles(latitude, longitude);
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
