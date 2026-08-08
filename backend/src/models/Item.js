const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const unitSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  name: { type: String, required: true }, // e.g., Kilograms, Litres, 50kg Bag
  symbol: { type: String, required: true } // e.g., kg, L, bag
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  sku: { type: String, required: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  categoryName: { type: String }, // cached for speed
  type: { 
    type: String, 
    required: true, 
    enum: ['Seeds', 'Fertilisers', 'Pesticides', 'Packaging', 'Spare parts', 'Harvested produce'] 
  },
  unit: { type: String, required: true, default: 'kg' },
  unitCost: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  minOrderQuantity: { type: Number, default: 10 },
  leadTimeDays: { type: Number, default: 7 },
  reorderPoint: { type: Number, default: 100 },
  safetyStock: { type: Number, default: 50 },
  maxStockLevel: { type: Number, default: 1000 },
  shelfLifeDays: { type: Number, default: 365 }, // product shelf life
  storageRequirement: { type: String, enum: ['Ambient', 'Cool Dry', 'Refrigerated', 'Hazardous'], default: 'Ambient' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  Category: mongoose.model('Category', categorySchema),
  Unit: mongoose.model('Unit', unitSchema),
  Item: mongoose.model('Item', itemSchema)
};
