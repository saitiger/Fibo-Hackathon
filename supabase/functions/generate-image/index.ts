import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const CameraSchema = z.object({
  angle: z.string().max(50, "Camera angle too long").default("eye level"),
  view: z.string().max(50, "Camera view too long").default("medium shot"),
});

const LightingSchema = z.object({
  type: z.string().max(50, "Lighting type too long").default("natural"),
  direction: z.string().max(50, "Lighting direction too long").default("front"),
});

const PromptStateSchema = z.object({
  short_description: z.string().min(1, "Description required").max(1000, "Description too long"),
  objects: z.array(z.string().max(200, "Object description too long")).max(20, "Too many objects").default([]),
  camera: CameraSchema.default({ angle: "eye level", view: "medium shot" }),
  lighting: LightingSchema.default({ type: "natural", direction: "front" }),
  style_medium: z.string().max(100, "Style too long").default("photograph"),
});

const RequestSchema = z.object({
  promptState: PromptStateSchema,
  refinement: z.string().max(500, "Refinement too long").optional(),
  referenceImageUrl: z.string().url("Invalid reference URL").max(2000, "URL too long").optional(),
  seed: z.number().int().min(0).max(2147483647).optional(),
  guidanceScale: z.number().min(3).max(10).optional(),
  negativePrompt: z.string().max(500, "Negative prompt too long").optional(),
});

type PromptState = z.infer<typeof PromptStateSchema>;

// In-memory rate limit cache (per edge function instance)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // Max requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const cached = rateLimitCache.get(ip);
  
  if (!cached || now > cached.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (cached.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  cached.count++;
  return { allowed: true, remaining: RATE_LIMIT - cached.count };
}

// Generic error response helper - never expose internal details
function errorResponse(message: string, status: number = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting at edge function level
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(clientIP);
    
    if (!rateCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '3600'
          } 
        }
      );
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      console.error('FAL_KEY environment variable not configured');
      return errorResponse('Image generation service unavailable. Please try again later.');
    }

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      console.error('Failed to parse request JSON');
      return errorResponse('Invalid request format.', 400);
    }

    // Validate input with Zod
    const validationResult = RequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ');
      console.error('Validation failed:', errors);
      return errorResponse('Invalid request parameters. Please check your input.', 400);
    }

    const { 
      promptState, 
      refinement, 
      referenceImageUrl,
      seed,
      guidanceScale,
      negativePrompt
    } = validationResult.data;

    console.log('Validated promptState:', JSON.stringify(promptState, null, 2));
    console.log('Refinement length:', refinement?.length ?? 0);
    console.log('Has reference image:', !!referenceImageUrl);
    console.log('Seed:', seed);
    console.log('Guidance Scale:', guidanceScale);
    console.log('Negative prompt length:', negativePrompt?.length ?? 0);

    // Generate or use provided seed for consistency
    const useSeed = seed ?? Math.floor(Math.random() * 2147483647);

    // Build the structured prompt with all required fields
    const structuredPrompt: Record<string, unknown> = {
      short_description: refinement 
        ? `${promptState.short_description}. ${refinement}` 
        : promptState.short_description,
      objects: promptState.objects.map((obj, index) => ({ 
        description: obj, 
        location: index === 0 ? "center" : "background",
        relationship: index === 0 ? "main subject" : "supporting element"
      })),
      background_setting: "studio background",
      style_medium: promptState.style_medium,
      photographic_characteristics: {
        camera_angle: promptState.camera.angle,
        depth_of_field: "shallow",
        focus: "sharp",
        lens_focal_length: "85mm"
      },
      lighting: {
        conditions: promptState.lighting.type,
        direction: promptState.lighting.direction,
        shadows: "soft"
      },
      aesthetics: {
        composition: "balanced",
        color_scheme: "natural",
        mood_atmosphere: "professional"
      },
      context: "professional photo shoot"
    };

    // Clamp guidance_scale to valid range (3-10) as required by Fal.ai
    const validGuidanceScale = Math.max(3, Math.min(10, guidanceScale ?? 5));

    const fiboRequest: Record<string, unknown> = {
      structured_prompt: structuredPrompt,
      aspect_ratio: "3:4",
      steps_num: 30,
      guidance_scale: validGuidanceScale,
      seed: useSeed
    };

    // Add negative prompt if provided
    if (negativePrompt && negativePrompt.trim()) {
      fiboRequest.negative_prompt = negativePrompt.trim();
    }

    // If reference image provided, use it for image-to-image generation
    if (referenceImageUrl) {
      fiboRequest.image_url = referenceImageUrl;
      console.log('Using reference image for update');
    }

    console.log('Sending request to image generation service');

    // Call Fal.ai FIBO API
    const response = await fetch('https://fal.run/bria/fibo/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fiboRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error - Status:', response.status, 'Details:', errorText);
      
      if (response.status === 429) {
        return errorResponse('Service is temporarily busy. Please try again later.', 429);
      }
      
      if (response.status === 402) {
        return errorResponse('Image generation service unavailable. Please try again later.', 503);
      }

      return errorResponse('Failed to generate image. Please try again later.');
    }

    const data = await response.json();
    console.log('Image generation successful');

    // Fal.ai returns { image: { url: "..." } } or { images: [{ url: "..." }] }
    const imageUrl = data.image?.url || data.images?.[0]?.url;

    if (!imageUrl) {
      console.error('No image URL in API response');
      return errorResponse('Failed to generate image. Please try again.');
    }

    // Return image URL and seed for consistency in future updates
    return new Response(
      JSON.stringify({ imageUrl, seed: useSeed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in generate-image:', error instanceof Error ? error.message : 'Unknown error');
    return errorResponse('An unexpected error occurred. Please try again later.');
  }
});
