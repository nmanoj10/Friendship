import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // mcq -> selected option id; text -> typed string; null when skipped
    answer: { type: mongoose.Schema.Types.Mixed, default: null },
    skipped: { type: Boolean, default: false },
    isCorrect: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    // Display of the correct answer, stored so the creator's dashboard can show it
    correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true, index: true },
  participantName: { type: String, required: true, trim: true, maxlength: 50 },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress', index: true },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  skippedAnswers: { type: Number, default: 0 },
  answers: { type: [answerSchema], default: [] },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

attemptSchema.index({ testId: 1, status: 1 });

export const Attempt = mongoose.model('Attempt', attemptSchema);
