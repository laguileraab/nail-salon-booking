import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiSearch, FiStar, FiUser, FiCalendar, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import SEO from '../../components/SEO';

type Feedback = {
  id: string;
  user_id: string;
  appointment_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  appointment?: {
    start_time: string;
    service?: {
      name: string;
    };
  };
};

// Interface for the raw data from Supabase
interface FeedbackResponse {
  id: string;
  user_id: string;
  appointment_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  }[];
  appointment: {
    start_time: string;
    service: {
      name: string;
    }[];
  }[];
}

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch feedbacks data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('feedback')
          .select(`
            id,
            user_id,
            appointment_id,
            rating,
            comment,
            created_at,
            profile:profiles!feedback_user_id_fkey(first_name, last_name, email),
            appointment:appointments!feedback_appointment_id_fkey(start_time, service:services(name))
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match the Feedback type
        const transformedData = data?.map((item: FeedbackResponse) => ({
          id: item.id,
          user_id: item.user_id,
          appointment_id: item.appointment_id,
          rating: item.rating,
          comment: item.comment,
          created_at: item.created_at,
          profile: item.profile && item.profile.length > 0 ? item.profile[0] : undefined,
          appointment: item.appointment && item.appointment.length > 0 ? item.appointment[0] : undefined
        })) as Feedback[];
        
        setFeedbacks(transformedData || []);
      } catch (error: unknown) {
        console.error('Error fetching feedbacks:', error instanceof Error ? error.message : String(error));
        toast.error('Failed to load feedbacks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRatingFilter = (rating: number | null) => {
    setFilterRating(rating);
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailModalOpen(true);
  };

  const calculateRatingPercentage = (rating: number) => {
    const count = feedbacks.filter(feedback => feedback.rating === rating).length;
    return feedbacks.length ? Math.round((count / feedbacks.length) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <FiStar
          key={index}
          className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ));
  };

  const sortedFeedbacks = () => {
    const sorted = [...feedbacks];
    return sorted;
  };

  const filteredFeedbacks = sortedFeedbacks().filter(feedback => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      feedback.profile?.first_name?.toLowerCase().includes(searchLower) ||
      feedback.profile?.last_name?.toLowerCase().includes(searchLower) ||
      feedback.profile?.email?.toLowerCase().includes(searchLower) ||
      feedback.comment.toLowerCase().includes(searchLower) ||
      feedback.appointment?.service?.name?.toLowerCase().includes(searchLower);
    
    const matchesRating = filterRating === null || feedback.rating === filterRating;
    
    return matchesSearch && matchesRating;
  });

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFeedback(null);
  };

  // Average rating calculation
  const averageRating = feedbacks.length ? 
    (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : 
    '0.0';

  return (
    <div className="max-w-7xl mx-auto">
      <SEO 
        title="Feedback Management - M\u00e4rchenNails"
        description="Manage customer feedback and reviews for M\u00e4rchenNails salon services"
        ogType="website"
      />
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Feedback Management</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-accent-500 focus:border-accent-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search feedback"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Average Rating Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FiStar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{averageRating} / 5.0</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-accent-700">
                Based on {feedbacks.length} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 sm:col-span-2 lg:col-span-3">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Rating Distribution</h3>
            <div className="mt-4 space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-500 mr-2">{rating} stars</span>
                    <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full" 
                      style={{ width: `${calculateRatingPercentage(rating)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-3 w-12">{calculateRatingPercentage(rating)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Feedback</h3>
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Filter by rating:</span>
                  <div className="flex space-x-1">
                    {[null, 5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating === null ? 'all' : rating}
                        className={`px-2 py-1 text-xs font-medium rounded ${filterRating === rating ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => handleRatingFilter(rating)}
                      >
                        {rating === null ? 'All' : rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {isLoading ? (
              <li className="px-4 py-4 sm:px-6 text-center">
                <p className="text-gray-500">Loading feedback...</p>
              </li>
            ) : filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((feedback) => (
                <li key={feedback.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {feedback.profile?.first_name} {feedback.profile?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {feedback.profile?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex">
                      <button
                        onClick={() => handleViewFeedback(feedback)}
                        className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-accent-700 bg-accent-100 hover:bg-accent-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                      >
                        <FiExternalLink className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500 mr-6">
                        <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(feedback.created_at)}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <FiMessageSquare className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {feedback.appointment?.service?.name || 'Unknown service'}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm sm:mt-0">
                      <div className="flex">{renderStars(feedback.rating)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="line-clamp-2">{feedback.comment}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center">
                <p className="text-gray-500">No feedbacks found matching your criteria.</p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {isDetailModalOpen && selectedFeedback && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDetailModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Feedback Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Client</h4>
                        <p className="text-base text-gray-900">
                          {selectedFeedback.profile?.first_name} {selectedFeedback.profile?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{selectedFeedback.profile?.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Service Details</h4>
                        <p className="text-base text-gray-900">
                          {selectedFeedback.appointment?.service?.name || 'Unknown service'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(selectedFeedback.appointment?.start_time || '')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                        <div className="flex items-center mt-1">
                          {renderStars(selectedFeedback.rating)}
                          <span className="ml-2 text-sm text-gray-500">
                            {selectedFeedback.rating} out of 5
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Comment</h4>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{selectedFeedback.comment}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Submitted On</h4>
                        <p className="text-sm text-gray-700">{formatDate(selectedFeedback.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseDetailModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
