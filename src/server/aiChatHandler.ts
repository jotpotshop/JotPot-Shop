/**
 * Server-side AI Chat Handler for JotPotShop Live Customer Support
 * Powered by Google Gemini (@google/genai)
 * Model: gemini-3.8-flash (Latest production conversational model)
 *
 * All API keys are kept strictly on the server:
 * - process.env.GEMINI_API_KEY / env.GEMINI_API_KEY
 * Never exposed to client-side bundles or public endpoints.
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface AiChatEnv {
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

export interface ChatMessageContext {
  sender: 'customer' | 'ai' | 'staff';
  text: string;
}

export interface ProductContextSummary {
  id: string;
  name: string;
  nameBn?: string;
  category: string;
  subcategory?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  description?: string;
  image?: string;
}

export interface AiChatRequestPayload {
  message: string;
  conversationHistory?: ChatMessageContext[];
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  customerOrder?: {
    orderId?: string;
    status?: string;
    totalAmount?: number;
    items?: string[];
  };
  productsCatalog?: ProductContextSummary[];
  storeSettings?: {
    storeName?: string;
    hotline?: string;
    whatsapp?: string;
    deliveryInsideDhakaFee?: number;
    deliveryOutsideDhakaFee?: number;
    freeDeliveryThreshold?: number;
    chattogramFreeDeliveryOffer?: boolean;
    businessHours?: string;
  };
}

export interface AiChatResponsePayload {
  reply: string;
  transferToHuman?: boolean;
  suggestedProduct?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  error?: string;
}

export async function handleAiChatRequest(
  request: Request,
  env: AiChatEnv = {}
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const apiKey = (
    env.GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    ''
  ).trim();

  let body: AiChatRequestPayload;
  try {
    body = (await request.json()) as AiChatRequestPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request payload' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const userMessage = (body.message || '').trim().slice(0, 1000);
  if (!userMessage) {
    return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check if customer explicitly requested human agent
  const lowerMsg = userMessage.toLowerCase();
  const asksForHuman =
    lowerMsg.includes('কথা বলব') ||
    lowerMsg.includes('মানুষ') ||
    lowerMsg.includes('এজেন্ট') ||
    lowerMsg.includes('human') ||
    lowerMsg.includes('agent') ||
    lowerMsg.includes('representative') ||
    lowerMsg.includes('staff') ||
    lowerMsg.includes('অফিসার') ||
    lowerMsg.includes('কল দিন') ||
    lowerMsg.includes('call me');

  // If no Gemini API Key is configured on server, provide graceful helpful fallback
  if (!apiKey) {
    const fallbackReply = asksForHuman
      ? 'আপনাকে আমাদের কাস্টমার সাপোর্ট টিমের সাথে সংযুক্ত করা হচ্ছে। অনুগ্রহ করে একটু অপেক্ষা করুন, আমাদের প্রতিনিধি কিছুক্ষণের মধ্যেই আপনার সাথে যোগাযোগ করবেন।'
      : 'আসসালামু আলাইকুম! JotPotShop এ আপনাকে স্বাগতম। পণ্য বা ডেলিভারি তথ্যের জন্য যেকোনো প্রশ্ন করতে পারেন, অথবা সরাসরি আমাদের হটলাইনে কল করতে পারেন।';

    return new Response(
      JSON.stringify({
        reply: fallbackReply,
        transferToHuman: asksForHuman,
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Build compact catalog context from real Firebase products (only top 25 active items to stay lean and fast)
    const catalogSnippet = (body.productsCatalog || [])
      .slice(0, 25)
      .map(p => {
        const title = p.nameBn ? `${p.nameBn} (${p.name})` : p.name;
        return `- ID: ${p.id} | ${title} | ৳${p.price}${p.oldPrice ? ` (আগের দাম ৳${p.oldPrice})` : ''} | ক্যাটাগরি: ${p.category} | স্টক: ${p.stock > 0 ? `${p.stock} পিস উপলব্ধ` : 'স্টক শেষ'}`;
      })
      .join('\n');

    // Build context about store settings & delivery
    const storeInfo = body.storeSettings || {};
    const deliveryPolicy = `
- ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${storeInfo.deliveryInsideDhakaFee ?? 60}, ঢাকার বাইরে ৳${storeInfo.deliveryOutsideDhakaFee ?? 120}।
- বিশেষ অফার: ৳${storeInfo.freeDeliveryThreshold ?? 1500} বা তার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!
${storeInfo.chattogramFreeDeliveryOffer ? '- আজকের স্পেশাল অফার: চট্টগ্রামের গ্রাহকদের জন্য ডেলিভারি সম্পূর্ণ ফ্রি (৳০)!\n' : ''}- পেমেন্ট নিয়ম: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দেওয়া), এবং বিকাশ/নগদে পেমেন্ট সুবিধা।
- রিটার্ন নিয়ম: পণ্য পাওয়ার পর সাইজ বা কোয়ালিটিতে সমস্যা থাকলে ৭ দিনের মধ্যে সহজে রিটার্ন বা এক্সচেঞ্জ করা যায়।
- সাপোর্ট হটলাইন: ${storeInfo.hotline || '01800-568768'} (সকাল ৯টা - রাত ১১টা)।
`;

    // Customer order context if present
    let orderContext = 'গ্রাহকের কোনো সক্রিয় অর্ডার তথ্য সংযুক্ত নেই।';
    if (body.customerOrder?.orderId) {
      orderContext = `গ্রাহকের অর্ডার আইডি: ${body.customerOrder.orderId}, বর্তমান স্ট্যাটাস: ${body.customerOrder.status || 'Processing'}, মোট মূল্য: ৳${body.customerOrder.totalAmount || 0}।`;
    }

    const systemInstruction = `
আপনি হলেন "JotPotShop" (ঝটপট শপ)-এর বুদ্ধিমান ও আন্তরিক কাস্টমার সাপোর্ট এআই সহকারী।
আপনার প্রধান দায়িত্ব হলো গ্রাহকদের পণ্যের তথ্য, সাইজ, স্টক, ডেলিভারি নিয়ম ও অর্ডার সংক্রান্ত প্রশ্নের সঠিক ও বিনয়ী উত্তর দেওয়া।

ভাষার নির্দেশনা (Language Rules):
1. গ্রাহক বাংলায় প্রশ্ন করলে সহজ ও আন্তরিক বাংলা ভাষায় উত্তর দিন। গ্রাহক ইংরেজিতে বা বাংলিশে (Banglish) লিখলে সহজে বুঝে স্বাভাবিকভাবে উত্তর দিন।
2. কোনো রোবটিক বা অতি-ফর্মাল ভাব আনবেন না। আন্তরিক, বন্ধুসুলভ ও পেশাদার সুরে কথা বলুন।
3. প্রতি মেসেজে অযথা লম্বা সালাম বা স্বাগত বার্তা পুনরাবৃত্তি করবেন না।
4. উত্তর যথাসম্ভব সংক্ষিপ্ত ও স্পষ্ট রাখুন। গ্রাহক জানতে চাইলে বিস্তারিত জানান।

পণ্য ও তথ্যের সত্যতা (Real Product Accuracy):
1. নিচে দেওয়া JotPotShop এর রিয়েল প্রডাক্ট ক্যাটালগ থেকেই পণ্যের নাম, দাম ও স্টক বলুন।
2. কখনোই মনগড়া কোনো পণ্য, কাল্পনিক ডিসকাউন্ট বা মিথ্যা স্টক বলবেন না।
3. যদি গ্রাহক এমন কোনো পণ্যের কথা জিজ্ঞেস করেন যা ক্যাটালগে নেই, সুন্দর করে জানান যে এই মুহূর্তে পণ্যটি স্টকে নেই এবং বিকল্প পণ্য সাজেস্ট করুন।
4. আপনি একটি এআই সহকারী। কোনো অবস্থাতেই নিজেকে মানুষের মতো মিথ্যা পরিচয় দেবেন না।

হ্যান্ডওভার ও সাহায্য (Human Support Transfer):
1. যদি গ্রাহক কোনো মানুষের সাথে বা সরাসরি প্রতিনিধির সাথে কথা বলতে চান, তখন স্পষ্ট করে জানান যে আপনি তাকে লাইভ সাপোর্ট ডেস্কে ট্রান্সফার করছেন এবং JSON উত্তরে "transferToHuman": true পাঠান।
2. যদি কোনো পণ্যের ব্যাপারে আলোচনা হয়, উপযুক্ত পণ্যের id ও নাম JSON উত্তরের "suggestedProduct" ফিল্ডে যুক্ত করুন যাতে গ্রাহক ক্লিক করে দেখতে পারেন।

স্টোর ও ডেলিভারি তথ্য:
${deliveryPolicy}

গ্রাহকের বর্তমান অর্ডার তথ্য:
${orderContext}

রিয়েল প্রডাক্ট ক্যাটালগ (Current Stock):
${catalogSnippet || 'বর্তমানে ক্যাটালগে পণ্য উপলব্ধ রয়েছে।'}

সর্বদা নিচের JSON ফরম্যাটে উত্তর দিন:
{
  "reply": "আপনার গ্রাহকবান্ধব উত্তর এখানে লিখুন",
  "transferToHuman": false,
  "suggestedProductId": "ঐচ্ছিক-যদি-কোনো-পণ্য-রেফার-করেন"
}
`;

    // Prepare conversation turns (last 6 messages max for memory without bloated payload)
    const history = (body.conversationHistory || []).slice(-6).map(h => ({
      role: h.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...history,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const responseText = response.text || '';
    let parsed: { reply?: string; transferToHuman?: boolean; suggestedProductId?: string } = {};

    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If model returned plaintext despite responseMimeType
      parsed = {
        reply: responseText.trim(),
        transferToHuman: asksForHuman,
      };
    }

    let suggestedProduct: AiChatResponsePayload['suggestedProduct'] = undefined;
    if (parsed.suggestedProductId && body.productsCatalog) {
      const match = body.productsCatalog.find(p => p.id === parsed.suggestedProductId);
      if (match) {
        suggestedProduct = {
          id: match.id,
          name: match.nameBn || match.name,
          price: match.price,
          image: match.image,
        };
      }
    }

    const finalReply =
      parsed.reply ||
      (asksForHuman
        ? 'আপনার অনুরোধটি আমাদের সাপোর্ট টিমের কাছে পাঠানো হয়েছে। একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগ দিচ্ছেন।'
        : 'ধন্যবাদ আপনার বার্তার জন্য! আমি আপনাকে কীভাবে সাহায্য করতে পারি?');

    return new Response(
      JSON.stringify({
        reply: finalReply,
        transferToHuman: Boolean(parsed.transferToHuman || asksForHuman),
        suggestedProduct,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Gemini AI Chat Error:', error);
    // Graceful error recovery: Return truthful fallback to customer with human transfer option
    const isQuota = error?.message?.includes('429') || error?.status === 429;
    const errorReply = isQuota
      ? 'আমাদের এআই হেল্পডেস্ক বর্তমানে ব্যস্ত। আপনাকে সরাসরি আমাদের হিউম্যান সাপোর্ট টিমের সাথে কানেক্ট করে দেওয়া হচ্ছে।'
      : asksForHuman
      ? 'আপনার অনুরোধটি সরাসরি আমাদের সাপোর্ট টিমের কাছে ফরোয়ার্ড করা হয়েছে। প্রতিনিধি কিছুক্ষণের মধ্যে রিপ্লাই দেবেন।'
      : 'আসসালামু আলাইকুম! কোনো কারণে মেসেজটি প্রসেস হতে সমস্যা হয়েছে। আপনি সরাসরি আমাদের হটলাইনে (01800-568768) কল করতে পারেন অথবা লাইভ সাপোর্ট এজেন্টের জন্য অপেক্ষা করতে পারেন।';

    return new Response(
      JSON.stringify({
        reply: errorReply,
        transferToHuman: true,
        error: error?.message || 'AI service temporary error',
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}
