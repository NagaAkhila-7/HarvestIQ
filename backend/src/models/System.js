const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  category: { type: String, enum: ['Master Data', 'Workflow', 'Thresholds', 'AI', 'Integrations', 'Replenishment'], default: 'Master Data' },
  description: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const modelVersionSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  modelName: { type: String, required: true }, // e.g. 'HarvestIQ-DemandNet'
  version: { type: String, required: true }, // e.g. 'v2.5'
  description: { type: String },
  parameters: { type: mongoose.Schema.Types.Mixed },
  accuracyScore: { type: Number, default: 0.94 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String },
  text: { type: String, required: true }
}, { timestamps: true });

const attachmentMetadataSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  fileSize: { type: Number },
  mimeType: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String }
}, { timestamps: true });

module.exports = {
  Configuration: mongoose.model('Configuration', configurationSchema),
  ModelVersion: mongoose.model('ModelVersion', modelVersionSchema),
  Comment: mongoose.model('Comment', commentSchema),
  AttachmentMetadata: mongoose.model('AttachmentMetadata', attachmentMetadataSchema)
};
