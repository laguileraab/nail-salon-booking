import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';
import SEO from '../../components/SEO';
import { createClient } from '@supabase/supabase-js';

// Create a properly typed Supabase client
const typedSupabase = supabase as ReturnType<typeof createClient>;

type Appointment = {
  id: string;
  service: {
    name: string;
  };
  start_time: string;
  has_feedback: boolean;
};

type FeedbackFormData = {
  appointment_id: string;
  rating: number;
  comment: string;
  anonymous: boolean;
};

// Define the structure to match the exact response from Supabase
interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  appointments: {
    services: Array<{ name: string }>;
    start_time: string;
  };
}

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    appointment_id: '',
    rating: 0,
    comment: '',
    anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastFeedback, setPastFeedback] = useState<FeedbackItem[]>([]);

  // Parse query parameters to see if appointment was pre-selected
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appointmentId = params.get('appointment');
    if (appointmentId) {
      setSelectedAppointment(appointmentId);
      setFeedbackForm(prev => ({ ...prev, appointment_id: appointmentId }));
    }
  }, [location.search]);

  // Fetch completed appointments without feedback
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.id) return;

      setIsLoading(true);
      try {
        // Fetch appointments that are completed and don't have feedback yet
        const { data: appointmentsData, error: appointmentsError } = await typedSupabase
          .from('appointments')
          .select(`
            id,
            start_time,
            services:service_id (name)
          `)
          .eq('user_id', profile.id)
          .eq('status', 'completed')
          .order('start_time', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        // Fetch existing feedback to determine which appointments already have feedback
        const { data: feedbackData, error: feedbackError } = await typedSupabase
          .from('feedback')
          .select('appointment_id')
          .eq('user_id', profile.id);

        if (feedbackError) throw feedbackError;

        // Create a set of appointment IDs that already have feedback
        const appointmentsWithFeedback = new Set(
          feedbackData?.map((feedback) => feedback.appointment_id) || []
        );

        // Mark appointments with feedback
        const processedAppointments = appointmentsData?.map((appointment) => {
          // Handle possible undefined types with type assertion
          const appointmentData = appointment as unknown as { 
            id: string; 
            start_time: string;
            services: Array<{ name: string }> | { name: string };
          };
          
          // Get the first service if it exists
          const serviceData = Array.isArray(appointmentData.services) && appointmentData.services.length > 0 
            ? appointmentData.services[0] 
            : (appointmentData.services as { name: string }) || null;
            
          return {
            id: appointmentData.id,
            start_time: appointmentData.start_time,
            service: {
              name: serviceData?.name || 'Unknown Service'
            },
            has_feedback: appointmentsWithFeedback.has(appointmentData.id)
          };
        }) || [];

        setAppointments(processedAppointments);

        // Fetch past feedback
        const { data: pastFeedbackData, error: pastFeedbackError } = await typedSupabase
          .from('feedback')
          .select(`
            id,
            rating,
            comment,
            created_at,
            appointments:appointment_id (services:service_id (name), start_time)
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (pastFeedbackError) throw pastFeedbackError;

        // Process the feedback data to match our expected structure
        if (pastFeedbackData) {
          const processedFeedback = pastFeedbackData.map(item => {
            // Type assertion for safety
            const feedbackItem = item as unknown as {
              id: string;
              rating: number;
              comment: string;
              created_at: string;
              appointments: {
                services: Array<{ name: string }> | { name: string };
                start_time: string;
              } | Array<{
                services: Array<{ name: string }> | { name: string };
                start_time: string;
              }>;
            };
            
            // Assuming item.appointments might be an array when it comes from Supabase
            const appointmentData = Array.isArray(feedbackItem.appointments) 
              ? feedbackItem.appointments[0] 
              : feedbackItem.appointments;

            return {
              id: feedbackItem.id,
              rating: feedbackItem.rating,
              comment: feedbackItem.comment,
              created_at: feedbackItem.created_at,
              appointments: {
                services: Array.isArray(appointmentData.services) 
                  ? appointmentData.services 
                  : [appointmentData.services],
                start_time: appointmentData.start_time
              }
            } as FeedbackItem;
          });
          setPastFeedback(processedFeedback);
        } else {
          setPastFeedback([]);
        }
      } catch (error: unknown) {
        console.error('Error fetching appointments or feedback:', error instanceof Error ? error.message : String(error));
        toast.error('Failed to load your appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [profile?.id]);

  const handleAppointmentSelect = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setFeedbackForm(prev => ({ ...prev, appointment_id: appointmentId }));
  };

  const handleRatingChange = (rating: number) => {
    setFeedbackForm(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackForm(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedbackForm(prev => ({ ...prev, anonymous: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id || !feedbackForm.appointment_id || feedbackForm.rating === 0) {
      toast.error('Please select an appointment and provide a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await typedSupabase.from('feedback').insert([
        {
          user_id: profile.id,
          appointment_id: feedbackForm.appointment_id,
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
          anonymous: feedbackForm.anonymous,
        },
      ]);

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      
      // Reset form
      setFeedbackForm({
        appointment_id: '',
        rating: 0,
        comment: '',
        anonymous: false,
      });
      setSelectedAppointment('');
      
      // Refresh the page to update the appointment list
      navigate('/client/feedback');
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 focus:outline-none focus:ring-0`}
            onClick={() => onRatingChange(star)}
          >
            <FiStar className={`h-8 w-8 ${star <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  const renderPastFeedback = () => {
    if (pastFeedback.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't submitted any feedback yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pastFeedback.map((feedback) => {
          // Handle the case where services might be an array by safely accessing it
          const serviceName = feedback.appointments.services?.[0]?.name || 'Unknown Service';
          
          return (
            <div key={feedback.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{serviceName}</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`h-5 w-5 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {new Date(feedback.appointments.start_time).toLocaleDateString()} at{' '}
                  {new Date(feedback.appointments.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <p className="text-sm text-gray-600">{feedback.comment}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="Provide Feedback - M&auml;rchenNails"
        description="Share your experience and provide feedback about your nail care services at M&auml;rchenNails"
        ogType="website"
      />
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Provide Feedback for M&auml;rchenNails</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Submit Feedback */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Submit New Feedback</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Share your experience with our services
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="appointment" className="block text-sm font-medium text-gray-700">
                  Select Appointment
                </label>
                <select
                  id="appointment"
                  name="appointment"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm"
                  value={selectedAppointment}
                  onChange={(e) => handleAppointmentSelect(e.target.value)}
                  required
                >
                  <option value="">Choose an appointment</option>
                  {appointments
                    .filter((appointment) => !appointment.has_feedback)
                    .map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {appointment.service.name} - {formatDateTime(appointment.start_time)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-1">
                  <StarRating rating={feedbackForm.rating} onRatingChange={handleRatingChange} />
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <div className="mt-1">
                  <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Tell us about your experience"
                    value={feedbackForm.comment}
                    onChange={handleCommentChange}
                  />
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="anonymous"
                    name="anonymous"
                    type="checkbox"
                    checked={feedbackForm.anonymous}
                    onChange={handleAnonymousChange}
                    className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="anonymous" className="font-medium text-gray-700">
                    Submit anonymously
                  </label>
                  <p className="text-gray-500">
                    Your name will not be displayed with this feedback.
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAppointment || feedbackForm.rating === 0}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Past Feedback */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Your Past Feedback</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Review the feedback you've previously submitted</p>
          </div>

          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : (
              renderPastFeedback()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
