"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type CandidateProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  resume_url: string | null;
  resume_name: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
};

type AuthContextType = {
  user: User | null;
  profile: CandidateProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stable profile fetcher - no dependencies to prevent re-subscription loops
  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setProfile(data as CandidateProfile);
      } else if (currentUser) {
        // Fallback profile generated from user metadata
        setProfile({
          id: currentUser.id,
          email: currentUser.email || "",
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split("@")[0] ||
            "Candidate",
          avatar_url:
            currentUser.user_metadata?.avatar_url ||
            currentUser.user_metadata?.picture ||
            null,
          headline: null,
          phone: null,
          location: null,
          summary: null,
          resume_url: null,
          resume_name: null,
          skills: [],
          linkedin_url: null,
          github_url: null,
          portfolio_url: null,
          role: "candidate",
        });
      }
    } catch (err) {
      console.warn("Could not fetch user profile:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // 1. Initial check using getSession
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const initialUser = session?.user ?? null;
      if (initialUser) {
        setUser(initialUser);
        fetchProfile(initialUser.id, initialUser);
      }
      setIsLoading(false);
    });

    // 2. Listen to auth state transitions
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user);
          setIsLoading(false);
        } else if (event === "INITIAL_SESSION" && !session) {
          // If no initial session, mark loading as finished
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
