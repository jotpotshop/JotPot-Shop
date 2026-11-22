import React, { useState } from 'react';
import {
  X,
  Edit,
  Save,
  Trash2,
  Plus,
  MapPin,
  User,
  Phone,
  DollarSign,
  AlertCircle,
  Package,
  Lock,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BD_DISTRICTS } from '../../data/mockData';
import { Order, OrderStatus } from '../../types';

interface OrderEditModalContentProps {
  order: Order;
  onClose: () => void;
  editOrder: (orderId: string, updatedFields: Partial<Order>) => void;
  t: (bn: string, en: string) => string;
  formatPrice: (amount: number) => string;
  currentRole: string;
}

const OrderEditModalContent: React.FC<OrderEditModalContentProps> = ({
  order,
  onClose,
  editOrder,
  t,
  formatPrice,
  currentRole,
}) => {
  const isStaff = currentRole === 'STAFF';
  const isManager = currentRole === 'MANAGER';
  const [customerName, setCustomerName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.phone);
  const [alternativePhone, setAlternativePhone] = useState(order.alternativePhone || '');
  const [district, setDistrict] = useState(order.address.district);
  const [area, setArea] = useState(order.address.area);
  const [fullAddress, setFullAddress] = useState(order.address.fullAddress);
  const [customerNote, setCustomerNote] = useState(order.customerNote || '');
  const [discount, setDiscount] = useState(order.discount);
  const [deliveryFee, setDeliveryFee] = useState(order.deliveryFee);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid'>(order.paymentStatus);
  const [items, setItems] = useState([...order.items]);

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setItems(prev =>
        prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - Number(discount) + Number(deliveryFee));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    editOrder(order.id, {
      customerName,
      phone,
      alternativePhone: alternativePhone || undefined,
      address: {
        district,
        area,
        fullAddress,
      },
      customerNote,
      items,
      subtotal,
      discount: Number(discount),
      deliveryFee: Number(deliveryFee),
      totalAmount,
      status,
      paymentStatus,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] flex items-center justify-between bg-[#111827] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#1f2937] border border-gray-700 text-white flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  {t('অর্ডার সম্পাদনা করুন (Edit Order)', 'Edit Customer Order')}
                </h3>
                <span className="font-mono text-xs bg-[#1f2937] border border-gray-700 text-gray-200 font-bold px-2 py-0.5 rounded tabular-nums">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {t('গ্রাহকের নাম, ঠিকানা, পণ্যের সংখ্যা ও মূল্য সংশোধন করুন', 'Modify customer address, items, and pricing adjustments')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1f2937] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Customer & Address Details */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
              {t('গ্রাহকের বিবরণ ও ঠিকানা:', 'Customer & Shipping Address:')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Primary Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Alternative Phone</label>
                <input
                  type="tel"
                  value={alternativePhone}
                  onChange={e => setAlternativePhone(e.target.value)}
                  placeholder="Optional alternate mobile"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">District / Division</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium cursor-pointer"
                >
                  {BD_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Area / Thana</label>
                <input
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Full Delivery Address</label>
              <textarea
                rows={2}
                value={fullAddress}
                onChange={e => setFullAddress(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Customer Special Note</label>
              <input
                type="text"
                value={customerNote}
                onChange={e => setCustomerNote(e.target.value)}
                placeholder="Special instructions by customer"
                className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
              />
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
              {t('অর্ডারকৃত পণ্য তালিকা (Items List):', 'Ordered Items:')}
            </span>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-[#e6e3dd]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center text-gray-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-[#111827] truncate text-xs">{item.product.name}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-500 tabular-nums">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        <span className="font-bold text-[#881337]">Unit: {formatPrice(item.product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 tabular-nums">
                    <div className="flex items-center border border-[#e6e3dd] rounded-lg overflow-hidden bg-[#faf9f7]">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 font-bold text-[#111827]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-[#111827] w-16 text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-gray-400 hover:text-[#b91c1c] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Adjustments & Status */}
          {isStaff && (
            <div className="p-3 bg-[#faf9f7] rounded-2xl border border-[#e6e3dd] text-[11px] text-[#111827] flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#881337] shrink-0" />
              <span>
                <strong>স্টাফ অনুমতি সীমাবদ্ধ:</strong> আপনি শুধুমাত্র গ্রাহকের ফোন, অল্টারনেট নম্বর, ডেলিভারি ঠিকানা এবং নোট আপডেট করতে পারবেন। ডিসকাউন্ট ও স্ট্যাটাস পরিবর্তন শুধুমাত্র ম্যানেজার বা এডমিনের অনুমোদিত।
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#faf9f7] p-4 rounded-2xl border border-[#e6e3dd]">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Discount (৳) {isStaff && <Lock className="w-3 h-3 inline ml-1 text-gray-400" />}
              </label>
              <input
                type="number"
                disabled={isStaff}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className={`w-full border rounded-xl p-2 text-xs font-bold tabular-nums ${
                  isStaff ? 'bg-gray-100 text-gray-400 border-[#e6e3dd] cursor-not-allowed' : 'bg-white border-[#e6e3dd] text-[#881337]'
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Delivery Charge (৳) {isStaff && <Lock className="w-3 h-3 inline ml-1 text-gray-400" />}
              </label>
              <input
                type="number"
                disabled={isStaff}
                value={deliveryFee}
                onChange={e => setDeliveryFee(Number(e.target.value))}
                className={`w-full border rounded-xl p-2 text-xs font-bold tabular-nums ${
                  isStaff ? 'bg-gray-100 text-gray-400 border-[#e6e3dd] cursor-not-allowed' : 'bg-white border-[#e6e3dd] text-[#111827]'
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Order Status {isStaff && <Lock className="w-3 h-3 inline ml-1 text-gray-400" />}
              </label>
              <select
                disabled={isStaff}
                value={status}
                onChange={e => setStatus(e.target.value as OrderStatus)}
                className={`w-full border rounded-xl p-2 text-xs font-semibold ${
                  isStaff ? 'bg-gray-100 text-gray-400 border-[#e6e3dd] cursor-not-allowed' : 'bg-white border-[#e6e3dd] cursor-pointer'
                }`}
              >
                <option value="Pending">Pending (যাচাই অপেক্ষমান)</option>
                <option value="Confirmed">Confirmed (নিশ্চিত)</option>
                <option value="Processing">Processing (প্রক্রিয়াকরণ)</option>
                <option value="Packed">Packed (প্যাকেজিং সম্পন্ন)</option>
                <option value="Shipped">Shipped (কুরিয়ারে প্রেরিত)</option>
                <option value="Out for Delivery">Out for Delivery (ডেলিভারিতে বের হয়েছে)</option>
                <option value="Delivered">Delivered (সফল ডেলিভারি)</option>
                <option value="On Hold">On Hold (হোল্ড)</option>
                <option value="Cancelled">Cancelled (বাতিল)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Payment Status {isStaff && <Lock className="w-3 h-3 inline ml-1 text-gray-400" />}
              </label>
              <select
                disabled={isStaff}
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as any)}
                className={`w-full border rounded-xl p-2 text-xs font-semibold ${
                  isStaff ? 'bg-gray-100 text-gray-400 border-[#e6e3dd] cursor-not-allowed' : 'bg-white border-[#e6e3dd] cursor-pointer'
                }`}
              >
                <option value="Pending">Pending (অপেক্ষমান)</option>
                <option value="Paid">Paid (পরিশোধিত)</option>
              </select>
            </div>
          </div>

          {/* Summary Box */}
          <div className="flex items-center justify-between bg-[#faf9f7] p-4 rounded-2xl border border-[#e6e3dd] text-xs font-bold">
            <span className="text-gray-700">সর্বমোট প্রদেয় মূল্য (New Total Amount):</span>
            <span className="text-base text-[#881337] font-black tabular-nums">{formatPrice(totalAmount)}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#e6e3dd]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#faf9f7] hover:bg-gray-100 border border-[#e6e3dd] text-gray-700 font-bold px-4 py-2.5 min-h-[40px] rounded-xl text-xs cursor-pointer transition-colors"
            >
              {t('বাতিল', 'Cancel')}
            </button>

            <button
              type="submit"
              className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-bold px-5 py-2.5 min-h-[40px] rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সংশোধন সেভ করুন', 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const OrderEditModal: React.FC = () => {
  const {
    orderForEdit,
    setOrderForEdit,
    editOrder,
    t,
    formatPrice,
    currentRole,
  } = useShop();

  if (!orderForEdit) return null;

  return (
    <OrderEditModalContent
      key={orderForEdit.id}
      order={orderForEdit}
      onClose={() => setOrderForEdit(null)}
      editOrder={editOrder}
      t={t}
      formatPrice={formatPrice}
      currentRole={currentRole}
    />
  );
};
