const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 1200 },
  passwordHash: { type: String }, // Optional: hashed password for file protection
  visibility: { type: String, enum: ["public", "private"], default: "public" }, // public or private
});

module.exports = mongoose.model("File", fileSchema);
