/*
  # Fix Currency to GBP

  Updates all service package prices from USD to GBP.
  
  Pricing in GBP:
  - Marketing Command Center: £2,000/month (200000 pence)
  - Strategic Advisor: £4,000/month (400000 pence)  
  - Full-Stack CMO: £8,000/month (800000 pence)

  All values stored as pence (100 pence = £1)
*/

-- Update service packages to GBP pricing
UPDATE public.service_packages
SET 
  monthly_price = 200000,  -- £2,000
  annual_price = 1920000   -- £19,200 (20% discount)
WHERE slug = 'command-center';

UPDATE public.service_packages
SET 
  monthly_price = 400000,  -- £4,000
  annual_price = 3840000   -- £38,400 (20% discount)
WHERE slug = 'strategic-advisor';

UPDATE public.service_packages
SET 
  monthly_price = 800000,  -- £8,000
  annual_price = 7680000   -- £76,800 (20% discount)
WHERE slug = 'full-stack-cmo';
