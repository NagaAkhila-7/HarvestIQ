import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { inventoryApi } from '../api/inventoryApi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Package, Edit, Trash2, ArrowUpRight } from 'lucide-react';

export const InventoryPage = () => {
  const { hasRole } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // New & Edit Item Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: '',
    type: 'Seeds',
    unit: 'bag',
    unitCost: 0,
    unitPrice: 0,
    reorderPoint: 100,
    safetyStock: 40,
    minOrderQuantity: 10,
    leadTimeDays: 7
  });

  // Delete Modal state
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canManageInventory = hasRole('Administrator', 'Inventory Planner', 'Procurement Manager');

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes] = await Promise.all([
        inventoryApi.getItems({ search, type: typeFilter }),
        inventoryApi.getCategories()
      ]);
      setItems(itemsRes.items || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, typeFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      sku: '',
      name: '',
      categoryId: categories[0]?._id || '',
      type: 'Seeds',
      unit: 'bag',
      unitCost: 0,
      unitPrice: 0,
      reorderPoint: 100,
      safetyStock: 40,
      minOrderQuantity: 10,
      leadTimeDays: 7
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku || '',
      name: item.name || '',
      categoryId: item.categoryId?._id || item.categoryId || categories[0]?._id || '',
      type: item.type || 'Seeds',
      unit: item.unit || 'bag',
      unitCost: item.unitCost || 0,
      unitPrice: item.unitPrice || 0,
      reorderPoint: item.reorderPoint || 100,
      safetyStock: item.safetyStock || 40,
      minOrderQuantity: item.minOrderQuantity || 10,
      leadTimeDays: item.leadTimeDays || 7
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryApi.updateItem(editingItem._id, formData);
      } else {
        await inventoryApi.createItem(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save item record');
    }
  };

  const confirmDelete = (item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      await inventoryApi.deleteItem(deletingItem._id);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.title')}
        description={t('inventory.description')}
        actions={
          canManageInventory ? (
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1" />
              {t('inventory.addItem')}
            </Button>
          ) : null
        }
      />

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('inventory.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{t('inventory.allCategories')}</option>
            <option value="Seeds">Seeds</option>
            <option value="Fertilisers">Fertilisers</option>
            <option value="Pesticides">Pesticides</option>
            <option value="Packaging">Packaging</option>
            <option value="Spare parts">Spare parts</option>
            <option value="Harvested produce">Harvested produce</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">{t('inventory.sku')}</th>
                <th className="p-4">{t('inventory.category')}</th>
                <th className="p-4">{t('inventory.currentStock')}</th>
                <th className="p-4">{t('inventory.safetyStock')}</th>
                <th className="p-4">{t('inventory.reorderPoint')}</th>
                <th className="p-4">{t('inventory.unitCost')}</th>
                <th className="p-4">{t('inventory.status')}</th>
                <th className="p-4 text-right">{t('inventory.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">{t('inventory.loadingItems')}</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">{t('inventory.noItems')}</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{item.type}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      {item.currentStock || 0} {item.unit}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{item.safetyStock} {item.unit}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{item.reorderPoint} {item.unit}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      KES {(item.unitCost || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={item.stockStatus} />
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <Link to={`/inventory/items/${item._id}`}>
                        <Button variant="outline" size="sm" title={t('inventory.details')}>
                          {t('inventory.details')}
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                      {canManageInventory && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openEditModal(item)} title={t('inventory.editSku')}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => confirmDelete(item)} title={t('inventory.deleteSku')}>
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* New / Edit Item Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? t('inventory.editItem') : t('inventory.registerItem')}>
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('inventory.skuCode')} required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. SEED-MAIZE-H614" />
            <Input label={t('inventory.itemName')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Hybrid Maize Seed 25kg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('inventory.categoryType')}
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              options={[
                { label: 'Seeds', value: 'Seeds' },
                { label: 'Fertilisers', value: 'Fertilisers' },
                { label: 'Pesticides', value: 'Pesticides' },
                { label: 'Packaging', value: 'Packaging' },
                { label: 'Spare parts', value: 'Spare parts' },
                { label: 'Harvested produce', value: 'Harvested produce' }
              ]}
            />
            <Select
              label={t('inventory.unitOfMeasure')}
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
              options={[
                { label: '50kg Bag', value: 'bag' },
                { label: 'Kilograms (kg)', value: 'kg' },
                { label: 'Litres (L)', value: 'L' },
                { label: 'Units', value: 'unit' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('inventory.unitCost')} type="number" required value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: Number(e.target.value)})} />
            <Input label={t('inventory.unitPrice')} type="number" required value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label={t('inventory.reorderPoint')} type="number" value={formData.reorderPoint} onChange={e => setFormData({...formData, reorderPoint: Number(e.target.value)})} />
            <Input label={t('inventory.safetyStock')} type="number" value={formData.safetyStock} onChange={e => setFormData({...formData, safetyStock: Number(e.target.value)})} />
            <Input label={t('inventory.leadTimeDays')} type="number" value={formData.leadTimeDays} onChange={e => setFormData({...formData, leadTimeDays: Number(e.target.value)})} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('inventory.cancel')}</Button>
            <Button type="submit" variant="primary">
              {editingItem ? t('inventory.saveChanges') : t('inventory.saveRecord')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('inventory.confirmDelete')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t('inventory.deleteWarning')} <strong>{deletingItem?.name}</strong> ({deletingItem?.sku})?
          </p>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            ⚠️ {t('inventory.deleteNotice')}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>{t('inventory.cancel')}</Button>
            <Button type="button" variant="danger" onClick={handleDeleteItem}>{t('inventory.deleteSku')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
