const mongoose = require('mongoose');

// File upload schema
const fileUploadSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fieldLabel: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  uploadPath: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Answer schema
const answerSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fieldLabel: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  // For scored forms/quizzes
  isCorrect: {
    type: Boolean,
    default: null,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const responseSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    answers: [answerSchema],
    files: [fileUploadSchema],
    respondentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    respondentInfo: {
      name: String,
      phone: String,
      organization: String,
      custom: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    browser: String,
    os: String,
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    referrer: String,
    language: String,
    completedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: Date,
    timeSpentMs: Number, // Time taken to complete the form in milliseconds
    // For saved draft functionality
    status: {
      type: String,
      enum: ['complete', 'partial', 'draft'],
      default: 'complete',
    },
    lastSaved: Date,
    pageProgress: Number, // Which page the respondent reached
    // For scored forms/quizzes
    score: {
      points: {
        type: Number,
        default: 0,
      },
      maxPoints: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
      passingScore: {
        type: Number,
        default: 0,
      },
      passed: {
        type: Boolean,
        default: null,
      },
    },
    // For webhook events
    webhookStatus: {
      sent: {
        type: Boolean,
        default: false,
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastAttempt: Date,
      error: String,
    },
    // For email notifications
    notificationStatus: {
      adminNotified: {
        type: Boolean,
        default: false,
      },
      respondentNotified: {
        type: Boolean,
        default: false,
      },
    }
  },
  {
    timestamps: true,
  }
);

// Create compound indexes
responseSchema.index({ form: 1, ipAddress: 1 });
responseSchema.index({ form: 1, respondentEmail: 1 });
responseSchema.index({ form: 1, status: 1 });
responseSchema.index({ form: 1, completedAt: 1 });
responseSchema.index({ form: 1, "score.passed": 1 });

const Response = mongoose.model('Response', responseSchema);

module.exports = Response; 