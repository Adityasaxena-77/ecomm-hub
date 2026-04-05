import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RequestSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

type CatalogProduct = {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
};

const PRODUCT_CATALOG: CatalogProduct[] = [
  { id: 1, name: "Wireless Bluetooth Headphones Pro", price: 1999, rating: 4.3, reviews: 12453, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", category: "electronics" },
  { id: 2, name: "Smart Watch Ultra Series 5", price: 3499, rating: 4.5, reviews: 8921, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop", category: "electronics" },
  { id: 3, name: "Premium Cotton T-Shirt Pack of 3", price: 599, rating: 4.1, reviews: 34521, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop", category: "fashion" },
  { id: 4, name: "Running Shoes Air Max", price: 2799, rating: 4.4, reviews: 19876, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop", category: "sports" },
  { id: 5, name: "Stainless Steel Water Bottle 1L", price: 449, rating: 4.6, reviews: 45231, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop", category: "home" },
  { id: 6, name: "Organic Face Serum 30ml", price: 799, rating: 4.2, reviews: 6754, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop", category: "beauty" },
  { id: 7, name: "Wireless Charging Pad Fast", price: 699, rating: 4.0, reviews: 11234, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop", category: "electronics" },
  { id: 8, name: "Laptop Backpack Anti-Theft", price: 1299, rating: 4.5, reviews: 23456, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop", category: "fashion" },
  { id: 9, name: "Non-Stick Cookware Set 5pcs", price: 1899, rating: 4.3, reviews: 8765, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop", category: "home" },
  { id: 10, name: "Yoga Mat Premium 6mm", price: 899, rating: 4.4, reviews: 15678, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop", category: "sports" },
  { id: 11, name: "Bestselling Novel Collection", price: 399, rating: 4.7, reviews: 67890, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop", category: "books" },
  { id: 12, name: "Kids Building Blocks 200pcs", price: 649, rating: 4.6, reviews: 9876, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop", category: "toys" },
];

const FAQ_CONTEXT = {
  delivery: "Standard delivery usually takes 3 to 7 business days depending on your location.",
  returns: "We offer easy returns within 7 days for eligible products in original condition.",
  payments: "Currently the store supports UPI and Cash on Delivery during checkout.",
};

const ORDER_ID_REGEX = /\b[a-f0-9]{8}(?:-[a-f0-9-]{4,27})?\b/i;

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const detectBudget = (message: string) => {
  const underMatch = message.match(/(?:under|below|less than)\s*₹?\s*(\d{2,6})/i);
  const plainMatch = message.match(/₹\s*(\d{2,6})/i);
  return Number(underMatch?.[1] || plainMatch?.[1] || 0) || null;
};

const isFaqQuery = (message: string) => {
  const lower = message.toLowerCase();
  if (/(delivery|shipping|arrive|when.*deliver)/.test(lower)) return "delivery" as const;
  if (/(return|refund|replace|exchange)/.test(lower)) return "returns" as const;
  if (/(payment|upi|cod|cash on delivery|pay)/.test(lower)) return "payments" as const;
  return null;
};

const searchProducts = (message: string) => {
  const lower = message.toLowerCase();
  const budget = detectBudget(message);
  const terms = tokenize(message);
  const categoryHints: Record<string, string[]> = {
    electronics: ["electronics", "headphone", "headphones", "watch", "charger", "charging", "tech", "gadget", "earphone", "earphones"],
    fashion: ["fashion", "shirt", "tshirt", "t-shirt", "backpack", "bag", "clothes", "wear", "clothing"],
    sports: ["sports", "shoe", "shoes", "running", "yoga", "fitness", "mat"],
    beauty: ["beauty", "serum", "skin", "skincare", "face"],
    home: ["home", "kitchen", "cookware", "bottle"],
    books: ["book", "books", "novel", "reading"],
    toys: ["toy", "toys", "blocks", "kids"],
  };

  // Detect which category the user is asking about
  let matchedCategory: string | null = null;
  for (const [category, hints] of Object.entries(categoryHints)) {
    if (hints.some((hint) => lower.includes(hint))) {
      matchedCategory = category;
      break;
    }
  }

  const scored = PRODUCT_CATALOG.map((product) => {
    const haystack = `${product.name}`.toLowerCase();
    let relevanceScore = 0; // Only count actual matches, not base rating

    // Term matching in product name
    for (const term of terms) {
      if (haystack.includes(term)) relevanceScore += 20;
    }

    // Category match
    if (matchedCategory && product.category === matchedCategory) relevanceScore += 25;

    // Budget bonus
    if (budget && product.price <= budget) relevanceScore += 15;

    // Only add rating bonus if product is already relevant
    if (relevanceScore > 0) {
      relevanceScore += product.rating * 2;
    }

    return { ...product, score: relevanceScore };
  })
    .filter((product) => product.score > 0) // Only return actually matching products
    .sort((a, b) => b.score - a.score);

  const withinBudget = budget ? scored.filter((product) => product.price <= budget) : scored;
  const matches = (withinBudget.length ? withinBudget : scored).slice(0, 3);

  return {
    budget,
    products: matches.map(({ id, name, price, image, category }) => ({ id, name, price, image, category })),
  };
};

const buildFallbackResponse = (context: {
  faqKey: keyof typeof FAQ_CONTEXT | null;
  products: { id: number; name: string; price: number; image: string; category: string }[];
  budget: number | null;
  orderTracking: {
    orderId: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
  } | null;
}) => {
  if (context.orderTracking) {
    return `I found your order. Its current status is ${context.orderTracking.status} and the payment status is ${context.orderTracking.paymentStatus}.`;
  }

  if (context.faqKey) {
    return FAQ_CONTEXT[context.faqKey];
  }

  if (context.products.length) {
    if (context.budget) {
      return `Here are some good options I found around your budget of ₹${context.budget.toLocaleString()}.`;
    }
    return "Here are some products that match your request.";
  }

  return "I can help with product recommendations, order tracking, delivery, returns, and payment questions. Try asking for something like best headphones under ₹2000 or share your order ID.";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = RequestSchema.safeParse(await req.json());
    if (!body.success) {
      return new Response(JSON.stringify({ error: body.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, history } = body.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured");

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();
    let userId: string | null = null;

    if (token) {
      try {
        const { data: authData, error: authError } = await admin.auth.getUser(token);
        if (!authError) userId = authData.user?.id ?? null;
      } catch (_error) {
        userId = null;
      }
    }

    const faqKey = isFaqQuery(message);
    const productSearch = searchProducts(message);
    const orderIdMatch = message.match(ORDER_ID_REGEX)?.[0] ?? null;

    let orderTracking: {
      orderId: string;
      status: string;
      paymentStatus: string;
      totalAmount: number;
      createdAt: string;
    } | null = null;

    if (orderIdMatch) {
      if (userId) {
        const { data: order, error: orderError } = await admin
          .from("orders")
          .select("id, order_status, payment_status, total_amount, created_at")
          .eq("user_id", userId)
          .ilike("id", `${orderIdMatch}%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!orderError && order) {
          orderTracking = {
            orderId: order.id,
            status: order.order_status,
            paymentStatus: order.payment_status,
            totalAmount: Number(order.total_amount),
            createdAt: order.created_at,
          };
        } else if (!order) {
          orderTracking = null;
        }
      }
    }

    const systemPrompt = `You are a professional ecommerce AI assistant for an online store.
Speak in a helpful, concise, polished tone.
Capabilities:
- Recommend products based on budget and intent.
- Answer FAQs for delivery, returns, and payment methods.
- Help with order tracking when order data is provided.
- Mention products only from the supplied product list.
Rules:
- Keep answers under 120 words.
- If order tracking is requested but no order data is available, ask the user to sign in and share the order ID again.
- If no exact budget match exists, say that clearly and suggest the closest useful alternatives.
- Do not invent policies, products, or order details.`;

    const contextPrompt = {
      userMessage: message,
      recentHistory: history.slice(-6),
      matchedProducts: productSearch.products,
      matchedBudget: productSearch.budget,
      faqAnswer: faqKey ? FAQ_CONTEXT[faqKey] : null,
      orderTracking,
      orderTrackingRequestedWithoutAccess: Boolean(orderIdMatch && !userId),
      orderTrackingRequestedButNotFound: Boolean(orderIdMatch && userId && !orderTracking),
    };

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(contextPrompt) },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits are unavailable right now." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const aiPayload = aiResponse.ok ? await aiResponse.json() : null;
    const aiMessage = aiPayload?.choices?.[0]?.message?.content?.trim();

    const responseMessage =
      aiMessage ||
      buildFallbackResponse({
        faqKey,
        products: productSearch.products,
        budget: productSearch.budget,
        orderTracking,
      });

    return new Response(
      JSON.stringify({
        message: responseMessage,
        products: productSearch.products,
        orderTracking,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("ecommerce-chatbot error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});