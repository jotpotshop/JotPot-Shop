import React from 'react';
import {
  X,
  Printer,
  Truck,
  Package,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ShippingLabelModal: React.FC = () => {
  const {
    orderForShippingLabel,
    setOrderForShippingLabel,
    websiteSettings,
    t,
    formatPrice,
  } = useShop();

  if (!orderForShippingLabel) return null;

  const order = orderForShippingLabel;
  const courierInfo = order.courierInfo || {
    courierName: 'Steadfast',
    courierNameBn: 'স্টেডফাস্ট কুরিয়ার',
    consignmentId: order.trackingNumber !== 'PENDING' ? order.trackingNumber : 'STF-8491028BD',
    trackingCode: order.trackingNumber !== 'PENDING' ? order.trackingNumber : 'STF-8491028BD',
    trackingUrl: 'https://steadfast.com.bd',
    courierStatus: 'In Transit',
    weightKg: 0.8,
    codAmount: order.paymentMethod === 'cod' ? order.totalAmount : 0,
    shippingCharge: 60,
    dispatchedDate: order.orderDate,
    specialInstructions: 'Handle with care. Inspect before delivery.',
    hubName: `${order.address.district} Hub`,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top actions */}
        <div className="px-6 py-3.5 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7] print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#4b5563] uppercase tracking-wider">
              {t('কুরিয়ার শিপিং লেবেল ও চালান স্লিপ', 'Courier Shipping Label & Consignment Note')}
            </span>
            <span className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[10px] font-bold px-2 py-0.5 rounded">
              READY TO STICK ON BOX
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#111827] hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 min-h-[36px] rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('লেবেল প্রিন্ট করুন', 'Print Label')}</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderForShippingLabel(null)}
              className="p-1.5 text-gray-400 hover:text-[#111827] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Label (Bordered 4x6 / A5 format standard) */}
        <div className="p-6 sm:p-8 overflow-y-auto text-[#111827] text-xs print:p-2 tabular-nums">
          <div className="border-2 border-[#111827] rounded-2xl p-5 space-y-4 bg-white">
            {/* Top Bar with Courier Logo & Consignment Code */}
            <div className="flex items-center justify-between border-b-2 border-[#111827] pb-3">
              <div>
                <span className="bg-[#111827] text-white font-bold text-xs px-2.5 py-1 rounded uppercase tracking-wider">
                  {courierInfo.courierName} EXPRESS
                </span>
                <p className="text-[10px] text-[#4b5563] mt-1 font-mono">
                  Hub: {courierInfo.hubName || order.address.district}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block">CONSIGNMENT ID:</span>
                <p className="font-mono text-base font-bold text-[#111827] tabular-nums">{courierInfo.consignmentId}</p>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="text-center py-2 bg-[#faf9f7] rounded-lg border border-dashed border-[#e6e3dd]">
              <div className="inline-block font-mono tracking-widest text-2xl font-bold scale-y-125 select-none text-[#111827]">
                ||||| | |||| ||| ||||||| ||| |||| | ||||| ||||
              </div>
              <p className="font-mono text-[10px] text-[#4b5563] tracking-widest mt-1 tabular-nums">
                *{courierInfo.consignmentId}*
              </p>
            </div>

            {/* Sender and Receiver 2-Column Box */}
            <div className="grid grid-cols-2 gap-4 border-y border-[#e6e3dd] py-3">
              {/* Sender */}
              <div className="pr-3 border-r border-[#e6e3dd]">
                <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block mb-1">
                  FROM (প্রেরক):
                </span>
                <h4 className="font-bold text-xs text-[#111827]">
                  {websiteSettings.storeName}
                </h4>
                <p className="text-[11px] text-[#4b5563] mt-0.5 leading-snug">
                  {websiteSettings.officeAddress}
                </p>
                <p className="font-mono text-[11px] text-[#111827] font-bold mt-1 flex items-center space-x-1 tabular-nums">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{websiteSettings.hotline}</span>
                </p>
              </div>

              {/* Recipient */}
              <div className="pl-1">
                <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider block mb-1">
                  DELIVER TO (প্রাপক):
                </span>
                <h4 className="font-bold text-sm text-[#111827]">
                  {order.customerName}
                </h4>
                <p className="font-mono font-bold text-xs text-[#881337] mt-0.5 flex items-center space-x-1 tabular-nums">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{order.phone}</span>
                </p>
                {order.alternativePhone && (
                  <p className="font-mono text-[10px] text-[#4b5563] tabular-nums">
                    Alt: {order.alternativePhone}
                  </p>
                )}
                <p className="text-[11px] text-[#111827] mt-1 font-medium leading-snug">
                  {order.address.fullAddress}
                </p>
                <p className="font-bold text-[#111827] mt-1">
                  {order.address.area}, {order.address.district}
                </p>
              </div>
            </div>

            {/* COD Amount Banner */}
            <div className="bg-[#111827] text-white p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-300 block tracking-wider">
                  CASH TO COLLECT (ক্যাশ অন ডেলিভারি):
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-300 tabular-nums">
                  {order.paymentMethod === 'cod' ? formatPrice(courierInfo.codAmount) : 'PAID (৳০ COD)'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase block">পেমেন্ট মেথড:</span>
                <span className="font-mono font-bold uppercase text-xs">
                  {order.paymentMethod} • {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Order Items & Package Details */}
            <div className="border border-[#e6e3dd] rounded-xl p-3 bg-[#faf9f7] space-y-1.5 text-[11px] tabular-nums">
              <div className="flex justify-between font-bold text-[#111827] pb-1 border-b border-[#e6e3dd]">
                <span>পণ্য ও ভ্যারিয়েন্ট ({order.items.length} items)</span>
                <span>ওজন: {courierInfo.weightKg} KG</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[#4b5563]">
                  <span className="truncate pr-2">
                    • {item.quantity}x {item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ''}
                  </span>
                  <span className="font-mono shrink-0">{item.product.sku}</span>
                </div>
              ))}
            </div>

            {/* Special Instructions & Footer */}
            <div className="pt-2 text-[10px] text-[#4b5563] flex items-center justify-between tabular-nums">
              <div>
                <span className="font-bold text-[#111827]">বিশেষ নোট: </span>
                <span>{order.customerNote || courierInfo.specialInstructions || 'ডেলিভারির সময় বক্স খুলে দেখতে দিন'}</span>
              </div>
              <span className="font-mono">Order ID: #{order.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
