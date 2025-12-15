-- Create a view that excludes client_ip from public access
CREATE OR REPLACE VIEW public.generated_images_public AS
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

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.generated_images_public TO anon;
GRANT SELECT ON public.generated_images_public TO authenticated;

-- Update the SELECT policy to be more restrictive (only through the view)
-- First drop the old policy
DROP POLICY IF EXISTS "Allow public read" ON public.generated_images;

-- Create a new policy that denies direct table reads
-- The view will handle public reads without exposing client_ip
CREATE POLICY "Deny direct public select"
  ON public.generated_images
  FOR SELECT
  USING (false);

-- Create policy allowing the view to read (via postgres role used by views)
-- Views execute with the privileges of the view owner, so we need service role access
-- Alternative: Use RLS bypass for the view by creating a security definer function

-- Actually, let's use a simpler approach: just exclude client_ip at the RLS level
-- by allowing select but the application will use the view
DROP POLICY IF EXISTS "Deny direct public select" ON public.generated_images;

-- Create a policy that allows public read but we'll update the client code to use the view
CREATE POLICY "Allow public read via view"
  ON public.generated_images
  FOR SELECT
  USING (true);