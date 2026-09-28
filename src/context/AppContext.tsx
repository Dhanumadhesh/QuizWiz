import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'faculty' | 'student' | null;

interface AppState {
  role: Role;
  studentId: string | null;
  setRole: (r: Role) => void;
  setStudentId: (id: string | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const logout = () => {
    setRole(null);
    setStudentId(null);
  };

  return (
    <AppContext.Provider value={{ role, studentId, setRole, setStudentId, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
