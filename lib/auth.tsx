"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import { DEMO_PASSWORD, TEAM } from "@/lib/demo-users";
import type { AuthUser, OrgState, TeamMember, UserRole } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  team: TeamMember[];
  state: OrgState | null;
  ready: boolean;
  persistence: string;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    fullName: string;
    email: string;
    password: string;
    orgName: string;
    projectName: string;
  }) => Promise<void>;
  signInDemo: (role?: UserRole) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  registerAdmin: (input: {
    fullName: string;
    email: string;
    password: string;
    orgName?: string;
    inviteSecret?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (memberId: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [state, setState] = useState<OrgState | null>(null);
  const [ready, setReady] = useState(false);
  const [persistence, setPersistence] = useState("local");

  const apply = useCallback(
    (payload: { user: AuthUser; state: OrgState; persistence?: string }) => {
      setUser(payload.user);
      setState(payload.state);
      if (payload.persistence) setPersistence(payload.persistence);
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const data = await api<{
        user: AuthUser | null;
        state?: OrgState;
        persistence?: string;
      }>("/api/state");
      if (data.user && data.state) {
        apply({ user: data.user, state: data.state, persistence: data.persistence });
      }
    } catch {
      // session may have expired
    }
  }, [apply]);

  useEffect(() => {
    const restore = async () => {
      try {
        const data = await api<{
          user: AuthUser | null;
          state?: OrgState;
          persistence?: string;
        }>("/api/auth/session");
        if (data.user && data.state) {
          apply({
            user: data.user,
            state: data.state,
            persistence: data.persistence,
          });
        }
      } catch {
        setUser(null);
        setState(null);
      } finally {
        setReady(true);
      }
    };
    void restore();
  }, [apply]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await api("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await api<{
        user: AuthUser;
        state: OrgState;
        persistence?: string;
      }>("/api/auth/session");
      apply(data);
    },
    [apply],
  );

  const signUp = useCallback(
    async (input: {
      fullName: string;
      email: string;
      password: string;
      orgName: string;
      projectName: string;
    }) => {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      });
      const data = await api<{
        user: AuthUser;
        state: OrgState;
        persistence?: string;
      }>("/api/auth/session");
      apply(data);
    },
    [apply],
  );

  const signInDemo = useCallback(
    async (role: UserRole = "admin") => {
      const member = TEAM.find((item) => item.role === role) ?? TEAM[0];
      await signIn(member.email, DEMO_PASSWORD);
    },
    [signIn],
  );

  const loadSession = useCallback(async () => {
    const data = await api<{
      user: AuthUser;
      state: OrgState;
      persistence?: string;
    }>("/api/auth/session");
    apply(data);
  }, [apply]);

  const signInAdmin = useCallback(
    async (email: string, password: string) => {
      await api("/api/admin/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await loadSession();
    },
    [loadSession],
  );

  const registerAdmin = useCallback(
    async (input: {
      fullName: string;
      email: string;
      password: string;
      orgName?: string;
      inviteSecret?: string;
    }) => {
      await api("/api/admin/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await loadSession();
    },
    [loadSession],
  );

  const signOut = useCallback(async () => {
    await api("/api/auth/signout", { method: "POST" });
    setUser(null);
    setState(null);
  }, []);

  const updateRole = useCallback(
    async (memberId: string, role: UserRole) => {
      await api("/api/team", {
        method: "PATCH",
        body: JSON.stringify({ memberId, role }),
      });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      user,
      team: state?.team ?? [],
      state,
      ready,
      persistence,
      refresh,
      signIn,
      signUp,
      signInDemo,
      signInAdmin,
      registerAdmin,
      signOut,
      updateRole,
    }),
    [
      user,
      state,
      ready,
      persistence,
      refresh,
      signIn,
      signUp,
      signInDemo,
      signInAdmin,
      registerAdmin,
      signOut,
      updateRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
