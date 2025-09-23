// src/app/(non-admin)/layout.tsx
import Footer from "../components/Footer";

export default function NonAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}