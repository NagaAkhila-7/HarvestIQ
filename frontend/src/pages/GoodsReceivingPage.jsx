import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { procurementApi } from '../api/procurementApi';
import { inventoryApi } from '../api/inventoryApi';
import { PackageCheck, CheckCircle, AlertTriangle } from 'lucide-react';

export const GoodsReceivingPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedPO, setSelectedPO] = useState('');
  const [receivingData, setReceivingData] = useState({
    locationId: '',
    receivedQuantity: 50,
    lotNumber: `LOT-${Date.now().toString().slice(-6)}`,
    expiryDate: '2027-08-31',
    qualityGrade: 'Pass Grade A',
    notes: 'Goods inspection completed'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, poRes, locRes] = await Promise.all([
        procurementApi.getReceipts(),
        procurementApi.getPurchaseOrders({ status: 'Approved' }),
        inventoryApi.getLocations()
      ]);
      setReceipts(recRes.receipts || []);
      setOrders(poRes.orders || []);
      setLocations(locRes.locations || []);

      if (poRes.orders?.length > 0) setSelectedPO(poRes.orders[0]._id);
      if (locRes.locations?.length > 0) setReceivingData(prev => ({ ...prev, locationId: locRes.locations[0]._id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceive = async (e) => {
    e.preventDefault();
    const po = orders.find(o => o._id === selectedPO);
    if (!po || !po.items?.length) return alert('Invalid Purchase Order selected');

    try {
      await procurementApi.receivePurchaseOrder({
        purchaseOrderId: po._id,
        locationId: receivingData.locationId,
        notes: receivingData.notes,
        items: [
          {
            itemId: po.items[0].itemId,
            receivedQuantity: Number(receivingData.receivedQuantity),
            lotNumber: receivingData.lotNumber,
            expiryDate: receivingData.expiryDate,
            qualityGrade: receivingData.qualityGrade
          }
        ]
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Receiving failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Goods Receiving (GRN)"
        description="Verify supplier deliveries against issued POs, record batch lot numbers, perform quality grading, and auto-update stock balances."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <PackageCheck className="w-4 h-4 mr-1" />
            Receive Delivery (GRN)
          </Button>
        }
      />

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
            <tr>
              <th className="p-4">GRN Number</th>
              <th className="p-4">PO Reference</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Received By</th>
              <th className="p-4">Received Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading receiving notes...</td></tr>
            ) : receipts.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No goods receiving records found.</td></tr>
            ) : (
              receipts.map(rec => (
                <tr key={rec._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{rec.receiptNumber}</td>
                  <td className="p-4 font-mono">{rec.poNumber}</td>
                  <td className="p-4 font-semibold">{rec.supplierId?.name || 'Supplier'}</td>
                  <td className="p-4">{rec.receivedBy?.name || 'Warehouse Staff'}</td>
                  <td className="p-4 text-slate-500">{new Date(rec.receivedDate).toLocaleDateString()}</td>
                  <td className="p-4"><StatusBadge status={rec.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Process Goods Receipt Note (GRN)">
        <form onSubmit={handleReceive} className="space-y-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Purchase Order</label>
            <select
              value={selectedPO}
              onChange={e => setSelectedPO(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            >
              {orders.map(o => (
                <option key={o._id} value={o._id}>
                  {o.poNumber} - {o.supplierName} (Total: KES {o.totalAmount})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Received Quantity"
              type="number"
              required
              value={receivingData.receivedQuantity}
              onChange={e => setReceivingData({...receivingData, receivedQuantity: Number(e.target.value)})}
            />
            <Input
              label="Assigned Lot / Batch Number"
              required
              value={receivingData.lotNumber}
              onChange={e => setReceivingData({...receivingData, lotNumber: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Batch Expiry Date"
              type="date"
              required
              value={receivingData.expiryDate}
              onChange={e => setReceivingData({...receivingData, expiryDate: e.target.value})}
            />
            <Select
              label="Quality Inspection Status"
              value={receivingData.qualityGrade}
              onChange={e => setReceivingData({...receivingData, qualityGrade: e.target.value})}
              options={[
                { label: 'Pass Grade A', value: 'Pass Grade A' },
                { label: 'Pass Grade B', value: 'Pass Grade B' },
                { label: 'Quarantine Inspection', value: 'Quarantine' },
                { label: 'Reject Delivery', value: 'Rejected' }
              ]}
            />
          </div>

          <Input
            label="Receiving Notes / Inspection Comments"
            value={receivingData.notes}
            onChange={e => setReceivingData({...receivingData, notes: e.target.value})}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Goods Receipt</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
