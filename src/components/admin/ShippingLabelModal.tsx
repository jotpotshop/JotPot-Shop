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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top actions */}
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('কুরিয়ার শিপিং লেবেল ও চালান স্লিপ', 'Courier Shipping Label & Consignment Note')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              READY TO STICK ON BOX
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('লেবেল প্রিন্ট করুন', 'Print Label')}</span>
            </button>

            <button
              onClick={() => setOrderForShippingLabel(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Label (Bordered 4x6 / A5 format standard) */}
        <div className="p-6 sm:p-8 overflow-y-auto text-gray-900 text-xs print:p-2">
          <div className="border-2 border-gray-900 rounded-2xl p-5 space-y-4 bg-white shadow-xs">
            {/* Top Bar with Courier Logo & Consignment Code */}
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3">
              <div>
                <span className="bg-gray-900 text-white font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider">
                  {courierInfo.courierName} EXPRESS
                </span>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  Hub: {courierInfo.hubName || order.address.district}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">CONSIGNMENT ID:</span>
                <p className="font-mono text-base font-black text-gray-900">{courierInfo.consignmentId}</p>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="inline-block font-mono tracking-widest text-2xl font-black scale-y-125 select-none text-gray-900">
                ||||| | |||| ||| ||||||| ||| |||| | ||||| ||||
              </div>
              <p className="font-mono text-[10px] text-gray-500 tracking-widest mt-1">
                *{courierInfo.consignmentId}*
              </p>
            </div>

            {/* Sender and Receiver 2-Column Box */}
            <div className="grid grid-cols-2 gap-4 border-y border-gray-200 py-3">
              {/* Sender */}
              <div className="pr-3 border-r border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                  FROM (প্রেরক):
                </span>
                <h4 className="font-black text-xs text-gray-900">
                  {websiteSettings.storeName}
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                  {websiteSettings.officeAddress}
                </p>
                <p className="font-mono text-[11px] text-gray-800 font-bold mt-1">
                  📞 {websiteSettings.hotline}
                </p>
              </div>

              {/* Recipient */}
              <div className="pl-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                  DELIVER TO (প্রাপক):
                </span>
                <h4 className="font-black text-sm text-gray-900">
                  {order.customerName}
                </h4>
                <p className="font-mono font-black text-xs text-rose-600 mt-0.5">
                  📞 {order.phone}
                </p>
                {order.alternativePhone && (
                  <p className="font-mono text-[10px] text-gray-600">
                    Alt: {order.alternativePhone}
                  </p>
                )}
                <p className="text-[11px] text-gray-800 mt-1 font-medium leading-snug">
                  {order.address.fullAddress}
                </p>
                <p className="font-bold text-gray-900 mt-1">
                  {order.address.area}, {order.address.district}
                </p>
              </div>
            </div>

            {/* COD Amount Banner (Crucial for BD Couriers!) */}
            <div className="bg-gray-900 text-white p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-300 block tracking-wider">
                  CASH TO COLLECT (ক্যাশ অন ডেলিভারি):
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">
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
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-1.5 text-[11px]">
              <div className="flex justify-between font-bold text-gray-700 pb-1 border-b border-gray-200">
                <span>পণ্য ও ভ্যারিয়েন্ট ({order.items.length} items)</span>
                <span>ওজন: {courierInfo.weightKg} KG</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span className="truncate pr-2">
                    • {item.quantity}x {item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ''}
                  </span>
                  <span className="font-mono shrink-0">{item.product.sku}</span>
                </div>
              ))}
            </div>

            {/* Special Instructions & Footer */}
            <div className="pt-2 text-[10px] text-gray-500 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-700">বিশেষ নোট: </span>
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
