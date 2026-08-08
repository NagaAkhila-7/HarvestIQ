import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { inventoryApi } from '../api/inventoryApi';
import { ArrowLeft, Package, Clock, ShieldAlert, Truck, RefreshCw, Layers } from 'lucide-react';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustment, setAdjustment] = useState({
    movementType: 'Adjustment',
    quantity: 10,
    reasonCode: 'AuditCorrection',
    notes: 'Physical count adjustment'
  });

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getItemById(id);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.recordMovement({
        ...adjustment,
        itemId: id,
        toLocationId: data?.balances[0]?.locationId?._id || data?.balances[0]?.locationId
      });
      setIsAdjustModalOpen(false);
      loadDetail();
    } catch (err) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading SKU detail telemetry...</div>;
  }

  if (!data || !data.item) {
    return <div className="p-8 text-center text-rose-500">Item not found.</div>;
  }

  const { item, currentStock, availableQuantity, reservedQuantity, balances, movements, lots } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/inventory" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
      </div>

      <PageHeader
        title={`${item.name} (${item.sku})`}
        description={`Category: ${item.type} | Lead Time: ${item.leadTimeDays} Days | Safety Stock: ${item.safetyStock} ${item.unit}`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsAdjustModalOpen(true)}>
            Record Stock Movement / Adjustment
          </Button>
        }
      />

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase">On-Hand Stock</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {currentStock} {item.unit}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase">Reserved Quantity</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {reservedQuantity} {item.unit}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase">Available to Promise</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {availableQuantity} {item.unit}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase">Reorder Threshold</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {item.reorderPoint} {item.unit}
          </div>
        </div>
      </div>

      {/* Batch / Lot Tracking */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Active Batches & Lot Expiry Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3">Lot Number</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Initial Quantity</th>
                <th className="p-3">Remaining Balance</th>
                <th className="p-3">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {lots.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-slate-500">No batch records.</td></tr>
              ) : (
                lots.map(lot => (
                  <tr key={lot._id}>
                    <td className="p-3 font-mono font-bold">{lot.lotNumber}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {new Date(lot.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{lot.initialQuantity} {item.unit}</td>
                    <td className="p-3 font-bold">{lot.currentQuantity} {item.unit}</td>
                    <td className="p-3"><StatusBadge status={lot.qualityStatus} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements Log */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Audit Stock Movement History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Reference / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {movements.map(m => (
                <tr key={m._id}>
                  <td className="p-3 text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-semibold"><StatusBadge status={m.movementType} /></td>
                  <td className="p-3 font-bold">{m.quantity} {item.unit}</td>
                  <td className="p-3">{m.performedBy?.name || 'System'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{m.notes || m.referenceType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Record Stock Adjustment">
        <form onSubmit={handleStockAdjustment} className="space-y-4">
          <Input
            label="Adjustment Quantity (+/-)"
            type="number"
            required
            value={adjustment.quantity}
            onChange={e => setAdjustment({...adjustment, quantity: Number(e.target.value)})}
          />
          <Input
            label="Reason / Notes"
            required
            value={adjustment.notes}
            onChange={e => setAdjustment({...adjustment, notes: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
