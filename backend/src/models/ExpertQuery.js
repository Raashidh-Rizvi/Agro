const mongoose = require("mongoose");

const ExpertQuerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  reply: { type: String, default: "" },
  status: { type: String, default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("ExpertQuery", ExpertQuerySchema);

