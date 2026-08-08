import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Modal } from '../components/shared/Modal';
import { StatusBadge } from '../components/shared/StatusBadge';
import { farmerApi } from '../api/farmerApi';
import { Sprout, Plus, User, MapPin, Award } from 'lucide-react';

export const FarmersPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newFarmer, setNewFarmer] = useState({
    code: `FARM-${Date.now().toString().slice(-3)}`,
    name: '',
    phone: '',
    location: 'Bahati Sub-County',
    slaScore: 95
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [farmerRes, fieldRes] = await Promise.all([
        farmerApi.getFarmers(),
        farmerApi.getFields()
      ]);
      setFarmers(farmerRes.farmers || []);
      setFields(fieldRes.fields || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await farmerApi.createFarmer(newFarmer);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create farmer');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Farmers, Farms & Fields"
        description="Operational view of cooperative farmer membership, SLA performance ratings, crop stages, and field acreage."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Register Farmer
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {farmers.map(f => (
          <div key={f._id} className="glass-card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">{f.code}</span>
                <StatusBadge status={f.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{f.name}</h3>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {f.location} • {f.phone}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Farmer SLA Rating</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{f.slaScore || 92}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fields & Crops Overview */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <span>Active Field Acreage & Crop Stages</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-3">Field Name</th>
                <th className="p-3">Acreage</th>
                <th className="p-3">Current Crop</th>
                <th className="p-3">Growth Stage</th>
                <th className="p-3">Expected Yield</th>
                <th className="p-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {fields.map(f => (
                <tr key={f._id}>
                  <td className="p-3 font-bold">{f.fieldName}</td>
                  <td className="p-3 font-semibold">{f.acreage} Acres</td>
                  <td className="p-3">{f.currentCrop}</td>
                  <td className="p-3"><StatusBadge status={f.cropStage} /></td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{(f.expectedYieldKg || 0).toLocaleString()} kg</td>
                  <td className="p-3"><StatusBadge status={f.fieldRiskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Cooperative Member Farmer">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Farmer Code" required value={newFarmer.code} onChange={e => setNewFarmer({...newFarmer, code: e.target.value})} />
          <Input label="Full Name" required value={newFarmer.name} onChange={e => setNewFarmer({...newFarmer, name: e.target.value})} placeholder="e.g. James Mwangi" />
          <Input label="Phone Number" required value={newFarmer.phone} onChange={e => setNewFarmer({...newFarmer, phone: e.target.value})} placeholder="+254 722 000 111" />
          <Input label="Sub-County Location" value={newFarmer.location} onChange={e => setNewFarmer({...newFarmer, location: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Farmer Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
