import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ShoppingCartIcon,
  CogIcon,
  HomeIcon,
  MenuIcon,
  ClipboardListIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:5000/api/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.orders?.today || 0,
      change: '+12%',
      icon: ShoppingCartIcon,
      colorClass: 'text-blue-600'
    },
    {
      title: 'Revenue Today',
      value: `$${stats.revenue?.today || 0}`,
      change: '+8%',
      icon: ChartBarIcon,
      colorClass: 'text-green-600'
    },
    {
      title: 'Menu Items',
      value: stats.menu?.totalItems || 0,
      change: '+2',
      icon: MenuIcon,
      colorClass: 'text-orange-600'
    },
    {
      title: 'Active Staff',
      value: stats.staff?.activeToday || 0,
      change: '+5%',
      icon: UserGroupIcon,
      colorClass: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Menu',
      description: 'Add, edit, or remove menu items',
      icon: MenuIcon,
      link: '/admin/menu'
    },
    {
      title: 'View Orders',
      description: 'See all customer orders',
      icon: ClipboardListIcon,
      link: '/admin/orders'
    },
    {
      title: 'Staff Management',
      description: 'Manage staff and schedules',
      icon: UserGroupIcon,
      link: '/admin/staff'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: CogIcon,
      link: '/admin/settings'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span className="ml-2">View Site</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white overflow-hidden rounded-lg shadow">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <stat.icon className={`h-6 w-6 ${stat.colorClass}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => (
                  <div key={index} className="relative block p-3 border border-gray-200 rounded-lg">
                    <Link
                      to={action.link}
                      className="flex items-center space-x-3 text-gray-700 hover:text-orange-600"
                    >
                      <action.icon className="h-6 w-6" />
                      <div className="text-sm font-medium">{action.title}</div>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
