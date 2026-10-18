/**
 * Server-side handler for official Steadfast Courier API Integration
 * API Base URL: https://portal.packzy.com/api/v1
 *
 * Credentials are read strictly on the server:
 * - STEADFAST_API_KEY
 * - STEADFAST_SECRET_KEY
 * - STEADFAST_BASE_URL (defaults to https://portal.packzy.com/api/v1)
 *
 * Secrets are never exposed to browser client, VITE_ envs, public Firestore, or logs.
 */

export interface SteadfastEnv {
  STEADFAST_API_KEY?: string;
  STEADFAST_SECRET_KEY?: string;
  STEADFAST_BASE_URL?: string;
  [key: string]: any;
}

export interface SteadfastCreateOrderPayload {
  orderId: string;
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

const DEFAULT_BASE_URL = 'https://portal.packzy.com/api/v1';

export async function handleSteadfastRequest(
  request: Request,
  env: SteadfastEnv = {}
): Promise<Response> {
  // CORS Headers for secure API responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');

  // Resolve API Key and Secret Key from server environment
  const apiKey = (env.STEADFAST_API_KEY || (typeof process !== 'undefined' ? process.env?.STEADFAST_API_KEY : '') || '').trim();
  const secretKey = (env.STEADFAST_SECRET_KEY || (typeof process !== 'undefined' ? process.env?.STEADFAST_SECRET_KEY : '') || '').trim();
  const baseUrl = (env.STEADFAST_BASE_URL || (typeof process !== 'undefined' ? process.env?.STEADFAST_BASE_URL : '') || DEFAULT_BASE_URL).replace(/\/+$/, '');

  // 1. GET /api/steadfast/status or /api/steadfast/check-connection
  if (path.endsWith('/status') || path.endsWith('/check-connection')) {
    if (!apiKey || !secretKey) {
      return new Response(
        JSON.stringify({
          configured: false,
          connected: false,
          provider: 'Steadfast Courier',
          baseUrl,
          message: 'Steadfast API Key or Secret Key not configured in server environment variables.',
          messageBn: 'ক্লাউডফ্লেয়ার সার্ভারে Steadfast API Key এবং Secret Key কনফিগার করা নেই।',
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    try {
      const pingUrl = `${baseUrl}/get_balance`;
      const res = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        return new Response(
          JSON.stringify({
            configured: true,
            connected: true,
            provider: 'Steadfast Courier',
            baseUrl,
            balance: Number(data.current_balance ?? 0),
            message: 'Steadfast API verified and connected successfully!',
            messageBn: 'Steadfast API সার্ভার সফলভাবে সংযুক্ত হয়েছে!',
          }),
          { status: 200, headers: corsHeaders }
        );
      } else if (res.status === 401 || res.status === 403) {
        return new Response(
          JSON.stringify({
            configured: true,
            connected: false,
            provider: 'Steadfast Courier',
            baseUrl,
            message: 'Unauthorized: Invalid Steadfast API Key or Secret Key provided.',
            messageBn: 'অননুমোদিত: সার্ভারে থাকা Steadfast API Key বা Secret Key সঠিক নয়।',
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        return new Response(
          JSON.stringify({
            configured: true,
            connected: false,
            provider: 'Steadfast Courier',
            baseUrl,
            message: `Steadfast API responded with status ${res.status}.`,
            messageBn: `Steadfast API সার্ভার থেকে রেসপন্স কোড: ${res.status} এসেছে।`,
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          configured: true,
          connected: false,
          provider: 'Steadfast Courier',
          baseUrl,
          message: `Network error connecting to Steadfast: ${err?.message || 'Connection failed'}`,
          messageBn: 'Steadfast সার্ভারে সংযোগ করতে সমস্যা হয়েছে।',
        }),
        { status: 200, headers: corsHeaders }
      );
    }
  }

  // 2. POST /api/steadfast/create-order
  if (path.endsWith('/create-order')) {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: corsHeaders }
      );
    }

    if (!apiKey || !secretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Steadfast server credentials are not configured. Please set STEADFAST_API_KEY and STEADFAST_SECRET_KEY in Cloudflare Secrets.',
          errorBn: 'সার্ভারে Steadfast এপিআই ক্রেডেনশিয়াল পাওয়া যায়নি। অনুগ্রহ করে ক্লাউডফ্লেয়ার সিক্রেটে STEADFAST_API_KEY ও STEADFAST_SECRET_KEY যোগ করুন।',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const payload: SteadfastCreateOrderPayload = await request.json();

      // Input Validation
      if (!payload.recipient_name || payload.recipient_name.trim().length < 2) {
        return new Response(
          JSON.stringify({ success: false, error: 'Recipient name is required (at least 2 characters).' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const cleanPhone = (payload.recipient_phone || '').replace(/[^0-9]/g, '');
      if (cleanPhone.length < 11) {
        return new Response(
          JSON.stringify({ success: false, error: 'Recipient phone number must be a valid 11-digit mobile number.' }),
          { status: 400, headers: corsHeaders }
        );
      }

      if (!payload.recipient_address || payload.recipient_address.trim().length < 5) {
        return new Response(
          JSON.stringify({ success: false, error: 'Full delivery address is required (at least 5 characters).' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const codAmount = typeof payload.cod_amount === 'number' ? Math.max(0, payload.cod_amount) : 0;
      const invoice = (payload.invoice || payload.orderId || `JPS-${Date.now()}`).trim();

      // Make actual POST request to official Steadfast API endpoint
      const steadfastPayload = {
        invoice,
        recipient_name: payload.recipient_name.trim(),
        recipient_phone: cleanPhone,
        recipient_address: payload.recipient_address.trim().substring(0, 250),
        cod_amount: codAmount,
        note: (payload.note || 'JotPotShop E-Commerce Parcel').trim().substring(0, 250),
      };

      const sfRes = await fetch(`${baseUrl}/create_order`, {
        method: 'POST',
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(steadfastPayload),
      });

      const responseBody = (await sfRes.json().catch(() => null)) as any;

      if (sfRes.ok && responseBody && (responseBody.status === 200 || responseBody.consignment)) {
        const consignment = responseBody.consignment || responseBody;
        const consignmentId = String(consignment.consignment_id || consignment.id || '');
        const trackingCode = String(consignment.tracking_code || '');

        return new Response(
          JSON.stringify({
            success: true,
            consignment_id: consignmentId,
            tracking_code: trackingCode,
            tracking_url: trackingCode ? `https://steadfast.com.bd/t/${trackingCode}` : 'https://steadfast.com.bd/tracking',
            status: consignment.status || 'in_review',
            cod_amount: codAmount,
            invoice: invoice,
            message: responseBody.message || 'Steadfast consignment booked successfully!',
            messageBn: 'Steadfast কুরিয়ারে সফলভাবে বুকিং সম্পন্ন হয়েছে!',
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        const errorMsg =
          responseBody?.message ||
          (responseBody?.errors ? JSON.stringify(responseBody.errors) : null) ||
          `Steadfast booking failed with status ${sfRes.status}`;

        return new Response(
          JSON.stringify({
            success: false,
            error: errorMsg,
            details: responseBody,
          }),
          { status: sfRes.status >= 400 && sfRes.status < 500 ? sfRes.status : 400, headers: corsHeaders }
        );
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to execute Steadfast booking: ${err?.message || 'Server error'}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // 3. GET /api/steadfast/tracking
  if (path.endsWith('/tracking')) {
    const trackingCode = url.searchParams.get('tracking_code') || url.searchParams.get('code');
    const cid = url.searchParams.get('cid') || url.searchParams.get('consignment_id');

    if (!trackingCode && !cid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tracking code or Consignment ID is required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!apiKey || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Steadfast server credentials not configured.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const endpoint = trackingCode
        ? `${baseUrl}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`
        : `${baseUrl}/status_by_cid/${encodeURIComponent(cid!)}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        return new Response(
          JSON.stringify({
            success: true,
            delivery_status: data.delivery_status || 'unknown',
            details: data,
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Steadfast tracking responded with status ${res.status}`,
          }),
          { status: res.status, headers: corsHeaders }
        );
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Failed to fetch tracking' }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Endpoint not found on Steadfast API router.' }),
    { status: 404, headers: corsHeaders }
  );
}
