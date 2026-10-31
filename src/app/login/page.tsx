import { Suspense } from "react";
import LoginPage from "./LoginPage";

export default function Login() {
  return (
    <Suspense fallback={<main className="fixed inset-0 h-[100dvh] w-full bg-surface-page" />}>
      <LoginPage mode="signin" />
    </Suspense>
  );
}
