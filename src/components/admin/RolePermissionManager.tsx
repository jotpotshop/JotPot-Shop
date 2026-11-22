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
  RefreshCw,
  Phone,
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
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    adminUser,
    rolePermissions,
    updateRolePermission,
    resetRolePermissionsToDefault,
    t,
  } = useShop();

  const [selectedTargetRole, setSelectedTargetRole] = useState<UserRole>('MANAGER');
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

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
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [confirmDeleteAccountId, setConfirmDeleteAccountId] = useState<string | null>(null);
  const [confirmResetRbac, setConfirmResetRbac] = useState(false);
  const [staffActionFeedback, setStaffActionFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setModalError('নাম এবং ইমেইল অবশ্যই পূরণ করতে হবে।');
      return;
    }
    if (!editingAccount && !formPassword.trim()) {
      setModalError('নতুন একাউন্টের জন্য পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSavingAccount(true);
    setModalError('');
    try {
      const res = editingAccount
        ? await updateStaffAccount({
            ...editingAccount,
            name: formName.trim(),
            email: formEmail.trim(),
            phone: formPhone.trim(),
            password: formPassword.trim() || editingAccount.password,
            role: formRole,
            isActive: formIsActive,
          })
        : await addStaffAccount({
            name: formName.trim(),
            email: formEmail.trim(),
            phone: formPhone.trim() || '01710000000',
            password: formPassword.trim(),
            role: formRole,
            isActive: formIsActive,
          });

      if (!res.success) {
        setModalError(res.error || 'অ্যাকাউন্ট Firebase-এ সংরক্ষণ করা যায়নি।');
        return;
      }

      setIsAccountModalOpen(false);
      setStaffActionFeedback({
        text: editingAccount
          ? 'স্টাফ একাউন্ট সফলভাবে Firebase-এ আপডেট হয়েছে।'
          : 'নতুন স্টাফ একাউন্ট ও Auth প্রোফাইল সফলভাবে তৈরি হয়েছে!',
        type: 'success',
      });
      setTimeout(() => setStaffActionFeedback(null), 4000);
    } finally {
      setIsSavingAccount(false);
    }
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
      <div className="bg-[#111827] text-white p-5 rounded-2xl border border-[#1f2937]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-white shrink-0" />
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {t('রোল-বেজড এক্সেস কন্ট্রোল ও ইউজার পারমিশন (RBAC)', 'Role-Based Access Control & RBAC Matrix')}
              </h3>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-[1.65]">
              {t(
                'সুপার এডমিন ওয়েবসাইটের সব ফিচার নিয়ন্ত্রণ করতে পারেন। এডমিন, ম্যানেজার ও স্টাফদের জন্য আলাদা আলাদা মডিউলে ভিউ, ক্রিয়েট, এডিট, ডিলিট, অ্যাপ্রুভ, এক্সপোর্ট ও ম্যানেজ পারমিশন নির্ধারণ করুন।',
                'Super Admin has supreme authority. Configure granular View, Create, Edit, Delete, Approve, Export, and Manage permissions for Admin, Manager, and Staff.'
              )}
            </p>
          </div>

          {/* Active Authority Info */}
          <div className="bg-[#1f2937] p-3.5 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center space-x-1.5 text-white text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>সুপার এডমিন মাস্টার কন্ট্রোল হাব</span>
            </div>
            <p className="text-[11px] text-gray-300">
              লগইনকৃত: <strong className="text-white font-mono">{adminUser?.name || 'সুপার এডমিন'}</strong> ({adminUser?.email})
            </p>
          </div>
        </div>
      </div>

      {/* Staff Accounts Directory */}
      <div className="bg-white rounded-2xl p-5 border border-[#e6e3dd] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#881337]" />
            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#111827]">
                {t('স্টাফ ও এডমিন একাউন্ট তালিকা', 'Staff & Admin Accounts Directory')}
              </h4>
              <p className="text-[11px] text-[#4b5563]">
                {t('সুপার এডমিন হিসেবে নতুন স্টাফ ও এডমিন তৈরি করুন ও পাসওয়ার্ড নির্ধারণ করুন', 'Create and manage admin & staff accounts with passwords')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#4b5563] font-medium tabular-nums">
              মোট একাউন্ট: {staffAccounts.length} জন
            </span>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-bold px-3.5 py-2 min-h-[38px] rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন একাউন্ট তৈরি করুন', '+ Create Account')}</span>
            </button>
          </div>
        </div>

        {staffActionFeedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 border ${
              staffActionFeedback.type === 'error'
                ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
                : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
            }`}
          >
            {staffActionFeedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{staffActionFeedback.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staffAccounts.map(account => (
            <div
              key={account.id}
              className={`p-3.5 rounded-2xl border text-xs transition-colors flex flex-col justify-between ${
                currentRole === account.role
                  ? 'border-[#881337] bg-[#faf9f7]'
                  : 'border-[#e6e3dd] bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      account.role === 'SUPER_ADMIN'
                        ? 'bg-[#881337] text-white'
                        : account.role === 'ADMIN'
                        ? 'bg-[#111827] text-white'
                        : account.role === 'MANAGER'
                        ? 'bg-[#374151] text-white'
                        : 'bg-gray-200 text-[#111827]'
                    }`}
                  >
                    {account.role.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      account.isActive
                        ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]'
                        : 'bg-gray-100 text-[#4b5563]'
                    }`}
                  >
                    {account.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <h5 className="font-bold text-[#111827] text-xs">{account.name}</h5>
                <p className="text-[10px] text-[#4b5563] font-mono mt-0.5 truncate">{account.email}</p>
                <p className="text-[10px] text-[#4b5563] font-mono tabular-nums flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{account.phone}</span>
                </p>
                <div className="mt-1 text-[10px] text-[#4b5563] font-mono">
                  পাসওয়ার্ড: <span className="text-[#111827] font-bold">{account.password || '••••••••'}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#e6e3dd] flex items-center justify-between gap-2">
                <span className="text-[9px] text-[#4b5563] tabular-nums">লগইন: {account.lastLogin}</span>
                {confirmDeleteAccountId === account.id ? (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setConfirmDeleteAccountId(null);
                        const res = await deleteStaffAccount(account.id);
                        if (!res.success) {
                          setStaffActionFeedback({
                            text: `একাউন্ট ডিলিট ব্যর্থ: ${res.error || 'ফায়ারবেস ত্রুটি'}`,
                            type: 'error',
                          });
                        } else {
                          setStaffActionFeedback({
                            text: `"${account.name}" একাউন্ট সফলভাবে মুছে ফেলা হয়েছে।`,
                            type: 'success',
                          });
                        }
                        setTimeout(() => setStaffActionFeedback(null), 4000);
                      }}
                      className="px-2 py-0.5 rounded bg-[#b91c1c] text-white text-[10px] font-bold cursor-pointer"
                    >
                      মুছুন
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAccountId(null)}
                      className="px-2 py-0.5 rounded bg-gray-100 text-[#111827] text-[10px] font-bold cursor-pointer"
                    >
                      না
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(account)}
                      className="p-1 text-gray-500 hover:text-[#111827] rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      title="সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {account.email !== 'mdmahmudulhashan0@gmail.com' && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAccountId(account.id)}
                        className="p-1 text-gray-400 hover:text-[#b91c1c] rounded hover:bg-[#fef2f2] transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Create / Edit Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-[#e6e3dd] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#111827] text-white p-5 flex items-center justify-between border-b border-[#1f2937]">
              <div>
                <h4 className="font-bold text-base">
                  {editingAccount ? t('একাউন্ট সম্পাদনা করুন', 'Edit Staff Account') : t('নতুন এডমিন/স্টাফ একাউন্ট', 'Create Staff Account')}
                </h4>
                <p className="text-xs text-gray-300 mt-0.5">
                  {t('লগইন করার জন্য ইমেইল ও পাসওয়ার্ড দিন', 'Set credentials for dashboard access')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#1f2937] hover:bg-gray-700 text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-[#b91c1c] text-[11px] font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-bold text-[#111827] mb-1">পূর্ণ নাম (Full Name)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব হাসান"
                  className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl p-2.5 text-xs text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">ইমেইল / লগইন ইউজারনেম (Email)</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="staff@jotpotshop.com"
                  className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">মোবাইল নম্বর (Phone)</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl p-2.5 text-xs font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">লগইন পাসওয়ার্ড (Password)</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder={editingAccount ? 'পরিবর্তন না করতে চাইলে খালি রাখুন' : 'শক্তিশালী পাসওয়ার্ড দিন'}
                    className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl p-2.5 pr-10 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#111827] cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">রোল ও পারমিশন লেভেল (Role)</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl p-2.5 text-xs font-bold"
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
                  className="w-4 h-4 text-[#15803d] rounded cursor-pointer"
                />
                <label htmlFor="activeAccountCheckbox" className="font-semibold text-[#111827] cursor-pointer">
                  একাউন্ট সক্রিয় রাখুন (Active)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#e6e3dd]">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 min-h-[38px] rounded-xl text-[#4b5563] hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="px-5 py-2 min-h-[38px] rounded-xl bg-[#881337] hover:bg-[#6d0f2c] disabled:opacity-60 text-white font-bold cursor-pointer transition-colors"
                >
                  {isSavingAccount ? 'সংরক্ষণ হচ্ছে...' : editingAccount ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Matrix Configuration Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#e6e3dd] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-[#111827]">
              {t('পারমিশন ম্যাট্রিক্স কনফিগারেশন (Permission Matrix)', 'Granular Permission Matrix')}
            </h4>
            <p className="text-xs text-[#4b5563] mt-0.5 leading-[1.6]">
              {t(
                'যে রোলের পারমিশন পরিবর্তন করতে চান তা নির্বাচন করুন এবং টিক দিন',
                'Select role to inspect and configure View, Create, Edit, Delete, Approve, Export, Manage per module'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Reset to standard RBAC button */}
            {!confirmResetRbac ? (
              <button
                type="button"
                onClick={() => setConfirmResetRbac(true)}
                className="bg-[#faf9f7] hover:bg-[#e6e3dd]/60 text-[#111827] text-xs font-bold px-3 py-1.5 min-h-[36px] rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors border border-[#e6e3dd]"
                title="ডিফল্ট স্ট্যান্ডার্ড আরবিএসি রুলসে ফিরিয়ে নিন"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#4b5563]" />
                <span>{t('স্ট্যান্ডার্ড আরবিএসি রিসেট', 'Reset RBAC Defaults')}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 bg-[#faf9f7] border border-[#e6e3dd] px-2.5 py-1 rounded-xl">
                <span className="text-[11px] font-bold text-[#111827]">রিসেট নিশ্চিত?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetRolePermissionsToDefault();
                    setConfirmResetRbac(false);
                    setResetSuccessNotice(true);
                    setTimeout(() => setResetSuccessNotice(false), 3500);
                  }}
                  className="bg-[#881337] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  রিসেট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetRbac(false)}
                  className="bg-white border border-[#e6e3dd] text-[#111827] text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  না
                </button>
              </div>
            )}

            {/* Role selector tab */}
            <div className="flex items-center space-x-1.5 bg-[#faf9f7] border border-[#e6e3dd] p-1 rounded-xl">
              {(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedTargetRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedTargetRole === role
                      ? 'bg-[#111827] text-white'
                      : 'text-[#4b5563] hover:text-[#111827]'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {resetSuccessNotice && (
          <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[#15803d] text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0" />
            <span>সফলভাবে স্ট্যান্ডার্ড রোল ও পারমিশন নীতি রিসেট ও সক্রিয় করা হয়েছে!</span>
          </div>
        )}

        {/* Dynamic Role Capability Explainer Banner */}
        {selectedTargetRole === 'SUPER_ADMIN' && (
          <div className="p-3.5 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] text-[#111827] text-xs flex items-center space-x-2.5 leading-[1.65]">
            <ShieldCheck className="w-4 h-4 text-[#881337] shrink-0" />
            <span>
              <strong>সুপার এডমিন (SUPER ADMIN):</strong> ওয়েবসাইটের সিস্টেমের সর্বোচ্চ ক্ষমতাসম্পন্ন রোল। সমস্ত আর্থিক হিসাব, বিকাশ/নগদ মার্চেন্ট সেটিংস, স্টাফ তৈরি ও পাসওয়ার্ড, এবং সম্পূর্ণ ডাটাবেজ এক্সেস।
            </span>
          </div>
        )}

        {selectedTargetRole === 'ADMIN' && (
          <div className="p-3.5 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] text-[#111827] text-xs flex items-center space-x-2.5 leading-[1.65]">
            <Shield className="w-4 h-4 text-[#111827] shrink-0" />
            <span>
              <strong>এডমিন (ADMIN):</strong> স্টোর ক্যাটালগ ম্যানেজমেন্ট (পণ্য যোগ/এডিট/ডিলিট), কুপন তৈরি, গ্রাহক তালিকা, ডেলিভারি চার্জ। সীমাবদ্ধতা: মূল বিজনেস পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল ও স্টাফ পারমিশন সুরক্ষিত।
            </span>
          </div>
        )}

        {selectedTargetRole === 'MANAGER' && (
          <div className="p-3.5 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] text-[#111827] text-xs flex items-center space-x-2.5 leading-[1.65]">
            <UserCheck className="w-4 h-4 text-[#111827] shrink-0" />
            <span>
              <strong>ম্যানেজার (MANAGER):</strong> অর্ডার প্যাকেজিং, কুরিয়ার বুকিং (Steadfast/Pathao), চালান ও লেবেল প্রিন্ট, ওয়্যারহাউজ স্টক লো-স্টক পূরণ। সীমাবদ্ধতা: কুপন, গ্রাহক ব্যক্তিগত ডেটা, পণ্য ডিলিট বা বিক্রয় মুনাফা সুরক্ষিত।
            </span>
          </div>
        )}

        {selectedTargetRole === 'STAFF' && (
          <div className="p-3.5 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] text-[#111827] text-xs flex items-center space-x-2.5 leading-[1.65]">
            <AlertCircle className="w-4 h-4 text-[#4b5563] shrink-0" />
            <span>
              <strong>স্টাফ (STAFF):</strong> গ্রাহকদের ফোন কল করা, ঠিকানা যাচাই, কাস্টমার চ্যাট ইনবক্স এবং স্টক/মূল্য অনুসন্ধান। সীমাবদ্ধতা: কুরিয়ার ডিসপ্যাচ, ইনভয়েস এডিট, অর্ডার বাতিল বা যেকোনো আর্থিক ডেটা কঠোরভাবে নিষিদ্ধ।
            </span>
          </div>
        )}

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#e6e3dd] rounded-xl overflow-hidden">
            <thead className="bg-[#faf9f7] text-[#4b5563] border-b border-[#e6e3dd] font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">মডিউল (System Module)</th>
                {actions.map(act => (
                  <th key={act.id} className="py-3 px-3 text-center min-w-[90px]">
                    {act.labelEn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e3dd] font-medium">
              {modules.map(mod => (
                <tr key={mod.id} className="hover:bg-[#faf9f7] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#111827]">
                    <span className="block">{mod.labelBn}</span>
                    <span className="text-[10px] text-[#4b5563] font-mono">{mod.labelEn}</span>
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
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors ${
                            allowed
                              ? 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] hover:bg-emerald-100 cursor-pointer'
                              : 'bg-gray-100 text-gray-300 hover:bg-gray-200 cursor-pointer'
                          } ${isReadOnly ? 'cursor-default opacity-90' : ''}`}
                          title={`${allowed ? 'Allowed' : 'Denied'}: ${act.labelEn} on ${mod.id}`}
                        >
                          {allowed ? (
                            <CheckCircle className="w-4 h-4 text-[#15803d]" />
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
