import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch all restaurants for dropdown
    supabase.from('restaurants').select('id, name').then(({ data }) => {
      setRestaurants(data || []);
    });
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // 1. Create user in auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
    });
    if (error) {
      setMessage('Error creating user: ' + error.message);
      setLoading(false);
      return;
    }
    // 2. Insert user profile with role and restaurant_id
    const { error: userError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      role,
      restaurant_id: role === 'manager' ? restaurantId : null,
    });
    if (userError) {
      setMessage('User created in auth, but failed to add profile: ' + userError.message);
    } else {
      setMessage('User created successfully!');
      setEmail('');
      setPassword('');
      setRole('manager');
      setRestaurantId('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create User</h2>
      <form onSubmit={handleCreateUser} className="space-y-4">
        <div>
          <label>Email</label>
          <Input value={email} onChange={e => setEmail(e.target.value)} required type="email" />
        </div>
        <div>
          <label>Password</label>
          <Input value={password} onChange={e => setPassword(e.target.value)} required type="password" />
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded p-2">
            <option value="manager">Manager</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        {role === 'manager' && (
          <div>
            <label>Restaurant</label>
            <select value={restaurantId} onChange={e => setRestaurantId(e.target.value)} className="w-full border rounded p-2" required>
              <option value="">Select restaurant</option>
              {restaurants.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
    </div>
  );
}
