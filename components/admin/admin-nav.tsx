'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  ChevronRight,
  FileText,
  Flag,
  Gauge,
  Image,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  SearchCheck,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  adminRoleLabels,
  hasPermission,
  type AdminIdentity,
  type AdminPermission,
} from '@/src/admin/access';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: AdminPermission;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Genel',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard.read' },
    ],
  },
  {
    label: 'Web / İçerik',
    items: [
      { label: 'Blog', href: '/admin/blog', icon: FileText, permission: 'blog.read' },
      { label: 'Kategoriler', href: '/admin/web/categories', icon: Tags, permission: 'web.read' },
      { label: 'Sayfalar', href: '/admin/web/pages', icon: BookOpen, permission: 'web.read' },
      { label: 'Sponsorlar / İş Birlikleri', href: '/admin/web/sponsors', icon: Boxes, permission: 'web.read' },
      { label: 'Medya', href: '/admin/web/media', icon: Image, permission: 'web.read' },
      { label: 'SEO', href: '/admin/web/seo', icon: SearchCheck, permission: 'web.read' },
      { label: 'Site Ayarları', href: '/admin/web/settings', icon: Settings, permission: 'web.read' },
    ],
  },
  {
    label: 'Mobil Uygulama',
    items: [
      { label: 'Kullanıcılar', href: '/admin/mobile/users', icon: Users, permission: 'users.read' },
      { label: 'Devre Grupları', href: '/admin/mobile/groups', icon: Boxes, permission: 'groups.read' },
      { label: 'Moderasyon', href: '/admin/mobile/moderation', icon: Flag, permission: 'reports.read' },
      { label: 'Askerî Birlikler', href: '/admin/mobile/military-units', icon: Landmark, permission: 'units.read' },
      { label: 'Bildirimler', href: '/admin/mobile/notifications', icon: Bell, permission: 'notifications.read' },
      { label: 'Uygulama Ayarları', href: '/admin/mobile/app-config', icon: Settings, permission: 'appConfig.read' },
      { label: 'İstatistikler', href: '/admin/mobile/analytics', icon: BarChart3, permission: 'analytics.read' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Admin Kullanıcıları', href: '/admin/system/admins', icon: ShieldCheck, permission: 'admins.read' },
      { label: 'Roller & Yetkiler', href: '/admin/system/roles', icon: Gauge, permission: 'admins.read' },
      { label: 'Audit Log', href: '/admin/system/audit-log', icon: SearchCheck, permission: 'audit.read' },
    ],
  },
];

export function AdminNav({ identity }: { identity: AdminIdentity }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="admin-mobile-header">
        <Link className="admin-nav-brand" href="/admin/dashboard">
          <span>devrem</span>
          <small>Merkez</small>
        </Link>
        <button
          aria-expanded={open}
          aria-label={open ? 'Admin menüsünü kapat' : 'Admin menüsünü aç'}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>
      <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <Link className="admin-nav-brand" href="/admin/dashboard">
            <span>devrem</span>
            <small>Merkez</small>
          </Link>
          <p>Web ve mobil operasyonları</p>
        </div>
        <nav aria-label="Admin menüsü">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => hasPermission(identity, item.permission));
            if (!items.length) return null;
            return (
              <section key={group.label}>
                <h2>{group.label}</h2>
                <div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        aria-current={active ? 'page' : undefined}
                        href={item.href}
                        key={item.href}
                        onClick={() => setOpen(false)}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span>{item.label}</span>
                        {active ? <ChevronRight className="ml-auto size-3.5" aria-hidden="true" /> : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
        <div className="admin-sidebar-account">
          <div>
            <strong>{identity.displayName}</strong>
            <span>{adminRoleLabels[identity.role]}</span>
          </div>
          <button
            aria-label="Çıkış yap"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.assign('/admin/login');
            }}
            type="button"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
      {open ? (
        <button
          className="admin-sidebar-backdrop"
          aria-label="Admin menüsünü kapat"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}
    </>
  );
}
