"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/app/components/Modal";
import FullCandidateProfile from "./FullCandidateProfile";

/**
 * FEATURE FLAG: Set to `true` whenever you are ready to switch back
 * to the full editorial candidate profile with resume, portfolio, and skills.
 */
const ENABLE_FULL_CANDIDATE_PROFILE = false;

export default function ProfilePage() {
  if (ENABLE_FULL_CANDIDATE_PROFILE) {
    return <FullCandidateProfile />;
  }

  return <MinimalAccountView />;
}

function MinimalAccountView() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 size={22} className="animate-spin text-brand" />
          <p className="text-xs font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-surface-base px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
            <User size={22} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-text-primary">
            Sign in to view your account
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Manage your sign-in details and preferences.
          </p>
          <Link
            href="/login?redirect=/profile"
            className="mt-5 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-control bg-brand text-xs font-semibold text-text-inverse transition hover:bg-brand-hover active:scale-[0.99]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Account identity data
  const name =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Candidate";

  const email = user.email || profile?.email || "";

  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";

  const initials =
    name
      .split(" ")
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  // Account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully.");
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: unknown) {
      console.error("Account deletion error:", err);
      const msg =
        err instanceof Error ? err.message : "Error deleting account";
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/");
    } catch {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="min-h-screen bg-surface-base px-4 py-10 antialiased sm:py-16">
      <div className="mx-auto max-w-md">
        
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          {avatarUrl && !avatarError ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={64}
              height={64}
              priority
              unoptimized
              onError={() => setAvatarError(true)}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-border-default"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-text-primary truncate sm:text-xl">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-1.5 py-0.5 text-3xs font-semibold text-brand">
                <ShieldCheck size={11} />
                <span>Verified</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted truncate">
              {email}
            </p>
            {memberSince && (
              <p className="mt-1 text-2xs text-text-muted">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        {/* Clean Hairline Divider */}
        <hr className="my-6 border-t border-border-subtle/80" />

        {/* Minimal Unboxed Info List */}
        <div className="space-y-3.5 text-xs">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-text-muted">Full Name</span>
            <span className="font-medium text-text-primary text-right">{name}</span>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <span className="text-text-muted">Email</span>
            <span className="font-medium text-text-primary truncate text-right">{email}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-text-muted">Account Status</span>
            <span className="inline-flex items-center gap-1 font-medium text-status-success">
              <CheckCircle2 size={12} />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* Clean Hairline Divider */}
        <hr className="my-6 border-t border-border-subtle/80" />

        {/* Actions */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-primary shadow-subtle transition hover:border-brand hover:text-brand active:scale-[0.99]"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="cursor-pointer text-2xs text-text-muted transition hover:text-status-error hover:underline"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) setIsDeleteModalOpen(false);
        }}
        maxWidth="sm"
        showCloseButton={false}
        bodyClassName="p-6"
        labelledBy="delete-modal-title"
        describedBy="delete-modal-desc"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-error-bg text-status-error ring-8 ring-status-error-bg/60">
            <Trash2 className="h-5 w-5" />
          </div>

          <h3
            id="delete-modal-title"
            className="mt-4 text-base font-bold text-text-primary"
          >
            Delete your account?
          </h3>

          <p
            id="delete-modal-desc"
            className="mt-2 text-xs leading-relaxed text-text-secondary"
          >
            Are you sure you want to permanently delete your account? All sign-in credentials and stored records will be permanently removed.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 inline-flex h-9.5 cursor-pointer items-center justify-center rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold text-text-secondary shadow-subtle transition hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className="flex-1 inline-flex h-9.5 cursor-pointer items-center justify-center gap-2 rounded-control bg-status-error px-4 text-xs font-semibold text-white shadow-subtle transition hover:bg-red-700 disabled:opacity-50 active:scale-[0.99]"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Account</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
