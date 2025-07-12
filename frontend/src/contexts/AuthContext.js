import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api'; 

export const AuthContext = createContext();

/**
 * AuthProvider:
 *  - Listens for Firebase auth state changes
 *  - When a user logs in, fetches their role from Postgres via backend
 *  - Provides { currentUser, userRole } to the rest of the app
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); 
  const [userRole, setUserRole] = useState(null);       
  const [loading, setLoading] = useState(true);        

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const res = await api.get(`/users/byFirebaseUid/${user.uid}`);
          //Backend: { id, email, role }
          const { role } = res.data;
          setUserRole(role); //admin or staff
        } catch (err) {
          console.error('Failed to fetch role from backend:', err);
          
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <p>Loading user…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}
