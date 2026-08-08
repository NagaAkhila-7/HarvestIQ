const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Organisation = require('../models/Organisation');
const User = require('../models/User');
const { Farmer, Farm, Field, Observation, Harvest } = require('../models/Farmer');
const { Category, Unit, Item } = require('../models/Item');
const { Location, Bin, Lot, StockBalance, StockMovement } = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const { PurchaseRequest, PurchaseOrder, Receipt } = require('../models/Procurement');
const { DemandHistory, Forecast, ReplenishmentParam } = require('../models/Forecast');
const { AIRun, AIRecommendation } = require('../models/AI');
const { Alert, Notification } = require('../models/AlertNotification');
const AuditLog = require('../models/AuditLog');

const seedDatabase = async ({ isStandalone = false } = {}) => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/harvestiq';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
    }
    console.log(`[Seed Script] Connected to MongoDB: ${mongoUri}`);

    // Clear existing data
    await Promise.all([
      Organisation.deleteMany({}),
      User.deleteMany({}),
      Farmer.deleteMany({}),
      Farm.deleteMany({}),
      Field.deleteMany({}),
      Observation.deleteMany({}),
      Harvest.deleteMany({}),
      Category.deleteMany({}),
      Unit.deleteMany({}),
      Item.deleteMany({}),
      Location.deleteMany({}),
      Bin.deleteMany({}),
      Lot.deleteMany({}),
      StockBalance.deleteMany({}),
      StockMovement.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseRequest.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Receipt.deleteMany({}),
      DemandHistory.deleteMany({}),
      Forecast.deleteMany({}),
      ReplenishmentParam.deleteMany({}),
      AIRun.deleteMany({}),
      AIRecommendation.deleteMany({}),
      Alert.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seed Script] Cleared existing database collections.');

    // 1. Create Organisation
    const org = await Organisation.create({
      name: 'Rift Valley Farmers Cooperative Society (FPO)',
      code: 'RVFC',
      region: 'Nakuru North & Naivasha District',
      currency: 'KES',
      settings: {
        safetyStockFormula: 'SERVICE_LEVEL_VARIANCE',
        defaultTargetServiceLevel: 0.95,
        autoReorderAlerts: true,
        aiModel: 'gemini-2.5-flash'
      }
    });

    console.log(`[Seed Script] Created Organisation: ${org.name} (${org.code})`);

    // 2. Create Default Demo Accounts
    const defaultPassword = 'Password123!';
    const users = await User.create([
      {
        organisationId: org._id,
        name: 'Alex Vance (Admin)',
        email: 'admin@harvestiq.org',
        password: defaultPassword,
        role: 'Administrator',
        phone: '+254 712 000 001'
      },
      {
        organisationId: org._id,
        name: 'Sarah Connor (Procurement Manager)',
        email: 'procurement@harvestiq.org',
        password: defaultPassword,
        role: 'Procurement Manager',
        phone: '+254 712 000 002'
      },
      {
        organisationId: org._id,
        name: 'David Kimani (Inventory Planner)',
        email: 'planner@harvestiq.org',
        password: defaultPassword,
        role: 'Inventory Planner',
        phone: '+254 712 000 003'
      },
      {
        organisationId: org._id,
        name: 'John Wanyama (Warehouse User)',
        email: 'warehouse@harvestiq.org',
        password: defaultPassword,
        role: 'Warehouse User',
        phone: '+254 712 000 004'
      },
      {
        organisationId: org._id,
        name: 'Kenya Crop Supplies Ltd (Supplier)',
        email: 'supplier@harvestiq.org',
        password: defaultPassword,
        role: 'Supplier',
        phone: '+254 712 000 005'
      },
      {
        organisationId: org._id,
        name: 'Grace Omondi (Finance Reviewer)',
        email: 'finance@harvestiq.org',
        password: defaultPassword,
        role: 'Finance Reviewer',
        phone: '+254 712 000 006'
      }
    ]);

    const adminUser = users[0];
    const plannerUser = users[2];
    const warehouseUser = users[3];

    console.log(`[Seed Script] Created ${users.length} Demo Accounts.`);

    // 3. Create Categories & Units
    const categories = await Category.create([
      { organisationId: org._id, name: 'Seeds', code: 'CAT-SEED', description: 'Certified high-yield hybrid seed varieties' },
      { organisationId: org._id, name: 'Fertilisers', code: 'CAT-FERT', description: 'Basal and top-dressing soil nutrients' },
      { organisationId: org._id, name: 'Pesticides', code: 'CAT-PEST', description: 'Fungicides, insecticides and crop protection chemicals' },
      { organisationId: org._id, name: 'Packaging', code: 'CAT-PKG', description: 'Grain storage bags, crates and gunny sacks' },
      { organisationId: org._id, name: 'Spare parts', code: 'CAT-PART', description: 'Tractor, pump and milling machinery spares' },
      { organisationId: org._id, name: 'Harvested produce', code: 'CAT-HARV', description: 'Aggregation of member farmer crop yields' }
    ]);

    const units = await Unit.create([
      { organisationId: org._id, name: 'Kilograms', symbol: 'kg' },
      { organisationId: org._id, name: 'Litres', symbol: 'L' },
      { organisationId: org._id, name: '50kg Bag', symbol: 'bag' },
      { organisationId: org._id, name: 'Units', symbol: 'unit' }
    ]);

    // 4. Create Locations & Bins
    const locations = await Location.create([
      { organisationId: org._id, code: 'WH-NAKURU', name: 'Nakuru Central Ag-Hub Warehouse', address: 'Plot 42 Industrial Area, Nakuru', capacityM3: 6000 },
      { organisationId: org._id, code: 'WH-ELDORET', name: 'Eldoret North Aggregation Hub', address: 'Main Road Depot, Eldoret', capacityM3: 4500 }
    ]);

    const nakuruWh = locations[0];
    const bins = await Bin.create([
      { organisationId: org._id, locationId: nakuruWh._id, code: 'BIN-A1-01', zone: 'Seed Vault A', maxWeightKg: 5000 },
      { organisationId: org._id, locationId: nakuruWh._id, code: 'BIN-B2-04', zone: 'Fertiliser Bay B', maxWeightKg: 10000 },
      { organisationId: org._id, locationId: nakuruWh._id, code: 'BIN-C1-09', zone: 'Produce Silo C', maxWeightKg: 25000 }
    ]);

    // 5. Create Farmers, Farms & Fields
    const farmers = await Farmer.create([
      { organisationId: org._id, code: 'FARM-001', name: 'James Mwangi', phone: '+254 722 100 200', location: 'Bahati Sub-County', slaScore: 96 },
      { organisationId: org._id, code: 'FARM-002', name: 'Mary Kiprono', phone: '+254 723 300 400', location: 'Njoro District', slaScore: 91 },
      { organisationId: org._id, code: 'FARM-003', name: 'Peter Otieno', phone: '+254 724 500 600', location: 'Rongai Sub-County', slaScore: 88 }
    ]);

    const farms = await Farm.create([
      { organisationId: org._id, farmerId: farmers[0]._id, name: 'Green Valley Farm', totalAcreage: 25, soilType: 'Volcanic Loam', irrigationAccess: true },
      { organisationId: org._id, farmerId: farmers[1]._id, name: 'Kiprono Agri Estate', totalAcreage: 40, soilType: 'Clay Loam', irrigationAccess: false }
    ]);

    const fields = await Field.create([
      { organisationId: org._id, farmId: farms[0]._id, fieldName: 'North Block Maize', acreage: 15, currentCrop: 'Hybrid Maize H614', cropStage: 'Vegetative', expectedYieldKg: 35000, fieldRiskLevel: 'Low' },
      { organisationId: org._id, farmId: farms[0]._id, fieldName: 'South Block Beans', acreage: 10, currentCrop: 'Rosecoco Beans', cropStage: 'Flowering', expectedYieldKg: 12000, fieldRiskLevel: 'Medium' },
      { organisationId: org._id, farmId: farms[1]._id, fieldName: 'Highland Wheat A', acreage: 25, currentCrop: 'Kenya Tai Wheat', cropStage: 'Sowing', expectedYieldKg: 45000, fieldRiskLevel: 'Low' }
    ]);

    // 6. Create Suppliers
    const suppliers = await Supplier.create([
      {
        organisationId: org._id,
        code: 'SUP-001',
        name: 'Kenya Seed Company Ltd',
        contactPerson: 'Bernard Mutua',
        email: 'sales@kenyaseed.co.ke',
        phone: '+254 20 220 1100',
        categoriesSupplied: ['Seeds'],
        paymentTerms: 'Net 30',
        status: 'Active',
        riskLevel: 'Low',
        leadTimes: [{ itemId: new mongoose.Types.ObjectId(), leadTimeDays: 7, minimumOrderQty: 50, contractedUnitPrice: 4500 }],
        evaluations: [{ period: '2026-Q2', onTimeDeliveryRate: 98, qualityPassRate: 99, priceCompetitivenessScore: 4.8, overallRating: 4.9 }]
      },
      {
        organisationId: org._id,
        code: 'SUP-002',
        name: 'Yara Fertiliser East Africa',
        contactPerson: 'Catherine Njeri',
        email: 'info.ke@yara.com',
        phone: '+254 700 800 900',
        categoriesSupplied: ['Fertilisers'],
        paymentTerms: 'Net 45',
        status: 'Active',
        riskLevel: 'Low',
        evaluations: [{ period: '2026-Q2', onTimeDeliveryRate: 94, qualityPassRate: 97, priceCompetitivenessScore: 4.4, overallRating: 4.5 }]
      },
      {
        organisationId: org._id,
        code: 'SUP-003',
        name: 'Syngenta Agro Kenya',
        contactPerson: 'Paul Kariuki',
        email: 'support.kenya@syngenta.com',
        phone: '+254 733 900 111',
        categoriesSupplied: ['Pesticides'],
        paymentTerms: 'Net 30',
        status: 'Active',
        riskLevel: 'Medium'
      }
    ]);

    // 7. Create Items
    const items = await Item.create([
      {
        organisationId: org._id,
        sku: 'SEED-MAIZE-H614',
        name: 'Hybrid Seed Maize H614 (25kg Bag)',
        categoryId: categories[0]._id,
        categoryName: 'Seeds',
        type: 'Seeds',
        unit: 'bag',
        unitCost: 4500,
        unitPrice: 5200,
        minOrderQuantity: 50,
        leadTimeDays: 7,
        reorderPoint: 120,
        safetyStock: 40,
        maxStockLevel: 500,
        shelfLifeDays: 540,
        description: 'Certified high yield drought tolerant hybrid seed variety for medium to high altitude.'
      },
      {
        organisationId: org._id,
        sku: 'FERT-DAP-50KG',
        name: 'DAP Planting Fertiliser (50kg Bag)',
        categoryId: categories[1]._id,
        categoryName: 'Fertilisers',
        type: 'Fertilisers',
        unit: 'bag',
        unitCost: 5800,
        unitPrice: 6400,
        minOrderQuantity: 100,
        leadTimeDays: 14,
        reorderPoint: 250,
        safetyStock: 80,
        maxStockLevel: 1000,
        shelfLifeDays: 730,
        description: 'Di-Ammonium Phosphate 18:46:0 high analysis root development fertiliser.'
      },
      {
        organisationId: org._id,
        sku: 'PEST-RIDOMIL-1L',
        name: 'Ridomil Gold Fungicide (1 Litre)',
        categoryId: categories[2]._id,
        categoryName: 'Pesticides',
        type: 'Pesticides',
        unit: 'L',
        unitCost: 3200,
        unitPrice: 3800,
        minOrderQuantity: 20,
        leadTimeDays: 5,
        reorderPoint: 45,
        safetyStock: 15,
        maxStockLevel: 200,
        shelfLifeDays: 365,
        description: 'Systemic fungicide for prevention of late blight in beans and potato crops.'
      },
      {
        organisationId: org._id,
        sku: 'PKG-GRAINPRO-50KG',
        name: 'Hermetic GrainPro Hermetic Bags (50kg)',
        categoryId: categories[3]._id,
        categoryName: 'Packaging',
        type: 'Packaging',
        unit: 'unit',
        unitCost: 280,
        unitPrice: 350,
        minOrderQuantity: 500,
        leadTimeDays: 10,
        reorderPoint: 800,
        safetyStock: 300,
        maxStockLevel: 5000,
        shelfLifeDays: 1095,
        description: 'Chemical-free post-harvest pest barrier hermetic storage bag.'
      }
    ]);

    const maizeSeed = items[0];
    const dapFert = items[1];

    // 8. Create Lots & Stock Balances
    const lots = await Lot.create([
      {
        organisationId: org._id,
        lotNumber: 'LOT-2026-H614-A',
        itemId: maizeSeed._id,
        manufactureDate: new Date('2026-01-15'),
        expiryDate: new Date('2026-12-31'),
        supplierLotNumber: 'KSC-99823',
        qualityStatus: 'Passed',
        initialQuantity: 200,
        currentQuantity: 85
      },
      {
        organisationId: org._id,
        lotNumber: 'LOT-2026-DAP-09',
        itemId: dapFert._id,
        manufactureDate: new Date('2026-02-01'),
        expiryDate: new Date('2027-02-01'),
        supplierLotNumber: 'YARA-8871',
        qualityStatus: 'Passed',
        initialQuantity: 500,
        currentQuantity: 420
      }
    ]);

    await StockBalance.create([
      {
        organisationId: org._id,
        itemId: maizeSeed._id,
        locationId: nakuruWh._id,
        binId: bins[0]._id,
        lotId: lots[0]._id,
        onHandQuantity: 85,
        reservedQuantity: 10,
        availableQuantity: 75
      },
      {
        organisationId: org._id,
        itemId: dapFert._id,
        locationId: nakuruWh._id,
        binId: bins[1]._id,
        lotId: lots[1]._id,
        onHandQuantity: 420,
        reservedQuantity: 50,
        availableQuantity: 370
      }
    ]);

    // Initial Stock Movement log
    await StockMovement.create([
      {
        organisationId: org._id,
        movementType: 'Receipt',
        itemId: maizeSeed._id,
        lotId: lots[0]._id,
        toLocationId: nakuruWh._id,
        quantity: 200,
        referenceType: 'PO',
        referenceId: 'PO-2026-0001',
        performedBy: warehouseUser._id,
        reasonCode: 'InitialStocking',
        notes: 'Initial warehouse stocking from Kenya Seed'
      }
    ]);

    // 9. Historical Demand Data (past 6 months)
    const demandEntries = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      d.setDate(1);

      demandEntries.push({
        organisationId: org._id,
        itemId: maizeSeed._id,
        locationId: nakuruWh._id,
        periodDate: d,
        periodType: 'Monthly',
        actualDemandQuantity: Math.round(140 + Math.random() * 60),
        contributingAcreage: 180,
        activeFarmersCount: 45
      });
    }
    await DemandHistory.create(demandEntries);

    // 10. Purchase Requests & Purchase Orders
    const pr = await PurchaseRequest.create({
      organisationId: org._id,
      requestNumber: 'PR-2026-0001',
      requestedBy: plannerUser._id,
      items: [
        {
          itemId: maizeSeed._id,
          itemName: maizeSeed.name,
          quantity: 200,
          estimatedUnitCost: 4500,
          requiredByDate: new Date('2026-08-25')
        }
      ],
      totalEstimatedCost: 900000,
      reason: 'Urgent replenishment required for upcoming North Nakuru sowing season.',
      status: 'Pending Review'
    });

    const po = await PurchaseOrder.create({
      organisationId: org._id,
      poNumber: 'PO-2026-0002',
      purchaseRequestId: pr._id,
      supplierId: suppliers[0]._id,
      supplierName: suppliers[0].name,
      destinationLocationId: nakuruWh._id,
      items: [
        {
          itemId: maizeSeed._id,
          itemName: maizeSeed.name,
          orderedQuantity: 200,
          receivedQuantity: 0,
          unitPrice: 4500,
          totalPrice: 900000
        }
      ],
      totalAmount: 900000,
      expectedDeliveryDate: new Date('2026-08-20'),
      paymentTerms: 'Net 30',
      status: 'Approved',
      approvedBy: adminUser._id
    });

    // 11. Alerts & Notifications
    await Alert.create([
      {
        organisationId: org._id,
        alertType: 'STOCKOUT_RISK',
        severity: 'Critical',
        itemId: maizeSeed._id,
        locationId: nakuruWh._id,
        title: 'Critical Stockout Risk: Hybrid Maize Seed H614',
        message: 'OnHand quantity (85 bags) is below reorder point (120 bags). Projected stockout in 12 days.',
        recommendedAction: 'Approve PR-2026-0001 or expedite PO-2026-0002 with Kenya Seed Company.',
        status: 'Active'
      },
      {
        organisationId: org._id,
        alertType: 'EXPIRY_WARNING',
        severity: 'Warning',
        itemId: maizeSeed._id,
        locationId: nakuruWh._id,
        title: 'Lot Expiry Warning: LOT-2026-H614-A',
        message: '85 bags of Hybrid Seed Maize expire in under 120 days.',
        recommendedAction: 'Prioritize dispatch for current field planting allocations.',
        status: 'Active'
      }
    ]);

    await Notification.create([
      {
        organisationId: org._id,
        userId: plannerUser._id,
        title: 'New AI Reorder Recommendation Generated',
        message: 'AI decision support recommends procuring 200 bags of Hybrid Maize Seed.',
        category: 'AI Result',
        isUrgent: true,
        linkUrl: '/recommendations'
      },
      {
        organisationId: org._id,
        userId: adminUser._id,
        title: 'Purchase Request Pending Approval',
        message: 'PR-2026-0001 (900,000 KES) requires your executive review.',
        category: 'Approval',
        isUrgent: true,
        linkUrl: '/procurement/requests'
      }
    ]);

    // 12. AI Recommendation
    await AIRecommendation.create({
      organisationId: org._id,
      recommendationType: 'REORDER_QUANTITY',
      targetItemId: maizeSeed._id,
      targetSupplierId: suppliers[0]._id,
      targetLocationId: nakuruWh._id,
      title: 'Optimal Stock Replenishment: Hybrid Maize Seed H614',
      recommendedAction: 'Approve Purchase Order for 200 bags (900,000 KES) from Kenya Seed Company.',
      suggestedValue: { quantity: 200, supplierId: suppliers[0]._id },
      confidenceScore: 0.95,
      status: 'Pending Review',
      evidence: {
        currentStock: 85,
        reservedStock: 10,
        forecastDemand: 215,
        leadTimeDays: 7,
        moq: 50,
        cashFlowImpact: 900000,
        riskFactors: ['Active Acreage Expansion (+25 acres)', 'Rainy Season Planting Window Starts in 18 Days']
      },
      conciseExplanation: 'Stock level (85 bags) is below safety stock threshold (40 bags + lead-time buffer). Combined field commitments from 3 member farms indicate 215 bags demand over next 30 days.'
    });

    // 13. Audit Event
    await AuditLog.create({
      organisationId: org._id,
      user: adminUser._id,
      userName: adminUser.name,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action: 'CREATE',
      entityType: 'System',
      entityId: org._id.toString(),
      details: 'Executed initial seed procedure for HarvestIQ platform.'
    });

    console.log('\n==================================================');
    console.log(' HarvestIQ DATABASE SEEDED SUCCESSFULLY!');
    console.log('==================================================');

    const summary = {
      users: users.length,
      categories: categories.length,
      units: units.length,
      locations: locations.length,
      items: items.length,
      suppliers: suppliers.length,
      farmers: farmers.length
    };

    if (isStandalone) {
      process.exit(0);
    }

    return summary;
  } catch (error) {
    console.error('[Seed Error]', error);
    if (isStandalone) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase({ isStandalone: true });
}

module.exports = seedDatabase;
