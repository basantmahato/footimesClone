import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Footimes',
  description: 'Read the terms and conditions for using the Footimes platform and services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-bold mb-8 text-pink-500">Terms & Conditions</h1>
      
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500 italic">Effective Date: May 2024</p>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Footimes, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on Footimes' website for personal, non-commercial transitory viewing only. You may not:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Modify or copy the materials.</li>
            <li>Use the materials for any commercial purpose.</li>
            <li>Attempt to decompile or reverse engineer any software contained on Footimes.</li>
            <li>Remove any copyright or other proprietary notations from the materials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
          <p>
            The materials on Footimes' website are provided on an 'as is' basis. Footimes makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
          <p>
            In no event shall Footimes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on Footimes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>
      </div>
    </div>
  );
}
