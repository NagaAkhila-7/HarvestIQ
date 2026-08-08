import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { Input } from '../components/shared/Input';
import { procurementApi } from '../api/procurementApi';
import { supplierApi } from '../api/supplierApi';
import { inventoryApi } from '../api/inventoryApi';
import { Plus, ShoppingCart, Truck, Check } from 'lucide-react';

export const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newPO, setNewPO] = useState({
    supplierId: '',
    destinationLocationId: '',
    itemId: '',
    orderedQuantity: 100,
    unitPrice: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, itemRes, locRes] = await Promise.all([
        procurementApi.getPurchaseOrders(),
        supplierApi.getSuppliers(),
        inventoryApi.getItems(),
        inventoryApi.getLocations()
      ]);
      setOrders(poRes.orders || []);
      setSuppliers(supRes.suppliers || []);
      setItems(itemRes.items || []);
      setLocations(locRes.locations || []);

      if (supRes.suppliers?.length > 0) setNewPO(prev => ({ ...prev, supplierId: supRes.suppliers[0]._id }));
      if (locRes.locations?.length > 0) setNewPO(prev => ({ ...prev, destinationLocationId: locRes.locations[0]._id }));
      if (itemRes.items?.length > 0) setNewPO(prev => ({ ...prev, itemId: itemRes.items[0]._id, unitPrice: itemRes.items[0].unitCost }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await procurementApi.createPurchaseOrder({
        supplierId: newPO.supplierId,
        destinationLocationId: newPO.destinationLocationId,
        items: [
          {
            itemId: newPO.itemId,
            orderedQuantity: Number(newPO.orderedQuantity),
            unitPrice: Number(newPO.unitPrice)
          }
        ]
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create Purchase Order');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await procurementApi.updatePOStatus(id, { status });
      loadData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders (PO)"
        description="Issue binding purchase contracts to approved suppliers, track delivery dates, and process receiving receipts."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Issue Purchase Order
          </Button>
        }
      />

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
            <tr>
              <th className="p-4">PO Number</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Destination Hub</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Expected Delivery</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading purchase orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No purchase orders found.</td></tr>
            ) : (
              orders.map(po => (
                <tr key={po._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-mono font-bold">{po.poNumber}</td>
                  <td className="p-4 font-semibold">{po.supplierName}</td>
                  <td className="p-4">{po.destinationLocationId?.name || 'Warehouse'}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                    KES {(po.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                  </td>
                  <td className="p-4"><StatusBadge status={po.status} /></td>
                  <td className="p-4 text-right space-x-2">
                    {po.status === 'Submitted' && (
                      <Button size="sm" variant="primary" onClick={() => handleStatusChange(po._id, 'Approved')}>
                        Approve PO
                      </Button>
                    )}
                    {po.status === 'Approved' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(po._id, 'Issued to Supplier')}>
                        Issue to Supplier
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Direct Purchase Order">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supplier Vendor</label>
              <select
                value={newPO.supplierId}
                onChange={e => setNewPO({...newPO, supplierId: e.target.value})}
                className="w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              >
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Destination Hub</label>
              <select
                value={newPO.destinationLocationId}
                onChange={e => setNewPO({...newPO, destinationLocationId: e.target.value})}
                className="w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              >
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SKU Item</label>
            <select
              value={newPO.itemId}
              onChange={e => {
                const item = items.find(i => i._id === e.target.value);
                setNewPO({...newPO, itemId: e.target.value, unitPrice: item ? item.unitCost : 0});
              }}
              className="w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            >
              {items.map(i => <option key={i._id} value={i._id}>{i.name} ({i.sku})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Ordered Quantity" type="number" required value={newPO.orderedQuantity} onChange={e => setNewPO({...newPO, orderedQuantity: Number(e.target.value)})} />
            <Input label="Contracted Unit Price (KES)" type="number" required value={newPO.unitPrice} onChange={e => setNewPO({...newPO, unitPrice: Number(e.target.value)})} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Purchase Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
