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

  // 4. GET /api/steadfast/balance (Direct Balance Endpoint)
  if (path.endsWith('/balance')) {
    if (!apiKey || !secretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          connected: false,
          error: 'Steadfast API Key or Secret Key not configured.',
          errorBn: 'সার্ভারে Steadfast API Key এবং Secret Key কনফিগার করা নেই।',
        }),
        { status: 400, headers: corsHeaders }
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
            success: true,
            configured: true,
            connected: true,
            balance: Number(data.current_balance ?? 0),
            updatedAt: new Date().toISOString(),
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            configured: true,
            connected: false,
            error: `Steadfast API returned status ${res.status}`,
            errorBn: `Steadfast সার্ভার এরর রেসপন্স কোড: ${res.status}`,
          }),
          { status: res.status >= 400 && res.status < 500 ? res.status : 502, headers: corsHeaders }
        );
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: true,
          connected: false,
          error: err?.message || 'Network error fetching balance',
          errorBn: 'Steadfast সার্ভারে সংযোগ করতে সমস্যা হয়েছে।',
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // 5. GET & POST /api/steadfast/webhook (Official Webhook Endpoint for Delivery Status Updates)
  if (path.endsWith('/webhook')) {
    // 5a. GET or ?test=ping: Webhook Endpoint Diagnostic & Health Check
    if (request.method === 'GET' || url.searchParams.get('test') === 'ping' || url.searchParams.get('test') === '1') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'online',
          endpoint: '/api/steadfast/webhook',
          provider: 'Steadfast Courier',
          serverTime: new Date().toISOString(),
          configured: !!apiKey && !!secretKey,
          webhookSecretConfigured: !!(env.STEADFAST_WEBHOOK_SECRET || process.env?.STEADFAST_WEBHOOK_SECRET),
          message: 'Steadfast Webhook Endpoint is online, verified, and listening for parcel delivery updates.',
          messageBn: 'Steadfast Webhook এন্ডপয়েন্ট সফলভাবে কার্যকর ও পার্সেল স্ট্যাটাস গ্রহণের জন্য প্রস্তুত।',
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed. Webhook accepts POST requests only.' }),
        { status: 405, headers: corsHeaders }
      );
    }

    // 5b. Webhook Authentication Verification
    const webhookSecret = (
      env.STEADFAST_WEBHOOK_SECRET ||
      (typeof process !== 'undefined' ? process.env?.STEADFAST_WEBHOOK_SECRET : '') ||
      ''
    ).trim();

    if (webhookSecret) {
      const authHeader = request.headers.get('Authorization') || '';
      const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
      const xSecret = request.headers.get('X-Steadfast-Secret') || request.headers.get('X-Webhook-Secret') || '';
      const secretHeader = request.headers.get('Secret-Key') || '';
      const queryToken = url.searchParams.get('token') || url.searchParams.get('secret') || '';

      const tokenReceived = bearerToken || xSecret || secretHeader || queryToken;

      if (!tokenReceived || (tokenReceived !== webhookSecret && tokenReceived !== secretKey)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unauthorized: Missing or invalid webhook secret token.',
            errorBn: 'অননুমোদিত: প্রেরিত ওয়েবহুক সিক্রেট টোকেন সঠিক নয়।',
          }),
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // 5c. Parse & Validate Payload according to Steadfast Courier Webhook specifications
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Malformed JSON payload in webhook request.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Empty or invalid JSON body.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const consignmentId = String(body.consignment_id ?? body.consignmentId ?? body.id ?? '').trim();
    const invoice = String(body.invoice ?? body.invoice_id ?? body.order_id ?? '').trim();
    const rawStatus = String(body.status ?? body.delivery_status ?? '').toLowerCase().trim();
    const trackingCode = String(body.tracking_code ?? body.trackingCode ?? '').trim();
    const trackingMessage = String(body.tracking_message ?? body.message ?? body.note ?? '').trim();
    const codAmount = typeof body.cod_amount === 'number' ? body.cod_amount : Number(body.cod_amount || 0);

    if (!consignmentId && !invoice && !trackingCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required identifier: at least one of consignment_id, invoice, or tracking_code must be provided.',
          errorBn: 'কনসাইনমেন্ট আইডি, ইনভয়েস অথবা ট্র্যাকিং কোড আবশ্যক।',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!rawStatus) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing status / delivery_status field in webhook payload.',
          errorBn: 'স্ট্যাটাস ফিল্ড অনুপস্থিত।',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 5d. Status Mapping: Map Steadfast status to JotPotShop OrderStatus and CourierStatus
    let targetOrderStatus: string = 'Pending';
    let targetCourierStatus: string = 'In Transit';
    let targetStatusBn: string = 'ট্রানজিটে আছে';

    switch (rawStatus) {
      case 'delivered':
      case 'delivered_approval_pending':
        targetOrderStatus = 'Delivered';
        targetCourierStatus = 'Delivered';
        targetStatusBn = 'গ্রাহকের নিকট সফলভাবে ডেলিভারি সম্পন্ন হয়েছে';
        break;
      case 'partial_delivered':
      case 'partial_delivered_approval_pending':
        targetOrderStatus = 'Delivered';
        targetCourierStatus = 'Partially Delivered';
        targetStatusBn = 'আংশিক ডেলিভারি সম্পন্ন হয়েছে';
        break;
      case 'cancelled':
      case 'cancelled_approval_pending':
      case 'returned':
        targetOrderStatus = 'Cancelled';
        targetCourierStatus = 'Returned';
        targetStatusBn = 'পার্সেল ডেলিভারি ব্যর্থ ও রিটার্ন হয়েছে';
        break;
      case 'hold':
        targetOrderStatus = 'On Hold';
        targetCourierStatus = 'In Transit';
        targetStatusBn = 'পার্সেল ডেলিভারি সাময়িকভাবে হোল্ড করা হয়েছে';
        break;
      case 'in_review':
      case 'pending':
        targetOrderStatus = 'Processing';
        targetCourierStatus = 'Pending Pickup';
        targetStatusBn = 'স্টেডফাস্টে বুকিং ও পিকআপের অপেক্ষায়';
        break;
      case 'in_transit':
        targetOrderStatus = 'Shipped';
        targetCourierStatus = 'In Transit';
        targetStatusBn = 'পার্সেল গন্তব্যে ট্রানজিটে আছে';
        break;
      case 'out_for_delivery':
        targetOrderStatus = 'Out for Delivery';
        targetCourierStatus = 'Out for Delivery';
        targetStatusBn = 'ডেলিভারি রাইডার পার্সেল নিয়ে বের হয়েছে';
        break;
      default:
        targetOrderStatus = 'Shipped';
        targetCourierStatus = 'In Transit';
        targetStatusBn = `স্টেডফাস্ট স্ট্যাটাস: ${rawStatus}`;
    }

    // 5e. Synchronize matching order in Cloud Firestore via REST API
    const fbProjectId = env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
    const fbDbId = env.FIRESTORE_DATABASE_ID || DEFAULT_FIRESTORE_DATABASE_ID;
    const fbApiKey = env.FIREBASE_API_KEY || DEFAULT_FIREBASE_API_KEY;

    try {
      const ordersDataUrl = `https://firestore.googleapis.com/v1/projects/${fbProjectId}/databases/${fbDbId}/documents/settings/orders_data?key=${fbApiKey}`;
      const ordersSnapRes = await fetch(ordersDataUrl);

      if (!ordersSnapRes.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to fetch orders from database (HTTP ${ordersSnapRes.status}).`,
          }),
          { status: 502, headers: corsHeaders }
        );
      }

      const ordersDoc = (await ordersSnapRes.json()) as any;
      const rawValues = ordersDoc?.fields?.items?.arrayValue?.values || [];
      const ordersList: any[] = rawValues.map(decodeFirestoreValue);

      // Match the exact order by Invoice (order ID), Consignment ID, or Tracking Code
      const matchedIdx = ordersList.findIndex(o => {
        if (!o) return false;
        const oId = String(o.id || '').trim().toLowerCase();
        const oInvoice = invoice.toLowerCase();
        if (invoice && (oId === oInvoice || oId === `ord-${oInvoice}` || oInvoice.includes(oId))) return true;

        const oConsignment = String(o.courierInfo?.consignmentId || '').trim();
        if (consignmentId && oConsignment && (oConsignment === consignmentId || oConsignment === `CONS-${consignmentId}`)) return true;

        const oTracking = String(o.courierInfo?.trackingCode || o.trackingNumber || '').trim();
        if (trackingCode && oTracking && (oTracking === trackingCode || oTracking.includes(trackingCode))) return true;

        return false;
      });

      if (matchedIdx === -1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No matching order found in database for provided identifiers.',
            consignment_id: consignmentId,
            invoice: invoice,
            tracking_code: trackingCode,
          }),
          { status: 404, headers: corsHeaders }
        );
      }

      const targetOrder = ordersList[matchedIdx];

      // Idempotency: If order is already updated to this status, avoid duplicate timeline writes
      if (
        targetOrder.status === targetOrderStatus &&
        targetOrder.courierInfo?.courierStatus === targetCourierStatus
      ) {
        return new Response(
          JSON.stringify({
            success: true,
            idempotent: true,
            orderId: targetOrder.id,
            status: targetOrder.status,
            courierStatus: targetOrder.courierInfo?.courierStatus,
            message: 'Order is already up to date with this delivery status.',
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      const previousStatus = targetOrder.status;

      // Update Order Fields
      targetOrder.status = targetOrderStatus;
      if (targetOrderStatus === 'Delivered' && targetOrder.paymentMethod === 'cod') {
        targetOrder.paymentStatus = 'Paid';
      }

      if (!targetOrder.courierInfo) {
        targetOrder.courierInfo = {
          courierName: 'Steadfast',
          courierNameBn: 'স্টেডফাস্ট কুরিয়ার',
          consignmentId: consignmentId || `CONS-${Date.now()}`,
          trackingCode: trackingCode || targetOrder.trackingNumber || '',
          trackingUrl: trackingCode ? `https://steadfast.com.bd/t/${trackingCode}` : 'https://steadfast.com.bd',
          courierStatus: targetCourierStatus,
          weightKg: 0.5,
          codAmount: codAmount || targetOrder.totalAmount || 0,
          shippingCharge: targetOrder.deliveryFee || 0,
          dispatchedDate: new Date().toISOString().split('T')[0],
          specialInstructions: trackingMessage || '',
        };
      } else {
        targetOrder.courierInfo.courierStatus = targetCourierStatus;
        if (consignmentId && (!targetOrder.courierInfo.consignmentId || targetOrder.courierInfo.consignmentId.startsWith('CONS-'))) {
          targetOrder.courierInfo.consignmentId = consignmentId;
        }
        if (trackingCode) {
          targetOrder.courierInfo.trackingCode = trackingCode;
          targetOrder.trackingNumber = trackingCode;
          targetOrder.courierInfo.trackingUrl = `https://steadfast.com.bd/t/${trackingCode}`;
        }
        if (trackingMessage) {
          targetOrder.courierInfo.specialInstructions = trackingMessage;
        }
      }

      // Append Timeline Step
      if (!Array.isArray(targetOrder.timeline)) {
        targetOrder.timeline = [];
      }

      const nowFormatted = new Date().toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      targetOrder.timeline.push({
        status: targetOrderStatus,
        statusBn: targetStatusBn,
        date: nowFormatted,
        completed: true,
        description: trackingMessage || `Delivery status updated to ${targetOrderStatus} via Steadfast Webhook`,
        descriptionBn: `স্টেডফাস্ট ডেলিভারি আপডেট: ${targetStatusBn}`,
      });

      // Commit changes to Firestore
      ordersList[matchedIdx] = targetOrder;

      // 1. Update settings/orders_data
      const updatedOrdersFields = {
        items: {
          arrayValue: {
            values: ordersList.map(encodeFirestoreValue),
          },
        },
        updatedAt: { stringValue: new Date().toISOString() },
        updatedBy: { stringValue: 'Steadfast Webhook' },
      };

      const patchOrdersDataUrl = `https://firestore.googleapis.com/v1/projects/${fbProjectId}/databases/${fbDbId}/documents/settings/orders_data?updateMask.fieldPaths=items&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=updatedBy&key=${fbApiKey}`;
      await fetch(patchOrdersDataUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: updatedOrdersFields }),
      });

      // 2. Update individual order document at /orders/{orderId}
      const singleOrderDocUrl = `https://firestore.googleapis.com/v1/projects/${fbProjectId}/databases/${fbDbId}/documents/orders/${targetOrder.id}?key=${fbApiKey}`;
      const singleOrderEncoded = encodeFirestoreValue(targetOrder);
      if (singleOrderEncoded && singleOrderEncoded.mapValue) {
        await fetch(singleOrderDocUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: singleOrderEncoded.mapValue.fields }),
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId: targetOrder.id,
          customerName: targetOrder.customerName,
          previousStatus,
          newStatus: targetOrderStatus,
          courierStatus: targetCourierStatus,
          message: 'Order delivery status successfully synchronized in database.',
          messageBn: `অর্ডার #${targetOrder.id} এর স্ট্যাটাস সফলভাবে '${targetStatusBn}'-এ আপডেট হয়েছে।`,
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to process webhook update: ${err?.message || 'Server error'}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Endpoint not found on Steadfast API router.' }),
    { status: 404, headers: corsHeaders }
  );
}

// --- Firestore REST Helper Functions for Cloudflare Worker ---

const DEFAULT_FIREBASE_PROJECT_ID = 'jotpotshop';
const DEFAULT_FIRESTORE_DATABASE_ID = 'ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f';
const DEFAULT_FIREBASE_API_KEY = 'AIzaSyBUJe07PaPGB0GpJIrjz_DKO2tMVtI4Bqg';

function decodeFirestoreValue(val: any): any {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(decodeFirestoreValue);
  }
  if ('mapValue' in val) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = decodeFirestoreValue(v);
    }
    return res;
  }
  return null;
}

function encodeFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(encodeFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = encodeFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}
