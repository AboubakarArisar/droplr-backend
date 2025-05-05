const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary public ID
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 1200 }, // Auto-delete after 20 minutes
});

module.exports = mongoose.model("File", fileSchema);
