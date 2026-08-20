"use client";

import { usePathname } from "next/navigation";

export default function SiteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin panel renders its own header/nav — skip the public site chrome.
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main className="pt-20">{children}</main>
      {footer}
    </>
  );
}
