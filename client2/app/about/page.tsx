import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Footimes',
  description: 'Learn more about Footimes, your ultimate destination for football live scores, fixtures, and news.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-bold mb-8 text-pink-500">About Footimes</h1>
      
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
          <p>
            Footimes was born out of a passion for the beautiful game. Our mission is to provide football fans around the world with the fastest, most accurate, and most engaging platform for live scores, match fixtures, and tournament updates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">What We Offer</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="text-pink-500 font-bold">Real-time Scores</span>: Never miss a goal with our lightning-fast live score updates.</li>
            <li><span className="text-pink-500 font-bold">Comprehensive Fixtures</span>: Keep track of upcoming matches in all major tournaments.</li>
            <li><span className="text-pink-500 font-bold">Exclusive News</span>: Stay informed with the latest news and insights from the world of football.</li>
            <li><span className="text-pink-500 font-bold">Interactive Standings</span>: Track your favorite team's progress with our dynamic points tables.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Our Vision</h2>
          <p>
            We strive to be the go-to companion for every football fan, whether you're following a local tournament or a global championship. We are constantly innovating to bring you a premium, seamless digital experience that captures the excitement of the pitch.
          </p>
        </section>

        <section className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <p className="italic text-gray-400">
            "Football is more than just a game; it's a heartbeat shared by millions. At Footimes, we make sure you stay in rhythm with the sport you love."
          </p>
        </section>
      </div>
    </div>
  );
}
