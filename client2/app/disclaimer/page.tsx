import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | Footimes',
  description: 'Important legal disclaimer regarding the accuracy and usage of information on Footimes.',
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-bold mb-8 text-pink-500">Legal Disclaimer</h1>
      
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">No Warranties</h2>
          <p>
            All the information on this website — https://footimes.com — is published in good faith and for general information purpose only. Footimes does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">External Links</h2>
          <p>
            From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Content Accuracy</h2>
          <p>
            Football match data, scores, and news are provided by third-party APIs. While we make every effort to ensure the data is up-to-date and correct, there may be delays or inaccuracies. Footimes is not liable for any losses or damages caused by reliance on the match data provided.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Consent</h2>
          <p>
            By using our website, you hereby consent to our disclaimer and agree to its terms.
          </p>
        </section>
      </div>
    </div>
  );
}
