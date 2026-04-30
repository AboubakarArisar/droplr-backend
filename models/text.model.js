const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 10000 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 1200 },
});

module.exports = mongoose.model("Text", textSchema);
