import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { supplierApi } from '../api/supplierApi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Truck, Star, Edit, Trash2 } from 'lucide-react';

export const SuppliersPage = () => {
  const { hasRole } = useAuth();
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    paymentTerms: 'Net 30',
    status: 'Active',
    riskLevel: 'Low'
  });

  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canManageSuppliers = hasRole('Administrator', 'Procurement Manager');

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierApi.getSuppliers({ search });
      setSuppliers(res.suppliers || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      code: `SUP-${Date.now().toString().slice(-3)}`,
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      paymentTerms: 'Net 30',
      status: 'Active',
      riskLevel: 'Low'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      code: sup.code || '',
      name: sup.name || '',
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      paymentTerms: sup.paymentTerms || 'Net 30',
      status: sup.status || 'Active',
      riskLevel: sup.riskLevel || 'Low'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierApi.updateSupplier(editingSupplier._id, formData);
      } else {
        await supplierApi.createSupplier(formData);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to save supplier record');
    }
  };

  const confirmDelete = (sup) => {
    setDeletingSupplier(sup);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await supplierApi.deleteSupplier(deletingSupplier._id);
      setIsDeleteModalOpen(false);
      setDeletingSupplier(null);
      loadSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('suppliers.title')}
        description={t('suppliers.description')}
        actions={
          canManageSuppliers ? (
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1" />
              {t('suppliers.addSupplier')}
            </Button>
          ) : null
        }
      />

      <div className="glass-card p-4 flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('suppliers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-500">{t('common.loading')}</div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">{t('inventory.noItems')}</div>
        ) : (
          suppliers.map((sup) => {
            const lastEval = sup.evaluations?.[sup.evaluations.length - 1];
            return (
              <div key={sup._id} className="glass-card p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">{sup.code}</span>
                    <StatusBadge status={sup.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{sup.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{sup.contactPerson} • {sup.phone}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('suppliers.onTimeDelivery')}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{lastEval?.onTimeDeliveryRate || 95}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('suppliers.qualityPassRate')}:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{lastEval?.qualityPassRate || 98}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('suppliers.vendorRiskLevel')}:</span>
                    <StatusBadge status={sup.riskLevel} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                  <span>{t('suppliers.terms')}: {sup.paymentTerms}</span>
                  {canManageSuppliers && (
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(sup)} title={t('suppliers.editSupplier')}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => confirmDelete(sup)} title={t('suppliers.deleteSupplier')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? t('suppliers.editSupplier') : t('suppliers.registerSupplier')}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('suppliers.code')} required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="SUP-004" />
            <Input label={t('suppliers.name')} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Agro Chemical Supplies" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('suppliers.contact')} required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            <Input label={t('suppliers.phone')} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('suppliers.email')} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Select
              label={t('suppliers.paymentTerms')}
              value={formData.paymentTerms}
              onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
              options={[
                { label: 'Net 30', value: 'Net 30' },
                { label: 'Net 45', value: 'Net 45' },
                { label: 'Net 60', value: 'Net 60' },
                { label: 'Cash on Delivery', value: 'COD' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('suppliers.status')}
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              options={[
                { label: t('status.active'), value: 'Active' },
                { label: t('status.underReview'), value: 'Under Review' },
                { label: t('status.suspended'), value: 'Suspended' }
              ]}
            />
            <Select
              label={t('suppliers.riskLevel')}
              value={formData.riskLevel}
              onChange={e => setFormData({...formData, riskLevel: e.target.value})}
              options={[
                { label: t('status.low'), value: 'Low' },
                { label: t('status.medium'), value: 'Medium' },
                { label: t('status.high'), value: 'High' }
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('inventory.cancel')}</Button>
            <Button type="submit" variant="primary">{editingSupplier ? t('inventory.saveChanges') : t('inventory.saveRecord')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('suppliers.confirmDeleteTitle')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t('suppliers.deleteWarning')} <strong>{deletingSupplier?.name}</strong> ({deletingSupplier?.code})?
          </p>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            ⚠️ {t('suppliers.deleteNotice')}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>{t('inventory.cancel')}</Button>
            <Button type="button" variant="danger" onClick={handleDelete}>{t('suppliers.deleteSupplier')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
