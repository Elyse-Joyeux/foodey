import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Are you willing to have your own restaurant?
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-100">
                Don't Wait
              </p>
              <div className="space-y-4">
                <Link
                  to="/register"
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors inline-block"
                >
                  Start today
                </Link>
                <div className="flex items-center justify-center space-x-4 text-orange-100">
                  <button className="flex items-center space-x-2 hover:text-white transition-colors">
                    <PlayIcon className="h-5 w-5" />
                    <span>Take a tour</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-white transition-colors">
                    <PlayIcon className="h-5 w-5" />
                    <span>Watch video</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Foodey?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Complete restaurant management solution with modern technology and beautiful design
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Easy Management
                </h3>
                <p className="text-gray-600">
                  Intuitive dashboard for managing menu, inventory, staff, and orders
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <StarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Beautiful UI/UX
                </h3>
                <p className="text-gray-600">
                  Modern, responsive design that works on all devices
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600">
                  Track sales, inventory, and performance with detailed reports
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <StarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600">
                  Enterprise-grade security with reliable performance
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Mobile Ready
                </h3>
                <p className="text-gray-600">
                  Full mobile support for tablets and smartphones
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <StarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  24/7 Support
                </h3>
                <p className="text-gray-600">
                  Round-the-clock technical support and maintenance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of restaurants already using Foodey to streamline their operations
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors inline-block"
              >
                Start Free Trial
              </Link>
              <Link
                to="/demo"
                className="border border-orange-600 text-orange-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors inline-block ml-4"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
