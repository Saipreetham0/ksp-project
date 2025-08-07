// src/components/AdminPanel.tsx
// Firebase imports removed - replaced with Supabase
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { createClient } from '@/utils/supabase/client';
import { UserData } from '@/types/auth';
import { ROLES } from '@/lib/roles';
import Image from 'next/image';
import { RoleBasedComponent } from './RoleBasedComponent';

export function AdminPanel() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (hasPermission('read:users')) {
        const supabase = createClient();
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          const usersData: UserData[] = profiles.map((profile: any) => ({
            uid: profile.id,
            email: profile.email,
            displayName: profile.display_name,
            photoURL: profile.avatar_url,
            role: profile.role,
            createdAt: profile.created_at,
            lastLogin: profile.last_sign_in_at || profile.created_at,
          }));
          setUsers(usersData);
        }
      }
      setLoading(false);
    };

    fetchUsers();
  }, [hasPermission]);

  if (!hasPermission('read:users')) {
    return <div>Access denied</div>;
  }

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.uid}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.photoURL ? (
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={user.photoURL}
                          alt=""
                          height={20}
                          width={20}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">
                            {user.displayName?.[0] || user.email[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {ROLES[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <RoleBasedComponent requiredPermission="manage:roles">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                  </RoleBasedComponent>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

