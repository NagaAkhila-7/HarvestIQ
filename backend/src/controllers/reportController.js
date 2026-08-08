const { Item } = require('../models/Item');
const { StockBalance, StockMovement } = require('../models/Inventory');
const { Forecast } = require('../models/Forecast');
const { PurchaseOrder, PurchaseRequest } = require('../models/Procurement');
const Supplier = require('../models/Supplier');
const { AIRecommendation, ApprovalOverride } = require('../models/AI');

const getDashboardSummary = async (req, res, next) => {
  try {
    const orgId = req.organisationId;

    const totalItems = await Item.countDocuments({ organisationId: orgId, isDeleted: false });
    const totalSuppliers = await Supplier.countDocuments({ organisationId: orgId, isDeleted: false });
    const activePOs = await PurchaseOrder.countDocuments({ organisationId: orgId, status: { $in: ['Submitted', 'Approved', 'Issued to Supplier', 'Partially Received'] } });
    const pendingPRs = await PurchaseRequest.countDocuments({ organisationId: orgId, status: 'Pending Review' });
    const pendingRecommendations = await AIRecommendation.countDocuments({ organisationId: orgId, status: 'Pending Review' });

    // Stockout & Low Stock counts
    const items = await Item.find({ organisationId: orgId, isDeleted: false });
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    for (const item of items) {
      const balances = await StockBalance.find({ organisationId: orgId, itemId: item._id });
      const onHand = balances.reduce((s, b) => s + b.onHandQuantity, 0);
      totalInventoryValue += (onHand * item.unitCost);

      if (onHand <= 0) outOfStockCount++;
      else if (onHand < item.reorderPoint) lowStockCount++;
    }

    // Category distribution
    const categoryStats = await Item.aggregate([
      { $match: { organisationId: orgId, isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$unitCost', '$reorderPoint'] } } } }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        totalSuppliers,
        activePOs,
        pendingPRs,
        pendingRecommendations,
        lowStockCount,
        outOfStockCount,
        totalInventoryValue,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

const exportReportCsv = async (req, res, next) => {
  try {
    const { reportType } = req.query;
    const orgId = req.organisationId;

    let csvContent = '';

    if (reportType === 'inventory') {
      const items = await Item.find({ organisationId: orgId, isDeleted: false });
      csvContent = 'SKU,Name,Category,Type,Unit,UnitCost,ReorderPoint,SafetyStock\n';
      items.forEach(i => {
        csvContent += `"${i.sku}","${i.name}","${i.categoryName || ''}","${i.type}","${i.unit}",${i.unitCost},${i.reorderPoint},${i.safetyStock}\n`;
      });
    } else if (reportType === 'procurement') {
      const pos = await PurchaseOrder.find({ organisationId: orgId });
      csvContent = 'PONumber,Supplier,Status,TotalAmount,ExpectedDelivery\n';
      pos.forEach(p => {
        csvContent += `"${p.poNumber}","${p.supplierName}","${p.status}",${p.totalAmount},"${p.expectedDeliveryDate.toISOString().slice(0, 10)}"\n`;
      });
    } else {
      const items = await Item.find({ organisationId: orgId, isDeleted: false });
      csvContent = 'SKU,Name,Type,UnitCost\n';
      items.forEach(i => {
        csvContent += `"${i.sku}","${i.name}","${i.type}",${i.unitCost}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="HarvestIQ_${reportType || 'report'}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  exportReportCsv
};
