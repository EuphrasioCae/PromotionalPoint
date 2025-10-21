import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileQuestion, Users, BarChart3, FileDown, ClipboardList } from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const adminNavItems: NavItem[] = [
  { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/questions', icon: <FileQuestion className="w-5 h-5" />, label: 'Questions' },
  { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
  { to: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
  { to: '/admin/reports', icon: <FileDown className="w-5 h-5" />, label: 'Reports' },
];

const userNavItems: NavItem[] = [
  { to: '/user', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/user/evaluations', icon: <ClipboardList className="w-5 h-5" />, label: 'Evaluations' },
];

interface NavigationProps {
  isAdmin: boolean;
}

export default function Navigation({ isAdmin }: NavigationProps) {
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
