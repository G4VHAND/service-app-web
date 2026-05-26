"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  BarChart3,
  Users,
  Wrench,
  Package,
  ReceiptText,
  ShoppingCart,
  Clock3,
  TrendingUp,
  LogOut,
  Upload,
  UserCog,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type Role = "admin" | "kasir";

type MenuItem =
  | {
      label: string;
      section: true;
    }
  | {
      href: string;
      icon: LucideIcon;
      label: string;
      roles: Role[];
      section?: false;
    };

const menus: MenuItem[] = [
  { label: "Menu Utama", section: true },

  {
    href: "/dashboard",
    icon: BarChart3,
    label: "Dashboard",
    roles: ["admin", "kasir"],
  },

  {
    href: "/customer",
    icon: Users,
    label: "Customer",
    roles: ["admin", "kasir"],
  },

  {
    href: "/service",
    icon: Wrench,
    label: "Service",
    roles: ["admin", "kasir"],
  },

  {
    href: "/barang",
    icon: Package,
    label: "Barang",
    roles: ["admin", "kasir"],
  },

  {
    href: "/users",
    icon: UserCog,
    label: "Manajemen User",
    roles: ["admin"],
  },

  { label: "Transaksi", section: true },

  {
    href: "/transaksi",
    icon: ReceiptText,
    label: "Transaksi Service",
    roles: ["admin", "kasir"],
  },

  {
    href: "/penjualan",
    icon: ShoppingCart,
    label: "Penjualan Barang",
    roles: ["admin", "kasir"],
  },

  {
    href: "/riwayat",
    icon: Clock3,
    label: "Riwayat Transaksi",
    roles: ["admin", "kasir"],
  },

  { label: "Laporan", section: true },

  {
    href: "/laporan",
    icon: TrendingUp,
    label: "Laporan Pemasukan",
    roles: ["admin"],
  },

  {
    href: "/keluar",
    icon: Upload,
    label: "Barang Keluar",
    roles: ["admin"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const username = session?.user?.name || "User";
  const role = (session?.user as any)?.role || "kasir";

  const avatar = username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#12233f] flex">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 h-screen flex flex-col bg-linear-to-b from-[#0c1830] to-[#14284a] border-r border-white/10 shadow-2xl z-50">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d4af37] flex items-center justify-center text-[#152847] font-bold text-lg shadow-lg">
              S
            </div>

            <div>
              <h1 className="text-white font-bold leading-tight">
                Service App
              </h1>

              <p className="text-white/40 text-xs">
                Toko & Service Elektronik
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          {menus.map((item, i) => {
            if (item.section) {
              return (
                <p
                  key={i}
                  className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.2em] px-3 pt-5 pb-2"
                >
                  {item.label}
                </p>
              );
            }

            if (!item.roles.includes(role as Role)) {
              return null;
            }

            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm mb-1 transition-all duration-200 ${
                  active
                    ? "bg-[#d4af37]/15 text-[#f0d060] border border-[#d4af37]/20 shadow-lg"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition ${
                    active
                      ? "text-[#f0d060]"
                      : "text-white/45 group-hover:text-white/80"
                  }`}
                />

                <span className="font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/8 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#f0d060] font-bold shrink-0">
              {avatar}
            </div>

            <div className="flex-1 text-left overflow-hidden">
              <p className="text-white text-sm font-medium truncate">
                {username}
              </p>

              <p className="text-white/35 text-xs capitalize">
                {role}
              </p>
            </div>

            <LogOut
              size={17}
              className="text-white/30 group-hover:text-white/60 transition"
            />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#12233f]/70 border-b border-white/5 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">
                Sistem Management
              </h2>

              <p className="text-white/35 text-sm">
                Venus Computer Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}