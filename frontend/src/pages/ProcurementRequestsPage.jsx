import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { Input } from '../components/shared/Input';
import { procurementApi } from '../api/procurementApi';
import { inventoryApi } from '../api/inventoryApi';
import { Plus, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';

export const ProcurementRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newRequest, setNewRequest] = useState({
    itemId: '',
    quantity: 100,
    reason: 'Field seasonal replenishment'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prRes, itemRes] = await Promise.all([
        procurementApi.getPurchaseRequests(),
        inventoryApi.getItems()
      ]);
      setRequests(prRes.requests || []);
      setItems(itemRes.items || []);
      if (itemRes.items?.length > 0 && !newRequest.itemId) {
        setNewRequest(prev => ({ ...prev, itemId: itemRes.items[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePR = async (e) => {
    e.preventDefault();
    try {
      const targetItem = items.find(i => i._id === newRequest.itemId);
      await procurementApi.createPurchaseRequest({
        items: [
          {
            itemId: newRequest.itemId,
            quantity: Number(newRequest.quantity),
            estimatedUnitCost: targetItem ? targetItem.unitCost : 1000
          }
        ],
        reason: newRequest.reason
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to submit PR');
    }
  };

  const handleReviewPR = async (id, status) => {
    try {
      await procurementApi.reviewPurchaseRequest(id, {
        status,
        reviewNotes: `Executive review outcome: ${status}`
      });
      loadData();
    } catch (err) {
      alert(err.message || 'Review action failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Requests (PR)"
        description="Internal requisition workflow for agricultural inputs, safety stock buffers, and field supplies."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Purchase Request
          </Button>
        }
      />

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
            <tr>
              <th className="p-4">PR Number</th>
              <th className="p-4">Requested By</th>
              <th className="p-4">Items / Quantity</th>
              <th className="p-4">Estimated Total</th>
              <th className="p-4">Reason / Notes</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading purchase requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No purchase requests registered.</td></tr>
            ) : (
              requests.map(pr => (
                <tr key={pr._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-mono font-bold">{pr.requestNumber}</td>
                  <td className="p-4">{pr.requestedBy?.name || 'User'}</td>
                  <td className="p-4 font-semibold">
                    {pr.items?.map(i => `${i.itemName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                    KES {(pr.totalEstimatedCost || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{pr.reason}</td>
                  <td className="p-4"><StatusBadge status={pr.status} /></td>
                  <td className="p-4 text-right space-x-2">
                    {pr.status === 'Pending Review' && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => handleReviewPR(pr._id, 'Approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReviewPR(pr._id, 'Rejected')}>
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Purchase Request">
        <form onSubmit={handleCreatePR} className="space-y-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Item SKU</label>
            <select
              value={newRequest.itemId}
              onChange={e => setNewRequest({...newRequest, itemId: e.target.value})}
              className="w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            >
              {items.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.sku}) - KES {item.unitCost}/{item.unit}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Required Quantity"
            type="number"
            required
            value={newRequest.quantity}
            onChange={e => setNewRequest({...newRequest, quantity: Number(e.target.value)})}
          />

          <Input
            label="Justification Reason"
            required
            value={newRequest.reason}
            onChange={e => setNewRequest({...newRequest, reason: e.target.value})}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit PR</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
