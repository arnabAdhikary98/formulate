const Response = require('../models/Response');
const Form = require('../models/Form');
const UAParser = require('ua-parser-js');
const axios = require('axios');

// Helper function to detect device type from user agent
const detectDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const deviceType = result.device.type || 'unknown';
  
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    return deviceType;
  }
  return 'desktop';
};

// @desc    Submit a response to a form
// @route   POST /api/responses
// @access  Public
const submitResponse = async (req, res) => {
  try {
    const { 
      formId, 
      answers, 
      respondentEmail,
      respondentInfo,
      startedAt,
      timeSpentMs,
      status = 'complete',
      pageProgress,
      files = []
    } = req.body;

    // Find the form
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if form is published and accepting responses
    if (form.status !== 'published') {
      return res.status(403).json({ message: 'This form is not currently accepting responses' });
    }

    // Get client IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers.referer || '';
    const language = req.headers['accept-language'] || '';

    // Detect device type from user agent
    const device = detectDevice(userAgent);
    
    // Parse browser and OS information
    const parser = new UAParser(userAgent);
    const browser = `${parser.getBrowser().name || ''} ${parser.getBrowser().version || ''}`.trim();
    const os = `${parser.getOS().name || ''} ${parser.getOS().version || ''}`.trim();

    // Check for duplicate submissions if setting is enabled and status is complete
    if (form.settings.preventDuplicateSubmissions && status === 'complete') {
      const existingResponse = await Response.findOne({ 
        form: formId, 
        ipAddress,
        status: 'complete'
      });
      
      if (existingResponse) {
        return res.status(400).json({ message: 'You have already submitted this form' });
      }
    }

    // Process answers with field types
    const processedAnswers = answers.map(answer => {
      // Find the field in the form to get its type
      let fieldType = 'text'; // Default
      form.pages.forEach(page => {
        page.fields.forEach(field => {
          if (field._id.toString() === answer.fieldId.toString()) {
            fieldType = field.type;
          }
        });
      });

      return {
        ...answer,
        fieldType
      };
    });

    // Create the response
    const responseData = {
      form: formId,
      answers: processedAnswers,
      files,
      respondentEmail: respondentEmail || undefined,
      respondentInfo: respondentInfo || undefined,
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      referrer,
      language,
      status,
      completedAt: status === 'complete' ? new Date() : undefined,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      timeSpentMs,
      pageProgress
    };

    // For scored forms, calculate the score
    if (form.settings.enableScoring) {
      let points = 0;
      let maxPoints = 0;
      
      processedAnswers.forEach(answer => {
        // Find the field in the form
        form.pages.forEach(page => {
          page.fields.forEach(field => {
            if (field._id.toString() === answer.fieldId.toString() && field.scoring) {
              const isCorrect = JSON.stringify(answer.value) === JSON.stringify(field.scoring.correctAnswer);
              answer.isCorrect = isCorrect;
              answer.points = isCorrect ? field.scoring.points : 0;
              points += answer.points;
              maxPoints += field.scoring.points;
            }
          });
        });
      });
      
      const percentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
      const passingScore = form.settings.passingScore || 60; // Default passing score: 60%
      
      responseData.score = {
        points,
        maxPoints,
        percentage,
        passingScore,
        passed: percentage >= passingScore
      };
    }

    const response = await Response.create(responseData);

    // If this is a completed response, update the form stats
    if (status === 'complete') {
      // Increment form response count
      form.responseCount += 1;
      
      // Update form statistics
      if (!form.statistics) {
        form.statistics = {
          averageCompletionTimeSeconds: 0,
          completionRate: 0,
          deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
          lastUpdated: new Date()
        };
      }
      
      // Update device stats
      if (device && form.statistics.deviceStats) {
        form.statistics.deviceStats[device] += 1;
      }
      
      // Update average completion time
      if (timeSpentMs) {
        const totalTime = form.statistics.averageCompletionTimeSeconds * (form.responseCount - 1);
        const newTimeSeconds = timeSpentMs / 1000;
        form.statistics.averageCompletionTimeSeconds = (totalTime + newTimeSeconds) / form.responseCount;
      }
      
      form.statistics.lastUpdated = new Date();
      await form.save();
    }

    // Send a webhook if configured
    if (form.settings.webhookUrl && status === 'complete') {
      try {
        // Send data to webhook URL
        const webhookData = {
          formId: form._id,
          formTitle: form.title,
          responseId: response._id,
          completedAt: response.completedAt,
          respondentEmail: response.respondentEmail || null,
          respondentInfo: response.respondentInfo || null,
          answers: response.answers.map(answer => {
            // Find the field label for better readability
            let fieldLabel = '';
            form.pages.forEach(page => {
              page.fields.forEach(field => {
                if (field._id.toString() === answer.fieldId.toString()) {
                  fieldLabel = field.label;
                }
              });
            });
            
            return {
              fieldId: answer.fieldId,
              fieldLabel,
              fieldType: answer.fieldType,
              value: answer.value
            };
          })
        };
        
        // Send POST request to webhook URL
        const webhookResponse = await axios.post(form.settings.webhookUrl, webhookData, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Source': 'Formulate',
            'X-Form-ID': form._id.toString()
          },
          timeout: 10000 // 10 second timeout
        });
        
        // Update webhook status in the response
        response.webhookStatus = {
          sent: true,
          attempts: 1,
          lastAttempt: new Date(),
          statusCode: webhookResponse.status,
          statusText: webhookResponse.statusText
        };
        await response.save();
        
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        response.webhookStatus = {
          sent: false,
          attempts: 1,
          lastAttempt: new Date(),
          error: webhookError.message,
          statusCode: webhookError.response?.status || 0,
          statusText: webhookError.response?.statusText || ''
        };
        await response.save();
      }
    }

    res.status(201).json({ 
      message: 'Response submitted successfully',
      responseId: response._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get responses for a form
// @route   GET /api/responses/form/:formId
// @access  Private
const getFormResponses = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access these responses' });
    }

    const responses = await Response.find({ form: req.params.formId }).sort({
      createdAt: -1,
    });

    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get summary of responses for a form
// @route   GET /api/responses/form/:formId/summary
// @access  Private
const getResponseSummary = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access these responses' });
    }

    // Get query parameters for filtering
    const { startDate, endDate, filterField, filterValue } = req.query;
    
    // Build query
    let query = { form: req.params.formId };
    
    // Add date filters if provided
    if (startDate && endDate) {
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.completedAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.completedAt = { $lte: new Date(endDate) };
    }
    
    // Add field value filter if provided
    if (filterField && filterValue) {
      query.answers = {
        $elemMatch: {
          fieldId: filterField,
          value: filterValue
        }
      };
    }
    
    // Only include complete responses in summary
    query.status = 'complete';
    
    const responses = await Response.find(query);
    
    // Create summary object
    const summary = {
      totalResponses: responses.length,
      fieldSummaries: {},
      responseRate: {
        complete: await Response.countDocuments({ form: req.params.formId, status: 'complete' }),
        partial: await Response.countDocuments({ form: req.params.formId, status: 'partial' }),
        draft: await Response.countDocuments({ form: req.params.formId, status: 'draft' }),
      },
      deviceStats: form.statistics?.deviceStats || { desktop: 0, mobile: 0, tablet: 0 },
      averageCompletionTimeSeconds: form.statistics?.averageCompletionTimeSeconds || 0,
      responseOverTime: {},
      geographicDistribution: {},
      scoreDistribution: form.settings.enableScoring ? {
        averageScore: 0,
        passingRate: 0,
        scoreRanges: {
          '0-20': 0,
          '21-40': 0,
          '41-60': 0,
          '61-80': 0,
          '81-100': 0
        }
      } : null
    };

    // If no responses yet, return basic summary
    if (responses.length === 0) {
      return res.json(summary);
    }

    // Collect all unique field IDs from the form
    const fieldMap = new Map();
    form.pages.forEach(page => {
      page.fields.forEach(field => {
        fieldMap.set(field._id.toString(), {
          id: field._id,
          type: field.type,
          label: field.label,
          options: field.options || [],
        });
      });
    });

    // Process responses by field
    responses.forEach(response => {
      // Track when responses were received (for trend analysis)
      const responseDate = response.completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      summary.responseOverTime[responseDate] = (summary.responseOverTime[responseDate] || 0) + 1;
      
      // Track geographic distribution
      if (response.location && response.location.country) {
        const country = response.location.country;
        summary.geographicDistribution[country] = (summary.geographicDistribution[country] || 0) + 1;
      }
      
      // Track score distribution for scored forms
      if (form.settings.enableScoring && response.score) {
        // Update average score
        summary.scoreDistribution.averageScore = 
          (summary.scoreDistribution.averageScore * (responses.length - 1) + response.score.percentage) / responses.length;
        
        // Update passing rate
        if (response.score.passed) {
          summary.scoreDistribution.passingRate = 
            ((summary.scoreDistribution.passingRate * (responses.length - 1)) + 100) / responses.length;
        }
        
        // Update score ranges
        const scorePercentage = response.score.percentage;
        if (scorePercentage <= 20) {
          summary.scoreDistribution.scoreRanges['0-20']++;
        } else if (scorePercentage <= 40) {
          summary.scoreDistribution.scoreRanges['21-40']++;
        } else if (scorePercentage <= 60) {
          summary.scoreDistribution.scoreRanges['41-60']++;
        } else if (scorePercentage <= 80) {
          summary.scoreDistribution.scoreRanges['61-80']++;
        } else {
          summary.scoreDistribution.scoreRanges['81-100']++;
        }
      }
      
      response.answers.forEach(answer => {
        const fieldId = answer.fieldId.toString();
        const field = fieldMap.get(fieldId);
        
        if (!field) return; // Skip if field doesn't exist in form anymore
        
        if (!summary.fieldSummaries[fieldId]) {
          summary.fieldSummaries[fieldId] = {
            fieldId,
            label: answer.fieldLabel,
            type: field.type,
          };
          
          // Initialize based on field type
          switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'textarea':
              summary.fieldSummaries[fieldId].values = [];
              summary.fieldSummaries[fieldId].wordCloud = {};
              break;
            case 'number':
            case 'range':
              summary.fieldSummaries[fieldId].values = [];
              summary.fieldSummaries[fieldId].average = 0;
              summary.fieldSummaries[fieldId].median = 0;
              summary.fieldSummaries[fieldId].min = Infinity;
              summary.fieldSummaries[fieldId].max = -Infinity;
              summary.fieldSummaries[fieldId].distribution = {};
              break;
            case 'date':
              summary.fieldSummaries[fieldId].values = [];
              summary.fieldSummaries[fieldId].mostCommon = null;
              summary.fieldSummaries[fieldId].mostCommonCount = 0;
              summary.fieldSummaries[fieldId].distribution = {};
              break;
            case 'dropdown':
            case 'radio':
            case 'checkbox':
              summary.fieldSummaries[fieldId].counts = {};
              field.options.forEach(option => {
                summary.fieldSummaries[fieldId].counts[option] = 0;
              });
              summary.fieldSummaries[fieldId].mostSelected = null;
              summary.fieldSummaries[fieldId].leastSelected = null;
              break;
            case 'rating':
              summary.fieldSummaries[fieldId].counts = {
                '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
              };
              summary.fieldSummaries[fieldId].average = 0;
              break;
            case 'matrix':
              summary.fieldSummaries[fieldId].rowCounts = {};
              summary.fieldSummaries[fieldId].columnCounts = {};
              if (field.matrixRows && field.matrixColumns) {
                field.matrixRows.forEach(row => {
                  summary.fieldSummaries[fieldId].rowCounts[row] = {};
                  field.matrixColumns.forEach(col => {
                    summary.fieldSummaries[fieldId].rowCounts[row][col] = 0;
                  });
                });
                field.matrixColumns.forEach(col => {
                  summary.fieldSummaries[fieldId].columnCounts[col] = 0;
                });
              }
              break;
            case 'file':
              summary.fieldSummaries[fieldId].fileCount = 0;
              summary.fieldSummaries[fieldId].fileTypes = {};
              summary.fieldSummaries[fieldId].averageFileSize = 0;
              break;
          }
        }
        
        // Update summary data based on field type
        switch (field.type) {
          case 'text':
          case 'email':
          case 'url':
          case 'textarea': {
            summary.fieldSummaries[fieldId].values.push(answer.value);
            
            // Generate word cloud data (split text into words and count occurrences)
            if (typeof answer.value === 'string') {
              const words = answer.value.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 2); // Filter out short words
              
              words.forEach(word => {
                summary.fieldSummaries[fieldId].wordCloud[word] = 
                  (summary.fieldSummaries[fieldId].wordCloud[word] || 0) + 1;
              });
            }
            break;
          }
          case 'number':
          case 'range': {
            const num = Number(answer.value);
            summary.fieldSummaries[fieldId].values.push(num);
            summary.fieldSummaries[fieldId].min = Math.min(summary.fieldSummaries[fieldId].min, num);
            summary.fieldSummaries[fieldId].max = Math.max(summary.fieldSummaries[fieldId].max, num);
            
            // Build distribution
            const roundedValue = Math.round(num);
            summary.fieldSummaries[fieldId].distribution[roundedValue] = 
              (summary.fieldSummaries[fieldId].distribution[roundedValue] || 0) + 1;
            break;
          }
          case 'date': {
            // Format date consistently as YYYY-MM-DD
            let dateValue = answer.value;
            try {
              if (typeof dateValue === 'string') {
                dateValue = new Date(dateValue).toISOString().split('T')[0];
              } else if (dateValue instanceof Date) {
                dateValue = dateValue.toISOString().split('T')[0];
              }
              summary.fieldSummaries[fieldId].values.push(dateValue);
              
              // Track date distribution
              summary.fieldSummaries[fieldId].distribution[dateValue] = 
                (summary.fieldSummaries[fieldId].distribution[dateValue] || 0) + 1;
              
              // Track most common date
              if (summary.fieldSummaries[fieldId].distribution[dateValue] > 
                  (summary.fieldSummaries[fieldId].mostCommonCount || 0)) {
                summary.fieldSummaries[fieldId].mostCommon = dateValue;
                summary.fieldSummaries[fieldId].mostCommonCount = 
                  summary.fieldSummaries[fieldId].distribution[dateValue];
              }
            } catch (e) {
              console.error('Error processing date value:', e);
            }
            break;
          }
          case 'dropdown':
          case 'radio':
            summary.fieldSummaries[fieldId].counts[answer.value] += 1;
            break;
          case 'checkbox':
            (Array.isArray(answer.value) ? answer.value : [answer.value]).forEach(value => {
              if (summary.fieldSummaries[fieldId].counts[value] !== undefined) {
                summary.fieldSummaries[fieldId].counts[value] += 1;
              }
            });
            break;
          case 'rating':
            summary.fieldSummaries[fieldId].counts[answer.value] += 1;
            break;
          case 'matrix':
            if (typeof answer.value === 'object' && answer.value !== null) {
              Object.entries(answer.value).forEach(([row, colValue]) => {
                if (summary.fieldSummaries[fieldId].rowCounts[row] && 
                    summary.fieldSummaries[fieldId].rowCounts[row][colValue] !== undefined) {
                  summary.fieldSummaries[fieldId].rowCounts[row][colValue] += 1;
                  summary.fieldSummaries[fieldId].columnCounts[colValue] += 1;
                }
              });
            }
            break;
          case 'file':
            // Process file counts and types
            if (response.files && response.files.length > 0) {
              const filesForThisField = response.files.filter(f => f.fieldId.toString() === fieldId);
              summary.fieldSummaries[fieldId].fileCount += filesForThisField.length;
              
              // Track file types
              filesForThisField.forEach(file => {
                const fileType = file.fileType.split('/')[1] || file.fileType;
                summary.fieldSummaries[fieldId].fileTypes[fileType] = 
                  (summary.fieldSummaries[fieldId].fileTypes[fileType] || 0) + 1;
                
                // Update average file size
                const totalSize = summary.fieldSummaries[fieldId].averageFileSize * 
                  (summary.fieldSummaries[fieldId].fileCount - 1);
                summary.fieldSummaries[fieldId].averageFileSize = 
                  (totalSize + file.fileSize) / summary.fieldSummaries[fieldId].fileCount;
              });
            }
            break;
        }
      });
    });
    
    // Calculate derived metrics for each field
    Object.values(summary.fieldSummaries).forEach(fieldSummary => {
      if ((fieldSummary.type === 'number' || fieldSummary.type === 'range') && fieldSummary.values.length > 0) {
        // Calculate average
        const sum = fieldSummary.values.reduce((a, b) => a + b, 0);
        fieldSummary.average = sum / fieldSummary.values.length;
        
        // Calculate median
        const sortedValues = [...fieldSummary.values].sort((a, b) => a - b);
        const mid = Math.floor(sortedValues.length / 2);
        fieldSummary.median = sortedValues.length % 2 === 0
          ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
          : sortedValues[mid];
      } else if (fieldSummary.type === 'rating' && Object.values(fieldSummary.counts).some(count => count > 0)) {
        // Calculate average rating
        let sum = 0;
        let count = 0;
        for (let i = 1; i <= 5; i++) {
          sum += i * fieldSummary.counts[i.toString()];
          count += fieldSummary.counts[i.toString()];
        }
        fieldSummary.average = count > 0 ? sum / count : 0;
      } else if (
        (fieldSummary.type === 'dropdown' || 
         fieldSummary.type === 'radio' || 
         fieldSummary.type === 'checkbox') && 
        Object.keys(fieldSummary.counts).length > 0
      ) {
        // Find most and least selected options
        let mostSelected = null;
        let mostCount = -1;
        let leastSelected = null;
        let leastCount = Infinity;
        
        Object.entries(fieldSummary.counts).forEach(([option, count]) => {
          if (count > mostCount) {
            mostSelected = option;
            mostCount = count;
          }
          if (count < leastCount && count > 0) { // Only consider options that were selected at least once
            leastSelected = option;
            leastCount = count;
          }
        });
        
        fieldSummary.mostSelected = { option: mostSelected, count: mostCount };
        fieldSummary.leastSelected = { option: leastSelected, count: leastCount };
      }
      
      // For text fields, sort word cloud by frequency and limit to top 30 words
      if (fieldSummary.wordCloud) {
        const sortedWords = Object.entries(fieldSummary.wordCloud)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 30);
        
        fieldSummary.wordCloud = Object.fromEntries(sortedWords);
      }
    });

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a response
// @route   DELETE /api/responses/:id
// @access  Private
const deleteResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Get form to check ownership
    const form = await Form.findById(response.form);

    if (!form) {
      return res.status(404).json({ message: 'Associated form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this response' });
    }

    await response.deleteOne();
    
    // Update response count on form
    form.responseCount = Math.max(0, form.responseCount - 1);
    await form.save();

    res.json({ message: 'Response removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitResponse,
  getFormResponses,
  getResponseSummary,
  deleteResponse,
}; 