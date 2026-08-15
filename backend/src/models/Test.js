import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    emoji: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    type: { type: String, enum: ['mcq', 'text'], required: true },
    options: { type: [optionSchema], default: [] },
    // mcq -> the option `id` that is correct; text -> the creator's answer string
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    isSkippable: { type: Boolean, default: true },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const testSchema = new mongoose.Schema({
  testCode: { type: String, required: true, unique: true, index: true },
  dashboardToken: { type: String, required: true, unique: true, index: true },
  // Owner account (null for tests created before accounts existed)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  creatorName: { type: String, required: true, trim: true, maxlength: 50 },
  questions: {
    type: [questionSchema],
    validate: [(q) => q.length >= 1 && q.length <= 15, 'A test needs 1–15 questions'],
  },
  createdAt: { type: Date, default: Date.now },
});

export const Test = mongoose.model('Test', testSchema);
