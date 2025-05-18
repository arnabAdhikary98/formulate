const mongoose = require('mongoose');

// Field schema as a sub-document
const fieldSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'text', 'email', 'number', 'dropdown', 'checkbox', 'rating',
      'date', 'time', 'textarea', 'phone', 'url', 'file', 'range',
      'radio', 'color', 'signature', 'address', 'matrix'
    ],
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: String,
  helpText: String,
  description: String,
  required: {
    type: Boolean,
    default: false,
  },
  options: [String], // For dropdown, radio, checkbox fields
  min: Number, // For number, range fields
  max: Number, // For number, range fields
  step: Number, // For number, range fields
  rows: Number, // For textarea fields
  maxFileSize: Number, // For file upload (in bytes)
  allowedFileTypes: [String], // For file upload (e.g., ['image/jpeg', 'application/pdf'])
  matrixRows: [String], // For matrix questions
  matrixColumns: [String], // For matrix questions
  order: {
    type: Number,
    required: true,
  },
  styling: {
    // Styling options
    fontSize: {
      type: String,
      default: 'medium', // small, medium, large
    },
    fontWeight: {
      type: String,
      default: 'normal', // normal, bold
    },
    textColor: {
      type: String,
      default: '#000000',
    },
    backgroundColor: {
      type: String,
      default: 'transparent',
    },
    borderColor: {
      type: String,
      default: '#cccccc',
    },
    borderStyle: {
      type: String,
      default: 'solid', // none, solid, dashed, dotted
    },
    borderWidth: {
      type: Number,
      default: 1, // in pixels
    },
    borderRadius: {
      type: Number,
      default: 4, // in pixels
    },
    padding: {
      type: Number,
      default: 8, // in pixels
    },
    width: {
      type: String,
      default: '100%',
    },
    alignment: {
      type: String,
      default: 'left', // left, center, right
    },
    customClass: String,
  },
  validation: {
    // Enhanced validation rules
    pattern: String, // Regex pattern for validation
    customValidationMessage: String,
    minLength: Number,
    maxLength: Number,
    dateMin: Date,
    dateMax: Date,
  },
  conditional: {
    // If this field should be shown conditionally
    isConditional: {
      type: Boolean,
      default: false,
    },
    dependsOn: {
      field: mongoose.Schema.Types.ObjectId, // ID of the field this depends on
      value: mongoose.Schema.Types.Mixed, // Value that triggers this field to show
    },
    condition: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'],
      default: 'equals',
    },
    logicOperator: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND',
    },
    multipleConditions: [{
      field: mongoose.Schema.Types.ObjectId,
      value: mongoose.Schema.Types.Mixed,
      condition: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'],
        default: 'equals',
      },
    }],
  },
  scoring: {
    // For quiz/scored forms
    points: {
      type: Number,
      default: 0,
    },
    correctAnswer: mongoose.Schema.Types.Mixed,
  },
});

// Page schema for multi-page forms
const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  order: {
    type: Number,
    required: true,
  },
  fields: [fieldSchema],
  styling: {
    // Page styling options
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    headerBackgroundColor: {
      type: String,
      default: '#f5f5f5',
    },
    headerTextColor: {
      type: String,
      default: '#333333',
    },
    backgroundImage: String, // URL to an image
    customClass: String,
  },
});

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pages: [pageSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'scheduled'],
      default: 'draft',
    },
    publishDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    accessCode: {
      // Optional password for form access
      enabled: {
        type: Boolean,
        default: false,
      },
      code: {
        type: String,
      },
    },
    // Enhanced settings
    settings: {
      collectEmail: {
        type: Boolean,
        default: false,
      },
      preventDuplicateSubmissions: {
        type: Boolean,
        default: true,
      },
      webhookUrl: {
        type: String,
        default: '',
      },
      // New settings
      showProgressBar: {
        type: Boolean,
        default: true,
      },
      progressBarStyle: {
        type: String,
        enum: ['default', 'numbered', 'percentage'],
        default: 'default',
      },
      allowSavingDrafts: {
        type: Boolean,
        default: false,
      },
      redirectUrl: {
        type: String, // URL to redirect after submission
        default: '',
      },
      notificationEmails: [String], // Emails to notify on submission
      confirmationEmailTemplate: {
        subject: String,
        body: String,
        enabled: {
          type: Boolean,
          default: false,
        },
      },
      submitButtonText: {
        type: String,
        default: 'Submit',
      },
      formType: {
        type: String,
        enum: ['survey', 'quiz', 'application', 'contact'],
        default: 'survey',
      },
      enableScoring: {
        type: Boolean,
        default: false,
      },
      showCorrectAnswers: {
        type: Boolean,
        default: false,
      },
      enableFileUploads: {
        type: Boolean,
        default: false,
      },
      maxFileSizeTotal: {
        type: Number, // in bytes, default 10MB
        default: 10 * 1024 * 1024,
      },
      maxFileCount: {
        type: Number,
        default: 5,
      },
    },
    theme: {
      // Form theming
      primaryColor: {
        type: String,
        default: '#2196f3',
      },
      secondaryColor: {
        type: String,
        default: '#f50057',
      },
      backgroundColor: {
        type: String,
        default: '#ffffff',
      },
      fontFamily: {
        type: String,
        default: 'Roboto, Arial, sans-serif',
      },
      customCss: String,
    },
    analytics: {
      // Enhanced analytics settings
      enabledCustomTracking: {
        type: Boolean,
        default: false,
      },
      googleAnalyticsId: String,
      facebookPixelId: String,
      customTrackingScript: String,
    },
    uniqueUrl: {
      type: String,
      unique: true,
    },
    responseCount: {
      type: Number,
      default: 0,
    },
    // Response statistics - for dashboard
    statistics: {
      averageCompletionTimeSeconds: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number, // percentage
        default: 0,
      },
      deviceStats: {
        desktop: {
          type: Number,
          default: 0,
        },
        mobile: {
          type: Number,
          default: 0,
        },
        tablet: {
          type: Number,
          default: 0,
        },
      },
      lastUpdated: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique URL for the form before saving
formSchema.pre('save', function (next) {
  if (!this.uniqueUrl) {
    // Generate a random string for the URL
    const randomString = Math.random().toString(36).substring(2, 10);
    this.uniqueUrl = `${randomString}`;
  }
  next();
});

const Form = mongoose.model('Form', formSchema);

module.exports = Form; 