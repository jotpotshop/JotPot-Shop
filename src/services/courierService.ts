import { CourierConfig, CourierPartner, Order, CourierConsignmentInfo } from '../types';

export interface CourierConnectionTestResult {
  success: boolean;
  message: string;
  messageBn: string;
  balance?: number;
  latencyMs: number;
  accountName?: string;
  verifiedAt: string;
  configured?: boolean;
  details?: Record<string, any>;
}

export interface CourierSetupGuide {
  id: CourierPartner;
  name: string;
  nameBn: string;
  taglineBn: string;
  portalUrl: string;
  portalName: string;
  supportPhone: string;
  steps: Array<{
    title: string;
    description: string;
    codeSnippet?: string;
  }>;
  requiredFields: string[];
  webhookInstruction: string;
  faq: Array<{ q: string; a: string }>;
}

export const COURIER_SETUP_GUIDES: Partial<Record<CourierPartner, CourierSetupGuide>> = {
  Steadfast: {
    id: 'Steadfast',
    name: 'Steadfast Courier',
    nameBn: 'স্টেডফাস্ট কুরিয়ার',
    taglineBn: 'বাংলাদেশের সবচেয়ে জনপ্রিয় ও দ্রুততম ক্যাশ অন ডেলিভারি (COD) পেমেন্ট সেবা',
    portalUrl: 'https://portal.steadfast.com.bd',
    portalName: 'Steadfast Merchant Portal',
    supportPhone: '09678-045045',
    requiredFields: ['STEADFAST_API_KEY', 'STEADFAST_SECRET_KEY'],
    webhookInstruction: 'Steadfast মার্চেন্ট পোর্টালে Webhook যুক্ত করলে পার্সেল ডেলিভারি বা রিটার্নের সাথে সাথে আপনার শপে অর্ডার অটো-আপডেট হবে।',
    steps: [
      {
        title: '১. Steadfast মার্চেন্ট পোর্টালে লগইন করুন',
        description: 'https://portal.steadfast.com.bd ওয়েবসাইটে গিয়ে আপনার নিবন্ধিত মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন।',
      },
      {
        title: '২. সেটিংস থেকে API Information এ যান',
        description: 'মার্চেন্ট ড্যাশবোর্ডের মেন্যু থেকে "Settings" > "API Information" ট্যাবে গিয়ে আপনার ইউনিক Api-Key ও Secret-Key সংগ্রহ করুন।',
      },
      {
        title: '৩. ক্লাউডফ্লেয়ার (Cloudflare) সিক্রেটসে কি-গুলো সেভ করুন',
        description: 'Cloudflare Pages / Workers ড্যাশবোর্ডে গিয়ে Settings > Environment Variables এ STEADFAST_API_KEY এবং STEADFAST_SECRET_KEY ভ্যালু হিসেবে যুক্ত করুন।',
        codeSnippet: 'STEADFAST_API_KEY=your_api_key\nSTEADFAST_SECRET_KEY=your_secret_key',
      },
      {
        title: '৪. "কানেকশন ও ব্যালেন্স রিফ্রেশ" বাটনে ক্লিক করে যাচাই করুন',
        description: 'নিচে দেওয়া ভেরিফিকেশন বাটনে চাপ দিলে আমাদের সার্ভার সরাসরি Steadfast API যাচাই করবে। সফল হলে ব্যালেন্স ও কানেকশন সবুজ হয়ে যাবে।',
      },
    ],
    faq: [
      {
        q: 'কিভাবে কাস্টমারের কাছে ট্র্যাকিং লিঙ্ক যাবে?',
        a: 'অর্ডার পাঠানোর সাথে সাথে Steadfast এর অফিসিয়াল ট্র্যাকিং কোড (যেমন: STF-xxxxBD) তৈরি হয় এবং কাস্টমারকে ট্র্যাকিং পেইজে লিঙ্ক প্রদর্শন করা হয়।',
      },
      {
        q: 'COD টাকা কত দিনে পাওয়া যায়?',
        a: 'Steadfast এ পার্সেল ডেলিভারির পর ২৪-৪৮ ঘণ্টার মধ্যে মার্চেন্টের ব্যাংক বা বিকাশ অ্যাকাউন্টে সরাসরি টাকা ট্রান্সফার হয়।',
      },
    ],
  },
};

/**
 * Checks server-side Steadfast configuration and balance via Cloudflare server endpoint
 */
