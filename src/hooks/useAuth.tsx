import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "user" | "supervisor" | "province_manager" | "course_director";

interface Permissions {
  canCreateLessons: boolean;
  canCreateWorkshops: boolean;
  canAddPeople: boolean;
  canEditData: boolean;
  canAccessFinances: boolean;
  canManageUsers: boolean;
  isReadOnly: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: AppRole | null;
  supervisedWorkshop: string | null;
  permissions: Permissions;
  signOut: () => Promise<void>;
}

const defaultPermissions: Permissions = {
  canCreateLessons: false,
  canCreateWorkshops: false,
  canAddPeople: false,
  canEditData: false,
  canAccessFinances: false,
  canManageUsers: false,
  isReadOnly: false,
};

const getPermissions = (role: AppRole | null): Permissions => {
  switch (role) {
    case "admin":
    case "course_director":
      return {
        canCreateLessons: true,
        canCreateWorkshops: true,
        canAddPeople: true,
        canEditData: true,
        canAccessFinances: true,
        canManageUsers: role === "admin",
        isReadOnly: false,
      };
    case "supervisor":
      return {
        canCreateLessons: true,
        canCreateWorkshops: true,
        canAddPeople: true,
        canEditData: true,
        canAccessFinances: false,
        canManageUsers: false,
        isReadOnly: false,
      };
    case "province_manager":
      return {
        canCreateLessons: false,
        canCreateWorkshops: false,
        canAddPeople: false,
        canEditData: false,
        canAccessFinances: true,
        canManageUsers: false,
        isReadOnly: true,
      };
    default: // 'user' or null
      return defaultPermissions;
  }
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  userRole: null,
  supervisedWorkshop: null,
  permissions: defaultPermissions,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [supervisedWorkshop, setSupervisedWorkshop] = useState<string | null>(null);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, supervised_workshop")
        .eq("user_id", userId);

      if (error || !data || data.length === 0) {
        setIsAdmin(false);
        setUserRole("user");
        setSupervisedWorkshop(null);
        return;
      }

      const roles = data.map((r) => r.role as AppRole);
      if (roles.includes("admin")) {
        setIsAdmin(true);
        setUserRole("admin");
        setSupervisedWorkshop(null);
      } else if (roles.includes("course_director")) {
        setIsAdmin(true);
        setUserRole("course_director");
        setSupervisedWorkshop(null);
      } else if (roles.includes("supervisor")) {
        setIsAdmin(false);
        setUserRole("supervisor");
        const supervisorRow = data.find((r) => r.role === "supervisor");
        setSupervisedWorkshop((supervisorRow as any)?.supervised_workshop || null);
      } else if (roles.includes("province_manager")) {
        setIsAdmin(false);
        setUserRole("province_manager");
        setSupervisedWorkshop(null);
      } else {
        setIsAdmin(false);
        setUserRole("user");
        setSupervisedWorkshop(null);
      }
    } catch {
      setIsAdmin(false);
      setUserRole("user");
      setSupervisedWorkshop(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        void checkRole(nextSession.user.id);
      } else {
        setIsAdmin(false);
        setUserRole(null);
        setSupervisedWorkshop(null);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        applySession(nextSession);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        applySession(initialSession);
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setUserRole(null);
    setSupervisedWorkshop(null);
  };

  const permissions = getPermissions(userRole);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, userRole, permissions, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
