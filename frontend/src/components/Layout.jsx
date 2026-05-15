import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">Foodey</h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link 
                to="/menu" 
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Menu
              </Link>
              
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
              
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <CogIcon className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              </Link>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/cart" 
                className="text-gray-700 hover:text-orange-600 p-2 rounded-md transition-colors"
              >
                <ShoppingCartIcon className="h-6 w-6" />
              </Link>
              
              <Link 
                to="/login" 
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Foodey Restaurant</h3>
              <p className="text-gray-300 text-sm">
                Your favorite restaurant management system with modern technology.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-orange-400">Home</Link></li>
                <li><Link to="/menu" className="hover:text-orange-400">Menu</Link></li>
                <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
                <li><Link to="/admin" className="hover:text-orange-400">Admin</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📍 123 Restaurant Street</li>
                <li>📞 (555) 123-4567</li>
                <li>✉️ info@foodey.com</li>
                <li>🕐 Mon-Sun: 11AM-10PM</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Foodey Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