export async function checkSteadfastServerStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  balance?: number;
  message?: string;
  messageBn?: string;
}> {
  try {
    const res = await fetch('/api/steadfast/status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return {
        configured: false,
        connected: false,
        message: `Server returned status ${res.status}`,
        messageBn: `সার্ভার থেকে এরর রেসপন্স এসেছে (${res.status})`,
      };
    }
    const data = (await res.json()) as any;
    return data;
  } catch (err: any) {
    return {
      configured: false,
      connected: false,
      message: err?.message || 'Failed to connect to Steadfast server endpoint',
      messageBn: 'সার্ভার এন্ডপয়েন্টে সংযোগ করতে সমস্যা হয়েছে।',
    };
  }
}

/**
 * Tests courier API connection through server-side proxy
 */
export async function testCourierApiConnection(
  _config?: CourierConfig
): Promise<CourierConnectionTestResult> {
  const startTime = Date.now();

  try {
    const status = await checkSteadfastServerStatus();
    const latencyMs = Date.now() - startTime;
    const nowTime = new Date().toLocaleTimeString('en-GB');

    if (status.connected) {
      return {
        success: true,
        configured: true,
        balance: status.balance,
        latencyMs,
        accountName: 'Steadfast Official Merchant',
        verifiedAt: nowTime,
        message: `Successfully connected to Steadfast Courier API! Balance: ৳${Number(status.balance ?? 0).toLocaleString('en-US')}`,
        messageBn: `Steadfast API-র সাথে সফলভাবে সংযুক্ত হয়েছে! বর্তমান ব্যালেন্স: ৳${Number(status.balance ?? 0).toLocaleString('bn-BD')}`,
      };
    }

    if (status.configured && !status.connected) {
      return {
        success: false,
        configured: true,
        latencyMs,
        verifiedAt: nowTime,
        message: status.message || 'Steadfast API credentials invalid or rejected by Steadfast.',
        messageBn: status.messageBn || 'Steadfast API ক্রেডেনশিয়াল সঠিক নয় বা সংযোগ প্রত্যাখ্যান করেছে।',
      };
    }

    return {
      success: false,
      configured: false,
      latencyMs,
      verifiedAt: nowTime,
      message: 'Steadfast credentials not configured on Cloudflare server.',
      messageBn: 'ক্লাউডফ্লেয়ার সার্ভারে STEADFAST_API_KEY এবং STEADFAST_SECRET_KEY সেট করা হয়নি।',
    };
  } catch (err: any) {
    return {
      success: false,
      configured: false,
      latencyMs: Date.now() - startTime,
      verifiedAt: new Date().toLocaleTimeString('en-GB'),
      message: err?.message || 'Connection failed',
      messageBn: 'কানেকশন টেস্ট সম্পন্ন করা যায়নি।',
    };
  }
}

/**
 * Book order consignment with Steadfast via Cloudflare server endpoint
 */
export async function bookSteadfastConsignment(params: {
  orderId: string;
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}): Promise<{
  success: boolean;
  consignment_id?: string;
  tracking_code?: string;
  tracking_url?: string;
  status?: string;
  error?: string;
  errorBn?: string;
}> {
  try {
    const res = await fetch('/api/steadfast/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = (await res.json().catch(() => null)) as any;

    if (res.ok && data?.success) {
      return {
        success: true,
        consignment_id: data.consignment_id,
        tracking_code: data.tracking_code,
        tracking_url: data.tracking_url || `https://steadfast.com.bd/t/${data.tracking_code}`,
        status: data.status || 'in_review',
      };
    }

    return {
      success: false,
      error: data?.error || `Failed to create consignment (HTTP ${res.status})`,
      errorBn: data?.errorBn || 'Steadfast বুকিং ব্যর্থ হয়েছে। বিবরণ পরীক্ষা করুন।',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error booking Steadfast consignment',
      errorBn: 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট ও সার্ভার চেক করুন।',
    };
  }
}

/**
 * Fetches real-time delivery tracking status from Steadfast API via server-side endpoint
 */
export async function fetchSteadfastTracking(
  trackingCodeOrCid: string
): Promise<{ success: boolean; delivery_status?: string; error?: string }> {
  try {
    const res = await fetch(`/api/steadfast/tracking?code=${encodeURIComponent(trackingCodeOrCid)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      return {
        success: true,
        delivery_status: data.delivery_status,
      };
    }

    const data = (await res.json().catch(() => null)) as any;
    return {
      success: false,
      error: data?.error || `Tracking query failed with status ${res.status}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error querying tracking status',
    };
  }
}
