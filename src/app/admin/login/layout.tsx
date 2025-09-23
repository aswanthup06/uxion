import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Admin Login - UXCurve",
  description: "Admin login page",
};

export default function LoginLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {/* Simple, clean layout without sidebar */}
        <div className="min-h-screen flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}