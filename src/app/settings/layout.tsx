"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Profile", href: "/settings/profile" },
  { name: "Account", href: "/settings/account" },
  { name: "Corporation", href: "/settings/corporation" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="border-b mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    "border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </main>
    </div>
  );
}