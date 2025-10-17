import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  uploadedDate: String,
  uploadedBy: String,
  content: String,
  name: {
    type: String,
    required: true,
  },
  type: String
});

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
