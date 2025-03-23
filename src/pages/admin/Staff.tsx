import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch } from 'react-icons/fi';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  image_url: string;
  bio: string;
  is_active: boolean;
}

const AdminStaff = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  const roles = ['Nail Technician', 'Salon Manager', 'Receptionist', 'Assistant'];
  const specialtyOptions = [
    'Manicure', 'Pedicure', 'Gel Polish', 'Acrylic Extensions', 
    'Nail Art', 'Spa Treatments', 'Nail Repair', 'Paraffin Treatments'
  ];

  const [formData, setFormData] = useState<Omit<StaffMember, 'id'>>({   
    name: '',
    email: '',
    phone: '',
    role: roles[0],
    specialties: [],
    image_url: '',
    bio: '',
    is_active: true,
  });

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch from Supabase
      // const { data, error } = await supabase.from('staff').select('*');
      // if (error) throw error;
      // setStaffMembers(data || []);
      
      // For demo purposes, use mock data
      const mockStaff: StaffMember[] = [
        {
          id: 1,
          name: 'Emma Johnson',
          email: 'emma.j@elegantnails.com',
          phone: '(555) 123-4567',
          role: 'Nail Technician',
          specialties: ['Gel Polish', 'Nail Art', 'Manicure'],
          image_url: 'https://randomuser.me/api/portraits/women/44.jpg',
          bio: 'Emma has over 8 years of experience in nail artistry and specializes in creative nail art designs.',
          is_active: true,
        },
        {
          id: 2,
          name: 'Sophia Rodriguez',
          email: 'sophia.r@elegantnails.com',
          phone: '(555) 234-5678',
          role: 'Salon Manager',
          specialties: ['Acrylic Extensions', 'Nail Repair', 'Pedicure'],
          image_url: 'https://randomuser.me/api/portraits/women/68.jpg',
          bio: 'Sophia manages our salon operations and is also an expert in acrylic nails with 12 years of experience.',
          is_active: true,
        },
        {
          id: 3,
          name: 'Michael Chen',
          email: 'michael.c@elegantnails.com',
          phone: '(555) 345-6789',
          role: 'Nail Technician',
          specialties: ['Pedicure', 'Spa Treatments', 'Paraffin Treatments'],
          image_url: 'https://randomuser.me/api/portraits/men/22.jpg',
          bio: 'Michael specializes in spa pedicures and relaxing foot treatments with 5 years in the industry.',
          is_active: true,
        },
        {
          id: 4,
          name: 'Jessica Lee',
          email: 'jessica.l@elegantnails.com',
          phone: '(555) 456-7890',
          role: 'Nail Technician',
          specialties: ['Gel Polish', 'Nail Art', 'Acrylic Extensions'],
          image_url: 'https://randomuser.me/api/portraits/women/33.jpg',
          bio: 'Jessica is our nail art specialist with an artistic background and attention to detail.',
          is_active: false,
        },
      ];
      
      setStaffMembers(mockStaff);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    } catch (error: any) {
      console.error('Error fetching staff:', error.message);
      toast.error('Failed to load staff members');
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredStaff = staffMembers.filter(staff => {
    const query = searchQuery.toLowerCase();
    return (
      staff.name.toLowerCase().includes(query) ||
      staff.email.toLowerCase().includes(query) ||
      staff.role.toLowerCase().includes(query) ||
      staff.specialties.some(specialty => specialty.toLowerCase().includes(query))
    );
  });

  const openAddModal = () => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: roles[0],
      specialties: [],
      image_url: '',
      bio: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      specialties: [...staff.specialties],
      image_url: staff.image_url,
      bio: staff.bio,
      is_active: staff.is_active,
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => {
      const specialties = [...prev.specialties];
      if (specialties.includes(specialty)) {
        return {
          ...prev,
          specialties: specialties.filter(s => s !== specialty),
        };
      } else {
        return {
          ...prev,
          specialties: [...specialties, specialty],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedStaff) {
        // Edit existing staff
        // In a real app, update in Supabase
        // const { error } = await supabase.from('staff').update(formData).eq('id', selectedStaff.id);
        // if (error) throw error;
        
        // Update locally
        setStaffMembers(prev =>
          prev.map(staff =>
            staff.id === selectedStaff.id
              ? { ...formData, id: selectedStaff.id }
              : staff
          )
        );
        
        toast.success('Staff member updated successfully');
      } else {
        // Add new staff
        // In a real app, insert to Supabase
        // const { data, error } = await supabase.from('staff').insert(formData).select();
        // if (error) throw error;
        
        // Add locally with a mock ID
        const newId = Math.max(0, ...staffMembers.map(s => s.id)) + 1;
        const newStaff = { ...formData, id: newId };
        setStaffMembers(prev => [...prev, newStaff]);
        
        toast.success('Staff member added successfully');
      }
      
      setShowModal(false);
    } catch (error: unknown) {
      console.error('Error saving staff:', error);
      toast.error(selectedStaff ? 'Failed to update staff member' : 'Failed to add staff member');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      // In a real app, delete from Supabase
      // const { error } = await supabase.from('staff').delete().eq('id', id);
      // if (error) throw error;
      
      // Remove locally
      setStaffMembers(prev => prev.filter(staff => staff.id !== id));
      
      toast.success('Staff member deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const toggleActiveStatus = async (staff: StaffMember) => {
    try {
      const newStatus = !staff.is_active;
      
      // In a real app, update in Supabase
      // const { error } = await supabase
      //   .from('staff')
      //   .update({ is_active: newStatus })
      //   .eq('id', staff.id);
      // if (error) throw error;
      
      // Update locally
      setStaffMembers(prev =>
        prev.map(s =>
          s.id === staff.id ? { ...s, is_active: newStatus } : s
        )
      );
      
      toast.success(`Staff member ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: unknown) {
      console.error('Error updating staff status:', error);
      toast.error('Failed to update staff status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Staff Management</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <div className="max-w-lg w-full lg:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search Staff
          </label>
          <div className="relative text-gray-400 focus-within:text-gray-600">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <FiSearch className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search"
              className="block w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:placeholder-gray-400 sm:text-sm"
              placeholder="Search by name, email, role or specialty"
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Staff list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading staff members...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No staff members found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredStaff.map((staff) => (
              <li key={staff.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={staff.image_url || 'https://via.placeholder.com/150'}
                          alt={staff.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{staff.name}</h3>
                          {!staff.is_active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <p><span className="font-medium">Role:</span> {staff.role}</p>
                          <p><span className="font-medium">Email:</span> {staff.email}</p>
                          <p><span className="font-medium">Phone:</span> {staff.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleActiveStatus(staff)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded ${staff.is_active ? 'text-red-700 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'}`}
                      >
                        {staff.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(staff)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiEdit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Specialties: </span>
                      <div className="mt-1">
                        {staff.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800 mr-1 mb-1"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{staff.bio}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
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
                  {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role *
                    </label>
                    <div className="mt-1">
                      <select
                        id="role"
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                      Profile Image URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="image_url"
                        id="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">Specialties</legend>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {specialtyOptions.map((specialty) => (
                            <div key={specialty} className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={`specialty-${specialty}`}
                                  name={`specialty-${specialty}`}
                                  type="checkbox"
                                  checked={formData.specialties.includes(specialty)}
                                  onChange={() => handleSpecialtyChange(specialty)}
                                  className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-2 text-sm">
                                <label htmlFor={`specialty-${specialty}`} className="font-medium text-gray-700">
                                  {specialty}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </fieldset>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Brief description of the staff member's experience and expertise.</p>
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
                        <p className="text-gray-500">Inactive staff members won't be shown for booking.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-600 text-base font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 sm:col-start-2 sm:text-sm"
                  >
                    {selectedStaff ? 'Save Changes' : 'Add Staff Member'}
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

export default AdminStaff;
