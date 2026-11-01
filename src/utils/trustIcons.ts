import React from 'react';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  CreditCard,
  Award,
  Zap,
  Clock,
  Heart,
  Star,
  ThumbsUp,
  Gift,
  BadgeCheck,
  PackageCheck,
  Lock,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  PhoneCall,
  Coins,
  Shield,
  Box,
  Eye,
  LucideIcon,
} from 'lucide-react';

export interface TrustIconOption {
  name: string;
  labelBn: string;
  labelEn: string;
  icon: LucideIcon;
}

export const TRUST_ICON_CATALOG: TrustIconOption[] = [
  { name: 'Truck', labelBn: 'ডেলিভারি ট্রাক', labelEn: 'Delivery Truck', icon: Truck },
  { name: 'RotateCcw', labelBn: 'রিটার্ন ও এক্সচেঞ্জ', labelEn: 'Easy Return', icon: RotateCcw },
  { name: 'Award', labelBn: 'অথেনটিক অ্যাওয়ার্ড', labelEn: 'Authentic Award', icon: Award },
  { name: 'CreditCard', labelBn: 'নিরাপদ পেমেন্ট', labelEn: 'Card Payment', icon: CreditCard },
  { name: 'Headphones', labelBn: 'কাস্টমার কেয়ার', labelEn: 'Customer Support', icon: Headphones },
  { name: 'ShieldCheck', labelBn: 'নিরাপত্তা শিল্ড', labelEn: 'Verified Shield', icon: ShieldCheck },
  { name: 'Zap', labelBn: 'দ্রুত ডেলিভারি', labelEn: 'Lightning Fast', icon: Zap },
  { name: 'Clock', labelBn: 'সময়নিষ্ঠ সেবা', labelEn: 'Punctual Clock', icon: Clock },
  { name: 'Heart', labelBn: 'গ্রাহকের ভালোবাসা', labelEn: 'Customer Love', icon: Heart },
  { name: 'Star', labelBn: 'টপ রেটিং ও মান', labelEn: 'Top Rated', icon: Star },
  { name: 'ThumbsUp', labelBn: 'নিশ্চিত সন্তুষ্টি', labelEn: '100% Satisfaction', icon: ThumbsUp },
  { name: 'Gift', labelBn: 'স্পেশাল উপহার/অফার', labelEn: 'Surprise Gift', icon: Gift },
  { name: 'BadgeCheck', labelBn: 'ভেরিফাইড ব্যাজ', labelEn: 'Badge Check', icon: BadgeCheck },
  { name: 'PackageCheck', labelBn: 'কোয়ালিটি চেকড পার্সেল', labelEn: 'Inspected Parcel', icon: PackageCheck },
  { name: 'Lock', labelBn: 'SSL সিকিউরড', labelEn: 'SSL Encryption', icon: Lock },
  { name: 'Sparkles', labelBn: 'প্রিমিয়াম কোয়ালিটি', labelEn: 'Sparkling Quality', icon: Sparkles },
  { name: 'ShoppingBag', labelBn: 'শপিং ব্যাগ', labelEn: 'Shopping Bag', icon: ShoppingBag },
  { name: 'CheckCircle', labelBn: 'সফল ভেরিফিকেশন', labelEn: 'Check Circle', icon: CheckCircle },
  { name: 'PhoneCall', labelBn: 'হটলাইন কল', labelEn: 'Phone Call', icon: PhoneCall },
  { name: 'Coins', labelBn: 'ক্যাশ অন ডেলিভারি', labelEn: 'Coins & Cash', icon: Coins },
  { name: 'Shield', labelBn: 'সুরক্ষা গ্যারান্টি', labelEn: 'Shield Guarantee', icon: Shield },
  { name: 'Box', labelBn: 'নিরাপদ বক্স প্যাকিং', labelEn: 'Secure Box', icon: Box },
  { name: 'Eye', labelBn: 'দেখে বুঝে ক্রয়', labelEn: 'Check Before Pay', icon: Eye },
];

export const getTrustIconComponent = (iconName: string): LucideIcon => {
  const match = TRUST_ICON_CATALOG.find(
    item => item.name.toLowerCase() === (iconName || '').trim().toLowerCase()
  );
  return match ? match.icon : ShieldCheck;
};
