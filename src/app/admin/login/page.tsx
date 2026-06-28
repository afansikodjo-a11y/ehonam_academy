"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// The login is now unified at /login — keep this route as a redirect
// so old links/bookmarks still work.
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
    </div>
  );
}
