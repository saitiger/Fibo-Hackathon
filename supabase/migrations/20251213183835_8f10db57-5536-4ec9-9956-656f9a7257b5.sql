-- Add a column to track client IP for rate limiting
ALTER TABLE public.generated_images ADD COLUMN client_ip inet;

-- Create a function to check rate limits (max 10 images per hour per IP)
CREATE OR REPLACE FUNCTION public.check_insert_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
  client_ip_addr inet;
BEGIN
  -- Get the client IP from the request headers
  client_ip_addr := inet(current_setting('request.headers', true)::json->>'x-forwarded-for');
  
  -- Count recent inserts from this IP in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.generated_images
  WHERE client_ip = client_ip_addr
    AND created_at > now() - interval '1 hour';
  
  -- Allow max 10 images per hour per IP
  RETURN recent_count < 10;
EXCEPTION
  WHEN OTHERS THEN
    -- If we can't get the IP, allow with a global fallback limit
    SELECT COUNT(*) INTO recent_count
    FROM public.generated_images
    WHERE created_at > now() - interval '1 minute';
    
    RETURN recent_count < 5;
END;
$$;

-- Create a function to set client IP on insert
CREATE OR REPLACE FUNCTION public.set_client_ip()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    NEW.client_ip := inet(current_setting('request.headers', true)::json->>'x-forwarded-for');
  EXCEPTION
    WHEN OTHERS THEN
      NEW.client_ip := NULL;
  END;
  RETURN NEW;
END;
$$;

-- Create trigger to set client IP on insert
CREATE TRIGGER set_client_ip_trigger
  BEFORE INSERT ON public.generated_images
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_ip();

-- Drop the old permissive insert policy
DROP POLICY IF EXISTS "Allow public insert" ON public.generated_images;

-- Create new rate-limited insert policy
CREATE POLICY "Rate limited public insert"
  ON public.generated_images
  FOR INSERT
  WITH CHECK (public.check_insert_rate_limit());