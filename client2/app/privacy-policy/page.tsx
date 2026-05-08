import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Footimes',
  description: 'Understand how Footimes collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-bold mb-8 text-pink-500">Privacy Policy</h1>
      
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500 italic">Last Updated: May 2024</p>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you use our services, including but not limited to your name, email address, and preferences. We also collect automated data through cookies and tracking technologies to improve your experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Provide and maintain our services.</li>
            <li>Personalize your experience (e.g., showing scores for your favorite teams).</li>
            <li>Communicate with you regarding updates and news.</li>
            <li>Monitor and analyze usage trends to improve the app.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal data from unauthorized access, disclosure, or alteration. However, please note that no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Links</h2>
          <p>
            Our services may contain links to other websites. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to read the privacy policies of any external site you visit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact us at privacy@footimes.com.
          </p>
        </section>
      </div>
    </div>
  );
}
