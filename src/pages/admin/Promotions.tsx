import { useState, useEffect } from 'react';
// Import is preserved but commented for future implementation with real database
// import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiTag, FiCalendar, FiPercent } from 'react-icons/fi';

interface Promotion {
  id: number;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'free_service';
  discount_value: number;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  services: number[] | null;
  usage_limit: number | null;
  usage_count: number;
}

const AdminPromotions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  const [formData, setFormData] = useState<Omit<Promotion, 'id' | 'usage_count'>>({ 
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    code: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
    services: null,
    usage_limit: null
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch from Supabase
      // const { data, error } = await supabase.from('promotions').select('*');
      // if (error) throw error;
      // setPromotions(data || []);
      
      // For demo purposes, use mock data
      const mockPromotions: Promotion[] = [
        {
          id: 1,
          name: 'Spring Special',
          description: 'Get 15% off all manicure services this spring!',
          discount_type: 'percentage',
          discount_value: 15,
          code: 'SPRING15',
          start_date: '2025-03-01',
          end_date: '2025-05-31',
          is_active: true,
          services: [1, 2, 3], // IDs of applicable services
          usage_limit: 100,
          usage_count: 42
        },
        {
          id: 2,
          name: 'New Client Discount',
          description: 'First-time clients get $10 off any service',
          discount_type: 'fixed',
          discount_value: 10,
          code: 'WELCOME10',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          is_active: true,
          services: null, // Applicable to all services
          usage_limit: null, // No limit
          usage_count: 87
        },
        {
          id: 3,
          name: 'Free Hand Massage',
          description: 'Get a free hand massage with any pedicure service',
          discount_type: 'free_service',
          discount_value: 0,
          code: 'FREEMASSAGE',
          start_date: '2025-02-01',
          end_date: '2025-03-15',
          is_active: false,
          services: [5, 6, 7], // IDs of pedicure services
          usage_limit: 50,
          usage_count: 50 // Reached limit
        },
      ];
      
      setPromotions(mockPromotions);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    } catch (error: any) {
      console.error('Error fetching promotions:', error.message);
      toast.error('Failed to load promotions');
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedPromotion(null);
    setFormData({
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      code: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      services: null,
      usage_limit: null
    });
    setShowModal(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      code: promotion.code,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      is_active: promotion.is_active,
      services: promotion.services,
      usage_limit: promotion.usage_limit
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : Number(value),
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedPromotion) {
        // Edit existing promotion
        // In a real app, update in Supabase
        // const { error } = await supabase.from('promotions').update(formData).eq('id', selectedPromotion.id);
        // if (error) throw error;
        
        // Update locally
        setPromotions(prev =>
          prev.map(promo =>
            promo.id === selectedPromotion.id
              ? { ...formData, id: selectedPromotion.id, usage_count: selectedPromotion.usage_count }
              : promo
          )
        );
        
        toast.success('Promotion updated successfully');
      } else {
        // Add new promotion
        // In a real app, insert to Supabase
        // const { data, error } = await supabase.from('promotions').insert(formData).select();
        // if (error) throw error;
        
        // Add locally with a mock ID
        const newId = Math.max(0, ...promotions.map(p => p.id)) + 1;
        const newPromotion = { ...formData, id: newId, usage_count: 0 };
        setPromotions(prev => [...prev, newPromotion]);
        
        toast.success('Promotion added successfully');
      }
      
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving promotion:', error.message);
      toast.error(selectedPromotion ? 'Failed to update promotion' : 'Failed to add promotion');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      // In a real app, delete from Supabase
      // const { error } = await supabase.from('promotions').delete().eq('id', id);
      // if (error) throw error;
      
      // Remove locally
      setPromotions(prev => prev.filter(promo => promo.id !== id));
      
      toast.success('Promotion deleted successfully');
    } catch (error: any) {
      console.error('Error deleting promotion:', error.message);
      toast.error('Failed to delete promotion');
    }
  };

  const toggleActiveStatus = async (promotion: Promotion) => {
    try {
      const newStatus = !promotion.is_active;
      
      // In a real app, update in Supabase
      // const { error } = await supabase
      //   .from('promotions')
      //   .update({ is_active: newStatus })
      //   .eq('id', promotion.id);
      // if (error) throw error;
      
      // Update locally
      setPromotions(prev =>
        prev.map(p =>
          p.id === promotion.id ? { ...p, is_active: newStatus } : p
        )
      );
      
      toast.success(`Promotion ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      console.error('Error updating promotion status:', error.message);
      toast.error('Failed to update promotion status');
    }
  };

  const getStatusText = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_active) return 'Inactive';
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  const getStatusClass = (promotion: Promotion) => {
    const status = getStatusText(promotion);
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiscountText = (promotion: Promotion) => {
    switch (promotion.discount_type) {
      case 'percentage': return `${promotion.discount_value}% off`;
      case 'fixed': return `$${promotion.discount_value} off`;
      case 'free_service': return 'Free service';
      default: return '';
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    switch (filterStatus) {
      case 'active':
        return promotion.is_active && now >= startDate && now <= endDate;
      case 'inactive':
        return !promotion.is_active;
      case 'expired':
        return now > endDate;
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Promotions & Discounts</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Promotion
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'inactive', 'expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`inline-flex items-center px-3 py-1.5 border ${filterStatus === status ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promotions list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading promotions...</p>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No promotions found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredPromotions.map((promotion) => (
              <li key={promotion.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{promotion.name}</h3>
                      <div className="mt-1 flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(promotion)} mr-2`}
                        >
                          {getStatusText(promotion)}
                        </span>
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <FiPercent className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {getDiscountText(promotion)}
                        </span>
                        {promotion.code && (
                          <span className="ml-4 inline-flex items-center text-sm text-gray-500">
                            <FiTag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            Code: {promotion.code}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleActiveStatus(promotion)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded ${promotion.is_active ? 'text-red-700 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'}`}
                      >
                        {promotion.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(promotion)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiEdit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{promotion.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {new Date(promotion.start_date).toLocaleDateString()} - {new Date(promotion.end_date).toLocaleDateString()}
                    <span className="ml-4">
                      Used {promotion.usage_count}{promotion.usage_limit ? ` / ${promotion.usage_limit}` : ''} times
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add/Edit Promotion Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="flex justify-between items-center pb-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  {selectedPromotion ? 'Edit Promotion' : 'Add New Promotion'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-2">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Promotion Name *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700">
                      Discount Type *
                    </label>
                    <div className="mt-1">
                      <select
                        id="discount_type"
                        name="discount_type"
                        required
                        value={formData.discount_type}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount Discount</option>
                        <option value="free_service">Free Service</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700">
                      {formData.discount_type === 'percentage' ? 'Discount Percentage (%)' : 
                       formData.discount_type === 'fixed' ? 'Discount Amount ($)' : 
                       'Discount Value'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="discount_value"
                        id="discount_value"
                        min={0}
                        disabled={formData.discount_type === 'free_service'}
                        value={formData.discount_value}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Promo Code (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="code"
                        id="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700">
                      Usage Limit (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="usage_limit"
                        id="usage_limit"
                        min={0}
                        value={formData.usage_limit === null ? '' : formData.usage_limit}
                        onChange={handleNumberInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                      Start Date *
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="start_date"
                        id="start_date"
                        required
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                      End Date *
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="end_date"
                        id="end_date"
                        required
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="is_active"
                          name="is_active"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={handleCheckboxChange}
                          className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="is_active" className="font-medium text-gray-700">
                          Active
                        </label>
                        <p className="text-gray-500">Inactive promotions won't be applied to bookings.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:col-start-2 sm:text-sm"
                  >
                    {selectedPromotion ? 'Save Changes' : 'Add Promotion'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
