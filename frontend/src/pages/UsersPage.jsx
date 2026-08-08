import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { userApi } from '../api/userApi';
import { Plus, Users, Shield } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'Inventory Planner',
    phone: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.createUser(newUser);
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userApi.updateUser(user._id, { isActive: !user.isActive });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Management (RBAC)"
        description="Enforce strict role-based access control, tenant isolation, and account authorization."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create User Account
          </Button>
        }
      />

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
            <tr>
              <th className="p-4">Name / Email</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Last Login</th>
              <th className="p-4">Account Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading user directory...</td></tr>
            ) : (
              users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                    <div className="text-slate-400 text-[11px]">{u.email}</div>
                  </td>
                  <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{u.role}</td>
                  <td className="p-4 text-slate-500">{u.phone || 'N/A'}</td>
                  <td className="p-4 text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td className="p-4"><StatusBadge status={u.isActive ? 'Active' : 'Inactive'} /></td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(u)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Authorized User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Full Name" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="e.g. Samuel Kiptoo" />
          <Input label="Email Address" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="samuel@harvestiq.org" />
          <Input label="Initial Password" type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          <Select
            label="Assigned System Role"
            value={newUser.role}
            onChange={e => setNewUser({...newUser, role: e.target.value})}
            options={[
              { label: 'Procurement Manager', value: 'Procurement Manager' },
              { label: 'Inventory Planner', value: 'Inventory Planner' },
              { label: 'Warehouse User', value: 'Warehouse User' },
              { label: 'Supplier', value: 'Supplier' },
              { label: 'Finance Reviewer', value: 'Finance Reviewer' },
              { label: 'Administrator', value: 'Administrator' }
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
