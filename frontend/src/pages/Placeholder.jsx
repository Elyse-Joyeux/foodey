import React from 'react';
import Layout from '../components/Layout';

const Placeholder = ({ title, description }) => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-20">
        <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-3xl shadow-sm p-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 mb-8">{description}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 transition"
          >
            Return Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Placeholder;
