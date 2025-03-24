import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const typedSupabase = supabase as ReturnType<typeof createClient>;

const MakeAdmin = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const targetEmail = email || (profile?.email ?? '');
      
      if (!targetEmail) {
        throw new Error('No email specified');
      }

      // First find the user by email
      const { data: userData, error: findError } = await typedSupabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', targetEmail)
        .single();

      if (findError) {
        throw findError;
      }

      if (!userData) {
        throw new Error(`No user found with email ${targetEmail}`);
      }

      // Update the role to admin
      const { error: updateError } = await typedSupabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userData.id);

      if (updateError) {
        throw updateError;
      }

      setMessage(`Successfully set ${targetEmail} as admin!`);
      toast.success(`${targetEmail} is now an admin`);
    } catch (error: unknown) {
      let errorMessage: string;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: string }).message);
      } else {
        errorMessage = String(error);
      }
      
      setMessage(`Error: ${errorMessage}`);
      toast.error(errorMessage);
      console.error('Error making admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeSelfAdmin = async () => {
    if (!profile?.id) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      // Directly update current user's profile
      const { error } = await typedSupabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage(`Successfully made you (${profile.email}) an admin!`);
      toast.success('You are now an admin. Please refresh the page or log out and back in for changes to take effect.');
    } catch (error: unknown) {
      let errorMessage: string;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: string }).message);
      } else {
        errorMessage = String(error);
      }
      
      setMessage(`Error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Utility</h1>
      
      {user ? (
        <>
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <h2 className="text-lg font-semibold mb-2">Your Account</h2>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Role:</strong> {profile?.role || 'Not set'}</p>
            <p><strong>User ID:</strong> {profile?.id}</p>
            
            <button
              onClick={handleMakeSelfAdmin}
              disabled={loading || profile?.role === 'admin'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 w-full"
            >
              {loading ? 'Processing...' : profile?.role === 'admin' ? 'Already Admin' : 'Make Yourself Admin'}
            </button>
          </div>
        
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Make Another User Admin</h2>
            <form onSubmit={handleMakeAdmin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="Enter email address"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Make Admin'}
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900 rounded">
          <p className="mb-4">You need to be logged in to use this utility.</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block">
            Log In
          </a>
        </div>
      )}
      
      {message && (
        <div className={`mt-6 p-4 rounded ${message.includes('Error') ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default MakeAdmin;
