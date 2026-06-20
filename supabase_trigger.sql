-- ==========================================
-- Supabase Trigger: Send Resend Welcome Email
-- ==========================================
-- This script enables pg_net, sets up a trigger function, and calls
-- the Resend API to send a welcome email whenever a user signs up.
--
-- Instructions:
-- 1. Copy the entire contents of this file.
-- 2. Go to your Supabase Dashboard -> SQL Editor.
-- 3. Paste and run this script (be sure to replace 're_YOUR_API_KEY' with your actual Resend API key).

-- 1. Enable the pg_net extension (allows making outbound HTTP requests from Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create/update the trigger function
CREATE OR REPLACE FUNCTION public.send_waitlist_welcome_email()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://api.resend.com/emails'::text,
      headers := jsonb_build_object(
        'Authorization', 'Bearer re_YOUR_API_KEY', -- Replace with your Resend API Key (starts with re_)
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'from', 'ThunderReply <hello@thunderreply.com>', -- This sends from your verified domain
        'to', jsonb_build_array(NEW.email),
        'reply_to', 'YOUR_PERSONAL_OR_SUPPORT_EMAIL@gmail.com', -- Replace with your personal/support email address where you want to receive replies!
        'subject', 'You are in! Welcome to the ThunderReply Waitlist 🚀',
        'html', $html$
<div style="background-color: #f4f5f7; padding: 40px 10px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03); overflow: hidden;">
    <!-- Top Brand Gradient Bar -->
    <div style="height: 6px; background: linear-gradient(135deg, #00e5ff 0%, #00b4d8 40%, #8f00ff 100%);"></div>
    
    <!-- Header/Logo Area -->
    <div style="padding: 32px 32px 20px 32px; text-align: center;">
      <div style="font-size: 26px; font-weight: 800; color: #09090b; letter-spacing: -0.03em; margin-bottom: 4px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
        Thunder<span style="color: #00b4d8; font-weight: 800;">Reply</span>
      </div>
      <div style="font-size: 12px; color: #71717a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
        Instagram DM Automation Tool
      </div>
    </div>
    
    <!-- Main Email Body -->
    <div style="padding: 0 32px 32px 32px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;">
      <h2 style="font-size: 20px; font-weight: 700; color: #09090b; line-height: 1.4; margin-top: 0; margin-bottom: 16px;">
        You're on the list! Welcome to the future of Instagram growth 👋
      </h2>
      
      <p style="font-size: 15px; color: #52525b; line-height: 1.6; margin-top: 0; margin-bottom: 16px;">
        Thank you for joining the waitlist for <strong>ThunderReply</strong>, the ultimate automation tool built to connect your Instagram interactions with instant DM delivery.
      </p>
      
      <p style="font-size: 15px; color: #52525b; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
        Ditch complex workflows. ThunderReply is designed specifically to capture comments on your Reels, Posts, and Stories, match keyword triggers in real-time, and route detailed messages, links, or documents straight to your users' DMs.
      </p>
      
      <!-- Status Box -->
      <div style="margin: 24px 0; padding: 20px; background: rgba(0, 229, 255, 0.04); border: 1px dashed #00b4d8; border-radius: 12px; text-align: center;">
        <span style="color: #00b4d8; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">
          Your Waitlist Status
        </span>
        <h3 style="color: #09090b; font-size: 18px; font-weight: 800; margin: 0;">
          Priority Access Active ⚡
        </h3>
      </div>
      
      <!-- Feature highlights -->
      <h4 style="font-size: 13px; font-weight: 700; color: #09090b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 24px; margin-bottom: 14px;">
        What you get with ThunderReply:
      </h4>
      
      <div style="margin-bottom: 14px; font-size: 14.5px; color: #52525b; line-height: 1.5;">
        ⚡ <strong>Comment-to-DM Funnels:</strong> Turn comments like "INFO" or "CODE" into instant private conversations.
      </div>
      <div style="margin-bottom: 14px; font-size: 14.5px; color: #52525b; line-height: 1.5;">
        ⚡ <strong>Smart Keyword Routing:</strong> Configure triggers for multiple keywords to send personalized responses.
      </div>
      <div style="margin-bottom: 14px; font-size: 14.5px; color: #52525b; line-height: 1.5;">
        ⚡ <strong>Frictionless Integrations:</strong> Works natively with Instagram Comments, Reels, and Direct Messages.
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
      
      <p style="font-size: 13px; color: #71717a; line-height: 1.5; margin: 0; text-align: center;">
        We'll send you updates as we roll out early beta slots. Get ready to supercharge your Instagram engagement!
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px; line-height: 1.6;">
    &copy; 2026 ThunderReply. All rights reserved. <br/>
    If you didn't request to join our waitlist, you can safely ignore this email.
  </div>
</div>
$html$
      )
    ) AS request_id;
  RETURN NEW;
END;
$$;

-- 4. Recreate trigger to watch waitlist insertions
DROP TRIGGER IF EXISTS trigger_send_waitlist_welcome_email ON public.waitlist;
CREATE TRIGGER trigger_send_waitlist_welcome_email
  AFTER INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.send_waitlist_welcome_email();
