import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Key,
  UserCheck,
  AlertCircle,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import {
  UserRole,
  SystemModule,
  PermissionAction,
  StaffAccount,
} from '../../types';

export const RolePermissionManager: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    adminUser,
    rolePermissions,
    updateRolePermission,
    t,
  } = useShop();

  const [selectedTargetRole, setSelectedTargetRole] = useState<UserRole>('MANAGER');

  // Staff Account modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<StaffAccount | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('ADMIN');
  const [formIsActive, setFormIsActive] = useState(true);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('ADMIN');
    setFormIsActive(true);
    setModalError('');
    setIsAccountModalOpen(true);
  };

  const handleOpenEditModal = (account: StaffAccount) => {
    setEditingAccount(account);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormPhone(account.phone);
    setFormPassword(account.password || '');
    setFormRole(account.role);
    setFormIsActive(account.isActive);
    setModalError('');
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setModalError('নাম এবং ইমেইল অবশ্যই পূরণ করতে হবে।');
      return;
    }
    if (!editingAccount && !formPassword.trim()) {
      setModalError('নতুন একাউন্টের জন্য পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    if (editingAccount) {
      updateStaffAccount({
        ...editingAccount,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: formPassword.trim() || editingAccount.password,
        role: formRole,
        isActive: formIsActive,
      });
    } else {
      addStaffAccount({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '01710000000',
        password: formPassword.trim(),
        role: formRole,
        isActive: formIsActive,
      });
    }
    setIsAccountModalOpen(false);
  };

  const modules: Array<{ id: SystemModule; labelBn: string; labelEn: string }> = [
    { id: 'products', labelBn: 'পণ্য ম্যানেজমেন্ট (Products)', labelEn: 'Products Management' },
    { id: 'orders', labelBn: 'অর্ডার ও ডেলিভারি (Orders & Delivery)', labelEn: 'Orders & Fulfillment' },
    { id: 'categories', labelBn: 'ক্যাটাগরি ও সাব-ক্যাটাগরি (Categories)', labelEn: 'Categories & Subcategories' },
    { id: 'coupons', labelBn: 'কুপন ও ডিসকাউন্ট (Coupons & Promo)', labelEn: 'Coupons & Discounts' },
    { id: 'couriers', labelBn: 'কুরিয়ার ও এপিআই সেটিংস (Couriers & API)', labelEn: 'Couriers & Logistics API' },
    { id: 'customers', labelBn: 'গ্রাহক ডিরেক্টরি (Customers)', labelEn: 'Customers Directory' },
    { id: 'homepage', labelBn: 'ব্যানার ও হোমপেজ সেকশন (Banners & Sections)', labelEn: 'Homepage Sections & Banners' },
    { id: 'settings', labelBn: 'বিজনেস ও পেমেন্ট সেটিংস (Business Settings)', labelEn: 'Business & Payment Settings' },
    { id: 'roles', labelBn: 'রোল ও পারমিশন কন্ট্রোল (RBAC Matrix)', labelEn: 'Roles & Staff Permissions' },
    { id: 'reports', labelBn: 'রিপোর্ট ও বিশ্লেষণ (Reports & Analytics)', labelEn: 'Reports & Analytics' },
  ];

  const actions: Array<{ id: PermissionAction; labelBn: string; labelEn: string; color: string }> = [
    { id: 'view', labelBn: 'দেখা (View)', labelEn: 'View', color: 'bg-blue-50 text-blue-700' },
    { id: 'create', labelBn: 'তৈরি (Create)', labelEn: 'Create', color: 'bg-emerald-50 text-emerald-700' },
    { id: 'edit', labelBn: 'এডিট (Edit)', labelEn: 'Edit', color: 'bg-amber-50 text-amber-700' },
    { id: 'delete', labelBn: 'ডিলিট (Delete)', labelEn: 'Delete', color: 'bg-rose-50 text-rose-700' },
    { id: 'approve', labelBn: 'অনুমোদন (Approve)', labelEn: 'Approve', color: 'bg-purple-50 text-purple-700' },
    { id: 'export', labelBn: 'এক্সপোর্ট (Export)', labelEn: 'Export', color: 'bg-teal-50 text-teal-700' },
    { id: 'manage', labelBn: 'সম্পূর্ণ নিয়ন্ত্রণ (Manage)', labelEn: 'Manage', color: 'bg-gray-900 text-white' },
  ];

  const handleTogglePermission = (module: SystemModule, action: PermissionAction) => {
    // Only Super Admin or Admin can configure roles
    if (currentRole !== 'SUPER_ADMIN' && currentRole !== 'ADMIN') return;
    if (selectedTargetRole === 'SUPER_ADMIN') return; // Super admin always has all perms

    const currentModuleActions = rolePermissions[selectedTargetRole]?.[module] || [];
    let updated: PermissionAction[];

    if (currentModuleActions.includes(action)) {
      updated = currentModuleActions.filter(a => a !== action);
    } else {
      updated = [...currentModuleActions, action];
    }

    updateRolePermission(selectedTargetRole, module, updated);
  };

  const isActionAllowed = (role: UserRole, module: SystemModule, action: PermissionAction): boolean => {
    if (role === 'SUPER_ADMIN') return true;
    const perms = rolePermissions[role]?.[module] || [];
    return perms.includes(action) || perms.includes('manage');
  };

  return (
    <div className="space-y-6">
      {/* Role Switching & Overview Banner */}
      <div className="bg-linear-to-r from-gray-900 via-rose-950 to-gray-900 text-white p-5 rounded-3xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {t('রোল-বেজড এক্সেস কন্ট্রোল ও ইউজার পারমিশন (RBAC)', 'Role-Based Access Control & RBAC Matrix')}
              </h3>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl">
              {t(
                'সুপার এডমিন ওয়েবসাইটের সব ফিচার নিয়ন্ত্রণ করতে পারেন। এডমিন, ম্যানেজার ও স্টাফদের জন্য আলাদা আলাদা মডিউলে ভিউ, ক্রিয়েট, এডিট, ডিলিট, অ্যাপ্রুভ, এক্সপোর্ট ও ম্যানেজ পারমিশন নির্ধারণ করুন।',
                'Super Admin has supreme authority. Configure granular View, Create, Edit, Delete, Approve, Export, and Manage permissions for Admin, Manager, and Staff.'
              )}
            </p>
          </div>

          {/* Quick Active Role Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-gray-300 uppercase font-bold tracking-wider block mb-1.5">
              {t('সরাসরি টেস্ট করতে আপনার বর্তমান রোল পরিবর্তন করুন:', 'Test Live: Switch Active User Role:')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map(role => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-black/30 text-gray-300 hover:bg-black/50'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Accounts Directory */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-rose-600" />
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                {t('স্টাফ ও এডমিন একাউন্ট তালিকা', 'Staff & Admin Accounts Directory')}
              </h4>
              <p className="text-[11px] text-gray-500">
                {t('সুপার এডমিন হিসেবে নতুন স্টাফ ও এডমিন তৈরি করুন ও পাসওয়ার্ড নির্ধারণ করুন', 'Create and manage admin & staff accounts with passwords')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-medium">
              মোট একাউন্ট: {staffAccounts.length} জন
            </span>
            <button
              onClick={handleOpenCreateModal}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন একাউন্ট তৈরি করুন', '+ Create Account')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staffAccounts.map(account => (
            <div
              key={account.id}
              className={`p-3.5 rounded-2xl border text-xs transition-all flex flex-col justify-between ${
                currentRole === account.role
                  ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-500/20'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${
                      account.role === 'SUPER_ADMIN'
                        ? 'bg-rose-600 text-white'
                        : account.role === 'ADMIN'
                        ? 'bg-purple-600 text-white'
                        : account.role === 'MANAGER'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {account.role.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold flex items-center space-x-1 ${account.isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${account.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span>{account.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                  </span>
                </div>

                <h5 className="font-bold text-gray-900 text-xs">{account.name}</h5>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{account.email}</p>
                <p className="text-[10px] text-gray-500 font-mono">📞 {account.phone}</p>
                <div className="mt-1 text-[10px] text-gray-400 font-mono">
                  পাসওয়ার্ড: <span className="text-gray-700 font-bold">{account.password || '••••••••'}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                <span className="text-[9px] text-gray-400">লগইন: {account.lastLogin}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(account)}
                    className="p-1 text-gray-500 hover:text-rose-600 rounded hover:bg-gray-200/60 transition-colors cursor-pointer"
                    title="সম্পাদনা"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {account.email !== 'mdmahmudulhashan0@gmail.com' && (
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি নিশ্চিত যে "${account.name}" একাউন্টটি মুছে ফেলতে চান?`)) {
                          deleteStaffAccount(account.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Create / Edit Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">
                  {editingAccount ? t('একাউন্ট সম্পাদনা করুন', 'Edit Staff Account') : t('নতুন এডমিন/স্টাফ একাউন্ট', 'Create Staff Account')}
                </h4>
                <p className="text-xs text-rose-100">
                  {t('লগইন করার জন্য ইমেইল ও পাসওয়ার্ড দিন', 'Set credentials for dashboard access')}
                </p>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">পূর্ণ নাম (Full Name)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব হাসান"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ইমেইল / লগইন ইউজারনেম (Email)</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="staff@jotpotshop.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর (Phone)</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">লগইন পাসওয়ার্ড (Password)</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder={editingAccount ? 'পরিবর্তন না করতে চাইলে খালি রাখুন' : 'শক্তিশালী পাসওয়ার্ড দিন'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-10 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">রোল ও পারমিশন লেভেল (Role)</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="ADMIN">ADMIN (সম্পূর্ণ এডমিন ক্ষমতা)</option>
                  <option value="MANAGER">MANAGER (অর্ডার ও পণ্য ম্যানেজার)</option>
                  <option value="STAFF">STAFF (অর্ডার কল ও সাপোর্ট স্টাফ)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (সর্বোচ্চ সিস্টেম কন্ট্রোল)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="activeAccountCheckbox"
                  checked={formIsActive}
                  onChange={e => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="activeAccountCheckbox" className="font-semibold text-gray-800 cursor-pointer">
                  একাউন্ট সক্রিয় রাখুন (Active)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {editingAccount ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Matrix Configuration Table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
              {t('পারমিশন ম্যাট্রিক্স কনফিগারেশন (Permission Matrix)', 'Granular Permission Matrix')}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(
                'যে রোলের পারমিশন পরিবর্তন করতে চান তা নির্বাচন করুন এবং টিক দিন',
                'Select role to inspect and configure View, Create, Edit, Delete, Approve, Export, Manage per module'
              )}
            </p>
          </div>

          {/* Role selector tab */}
          <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl">
            {(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => setSelectedTargetRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTargetRole === role
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {selectedTargetRole === 'SUPER_ADMIN' && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>সুপার এডমিন (SUPER ADMIN):</strong> ওয়েবসাইটের সিস্টেমের সর্বোচ্চ ক্ষমতাসম্পন্ন রোল। সব মডিউল ও অ্যাকশন স্বয়ংক্রিয়ভাবে আনলকড ও আনলিমিটেড।
            </span>
          </div>
        )}

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">মডিউল (System Module)</th>
                {actions.map(act => (
                  <th key={act.id} className="py-3 px-3 text-center min-w-[90px]">
                    {act.labelEn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {modules.map(mod => (
                <tr key={mod.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <span className="block">{mod.labelBn}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{mod.labelEn}</span>
                  </td>

                  {actions.map(act => {
                    const allowed = isActionAllowed(selectedTargetRole, mod.id, act.id);
                    const isReadOnly = selectedTargetRole === 'SUPER_ADMIN';

                    return (
                      <td key={act.id} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => handleTogglePermission(mod.id, act.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            allowed
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                              : 'bg-gray-100 text-gray-300 hover:bg-gray-200 cursor-pointer'
                          } ${isReadOnly ? 'cursor-default opacity-90' : ''}`}
                          title={`${allowed ? 'Allowed' : 'Denied'}: ${act.labelEn} on ${mod.id}`}
                        >
                          {allowed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
