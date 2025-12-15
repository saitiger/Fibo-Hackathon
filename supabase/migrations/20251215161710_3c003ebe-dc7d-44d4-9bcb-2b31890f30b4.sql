-- Drop and recreate the view with SECURITY INVOKER to enforce RLS for querying users
DROP VIEW IF EXISTS public.generated_images_public;

CREATE VIEW public.generated_images_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  seed,
  created_at,
  prompt_json,
  guidance_scale,
  image_url,
  negative_prompt,
  refinement
FROM public.generated_images;

-- Re-grant SELECT permissions on the view
GRANT SELECT ON public.generated_images_public TO anon;
GRANT SELECT ON public.generated_images_public TO authenticated;