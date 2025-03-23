import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { translations, Language } from '../types/language.types';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

// Define custom error type for better error handling
interface EmailError extends Error {
  message: string;
  code?: string;
}

/**
 * Service for handling email notifications using Supabase Edge Functions
 */
export const emailService = {
  /**
   * Send an email using the Supabase Edge Function
   * @private
   */
  async _sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      // Use a proper type for the Supabase client with functions
      interface SupabaseClientWithFunctions {
        functions: {
          invoke: (
            functionName: string, 
            options: { body: EmailData }
          ) => Promise<{ data: unknown; error: Error | null }>
        }
      }
      
      const { error } = await (supabase as SupabaseClientWithFunctions).functions.invoke('send-email', {
        body: emailData,
      });

      if (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const emailError = err as EmailError;
      console.error('Email service error:', emailError);
      return { success: false, error: emailError.message || 'Failed to send email' };
    }
  },

  /**
   * Generate a standard email template with the salon branding
   * @private
   */
  _generateEmailTemplate(content: string, lang: Language = 'en'): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8e1e9; padding: 20px; text-align: center;">
          <h1 style="color: #333;">MärchenNails</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
          ${content}
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>&copy; ${new Date().getFullYear()} MärchenNails. All rights reserved.</p>
          <p>123 Beauty Lane, Fashion City, FC 12345</p>
          <p>
            <a href="https://maerchennails.com/privacy" style="color: #666; text-decoration: underline;">${translations[lang]['email.privacyPolicy']}</a> | 
            <a href="https://maerchennails.com/terms" style="color: #666; text-decoration: underline;">${translations[lang]['email.termsOfService']}</a>
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Send a confirmation email for a new booking
   */
  async sendBookingConfirmation(
    email: string,
    firstName: string,
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    language: Language = 'en',
    confirmationCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get translations for the selected language
      const t = translations[language];
      
      // Format date and time nicely for the email
      const formattedDate = format(appointmentDate, 'PPPP');
      const [hours, minutes] = appointmentTime.split(':');
      const formattedTime = `${hours}:${minutes}`;

      // Create the email content
      const content = `
        <p>${t['email.greeting']} ${firstName},</p>
        <p>${t['email.bookingConfirmation']}</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #f8e1e9;">
          <h3 style="margin-top: 0;">${t['email.appointmentDetails']}</h3>
          <p><strong>${t['email.service']}:</strong> ${serviceName}</p>
          <p><strong>${t['email.date']}:</strong> ${formattedDate}</p>
          <p><strong>${t['email.time']}:</strong> ${formattedTime}</p>
          ${confirmationCode ? `<p><strong>${t['email.confirmationCode']}:</strong> ${confirmationCode}</p>` : ''}
        </div>
        <p>${t['email.rescheduleInfo']}</p>
        <p>${t['email.closingMessage']}</p>
        <p>${t['email.regards']}<br>${t['email.team']}</p>
      `;

      // Send the email
      const emailData: EmailData = {
        to: email,
        subject: `${t['email.appointmentDetails']} - MärchenNails`,
        html: this._generateEmailTemplate(content, language),
        replyTo: 'appointments@maerchennails.com'
      };

      return await this._sendEmail(emailData);
    } catch (err: unknown) {
      const emailError = err as EmailError;
      console.error('Send booking confirmation error:', emailError);
      return { success: false, error: emailError.message || 'Failed to send confirmation email' };
    }
  },

  /**
   * Send a reminder email for an upcoming appointment
   */
  async sendAppointmentReminder(
    email: string,
    firstName: string,
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    language: Language = 'en',
    confirmationCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get translations for the selected language
      const t = translations[language];
      
      // Format date and time nicely for the email
      const formattedDate = format(appointmentDate, 'PPPP');
      const [hours, minutes] = appointmentTime.split(':');
      const formattedTime = `${hours}:${minutes}`;

      // Create the email content
      const content = `
        <p>${t['email.greeting']} ${firstName},</p>
        <p>${t['email.reminderGreeting']}</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #f8e1e9;">
          <h3 style="margin-top: 0;">${t['email.appointmentDetails']}</h3>
          <p><strong>${t['email.service']}:</strong> ${serviceName}</p>
          <p><strong>${t['email.date']}:</strong> ${formattedDate}</p>
          <p><strong>${t['email.time']}:</strong> ${formattedTime}</p>
          ${confirmationCode ? `<p><strong>${t['email.confirmationCode']}:</strong> ${confirmationCode}</p>` : ''}
        </div>
        <p>${t['email.arrivalInfo']}</p>
        <p>${t['email.lookingForward']}</p>
        <p>${t['email.regards']}<br>${t['email.team']}</p>
      `;

      // Send the email
      const emailData: EmailData = {
        to: email,
        subject: `${t['email.reminderSubject']} - MärchenNails`,
        html: this._generateEmailTemplate(content, language),
        replyTo: 'appointments@maerchennails.com'
      };

      return await this._sendEmail(emailData);
    } catch (err: unknown) {
      const emailError = err as EmailError;
      console.error('Send appointment reminder error:', emailError);
      return { success: false, error: emailError.message || 'Failed to send reminder email' };
    }
  },

  /**
   * Send a cancellation notification email
   */
  async sendCancellationNotification(
    email: string,
    firstName: string,
    serviceName: string,
    appointmentDate: Date,
    appointmentTime: string,
    language: Language = 'en'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get translations for the selected language
      const t = translations[language];
      
      // Format date and time nicely for the email
      const formattedDate = format(appointmentDate, 'PPPP');
      const [hours, minutes] = appointmentTime.split(':');
      const formattedTime = `${hours}:${minutes}`;

      // Create the email content
      const content = `
        <p>${t['email.greeting']} ${firstName},</p>
        <p>${t['email.cancellationInfo']}</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #f8e1e9;">
          <h3 style="margin-top: 0;">${t['email.cancelledAppointment']}</h3>
          <p><strong>${t['email.service']}:</strong> ${serviceName}</p>
          <p><strong>${t['email.date']}:</strong> ${formattedDate}</p>
          <p><strong>${t['email.time']}:</strong> ${formattedTime}</p>
        </div>
        <p>${t['email.bookAgain']}</p>
        <p>${t['email.regards']}<br>${t['email.team']}</p>
      `;

      // Send the email
      const emailData: EmailData = {
        to: email,
        subject: `${t['email.cancellationSubject']} - MärchenNails`,
        html: this._generateEmailTemplate(content, language),
        replyTo: 'appointments@maerchennails.com'
      };

      return await this._sendEmail(emailData);
    } catch (err: unknown) {
      const emailError = err as EmailError;
      console.error('Send cancellation notification error:', emailError);
      return { success: false, error: emailError.message || 'Failed to send cancellation email' };
    }
  },


  /**
   * Send a feedback thank you email
   */
  async sendFeedbackThankYou(
    email: string,
    firstName: string,
    feedbackScore: number,
    language: Language = 'en'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get translations for the selected language
      const t = translations[language];
      
      // Customize message based on feedback score
      let feedbackMessage = '';
      if (feedbackScore >= 4) {
        feedbackMessage = t['email.excellentFeedback'];
      } else if (feedbackScore === 3) {
        feedbackMessage = t['email.goodFeedback'];
      } else {
        feedbackMessage = t['email.improveFeedback'];
      }

      // Create the email content
      const content = `
        <p>${t['email.greeting']} ${firstName},</p>
        <p>${t['email.feedbackThank']}</p>
        <p>${feedbackMessage}</p>
        <p>${t['email.feedbackHelp']}</p>
        <p>${t['email.feedbackQuestion']}</p>
        <p>${t['email.regards']}<br>${t['email.team']}</p>
      `;

      // Send the email
      const emailData: EmailData = {
        to: email,
        subject: `${t['email.feedbackSubject']} - MärchenNails`,
        html: this._generateEmailTemplate(content, language),
        replyTo: 'feedback@maerchennails.com'
      };

      return await this._sendEmail(emailData);
    } catch (err: unknown) {
      const emailError = err as EmailError;
      console.error('Send feedback thank you error:', emailError);
      return { success: false, error: emailError.message || 'Failed to send feedback thank you email' };
    }
  },

  /**
   * Send a promotional email about special offers
   */
  async sendPromotionalEmail(
    email: string,
    firstName: string,
    promotionTitle: string,
    promotionDetails: string,
    validUntil: Date,
    language: Language = 'en',
    promoCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get translations for the selected language
      const t = translations[language];
      
      // Format the valid until date
      const formattedDate = format(validUntil, 'PPPP');

      // Create the email content
      const content = `
        <p>${t['email.greeting']} ${firstName},</p>
        <div style="background-color: #f8e1e9; padding: 15px; margin: 15px 0; text-align: center;">
          <h2 style="margin-top: 0; color: #333;">${promotionTitle}</h2>
          <p>${promotionDetails}</p>
          ${promoCode ? `<p style="font-size: 20px; font-weight: bold;">${t['email.useCode']}: <span style="background-color: #fff; padding: 5px 10px; border-radius: 4px;">${promoCode}</span></p>` : ''}
          <p><strong>${t['email.validUntil']}:</strong> ${formattedDate}</p>
        </div>
        <p>${t['email.promoBook']}</p>
        <p><a href="https://maerchennails.com/booking" style="display: inline-block; background-color: #f8e1e9; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">${t['email.bookNowButton']}</a></p>
        <p>${t['email.lookingForward']}</p>
        <p>${t['email.regards']}<br>${t['email.team']}</p>
        <p style="font-size: 11px; color: #999;">${t['email.unsubscribe']} <a href="https://maerchennails.com/unsubscribe?email=${email}" style="color: #999;">${t['email.clickHere']}</a>.</p>
      `;

      // Send the email
      const emailData: EmailData = {
        to: email,
        subject: `${t['email.promoSubject']}: ${promotionTitle} - MärchenNails`,
        html: this._generateEmailTemplate(content, language),
        replyTo: 'promotions@maerchennails.com'
      };

      return await this._sendEmail(emailData);
    } catch (err: unknown) {
      const emailError = err as EmailError;
      console.error('Send promotional email error:', emailError);
      return { success: false, error: emailError.message || 'Failed to send promotional email' };
    }
  }
};
