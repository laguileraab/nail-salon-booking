// Follow the Supabase Edge Functions setup instructions:  
// https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const DEFAULT_FROM_EMAIL = Deno.env.get('DEFAULT_FROM_EMAIL') || 'noreply@maerchennails.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify API key
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured in environment variables');
    }

    const { to, subject, html, from } = await req.json() as EmailData;

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required email fields (to, subject, or html)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare the SendGrid payload
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
      from: {
        email: from || DEFAULT_FROM_EMAIL,
        name: 'MärchenNails',
      },
      reply_to: {
        email: 'info@maerchennails.com',
        name: 'MärchenNails Customer Support',
      },
    };

    // Send the email via SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', errorText);
      throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Email sending error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
