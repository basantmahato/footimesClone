'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('https://api.footimes.com/api/leads', formData);
      setIsSuccess(true);
      toast.success("Message sent successfully!");
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-bold mb-8 text-pink-500">Contact Us</h1>
      <p className="text-gray-400 mb-12 max-w-2xl text-lg">
        Have questions about a match score, feedback on our news coverage, or interest in a partnership? We're here to help.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="bg-pink-600/20 p-4 rounded-2xl text-pink-500">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1">Email Us</h3>
              <p className="text-gray-400">support@footimes.com</p>
              <p className="text-gray-400">info@footimes.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-pink-600/20 p-4 rounded-2xl text-pink-500">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1">Our Location</h3>
              <p className="text-gray-400">Ranchi, Jharkhand</p>
              <p className="text-gray-400">India</p>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h4 className="font-bold text-lg mb-2">Follow Our Updates</h4>
            <p className="text-sm text-gray-500 mb-6">Stay connected for the latest live scores and football alerts.</p>
            <div className="flex gap-6">
              <span className="text-pink-500 hover:text-white transition-all cursor-pointer font-medium">Instagram</span>
              <span className="text-pink-500 hover:text-white transition-all cursor-pointer font-medium">YouTube</span>
              <span className="text-pink-500 hover:text-white transition-all cursor-pointer font-medium">Twitter</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#1f1f1f] p-8 rounded-4xl border border-white/5 shadow-2xl relative overflow-hidden">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10 animate-in fade-in zoom-in duration-500">
              <div className="bg-green-500/20 p-6 rounded-full text-green-500">
                <CheckCircle2 size={64} />
              </div>
              <h3 className="text-2xl font-bold text-white">Thank You!</h3>
              <p className="text-gray-400 max-w-[250px]">Your message has been sent. We'll get back to you shortly.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-6 text-pink-500 font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold mb-8">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-pink-500 transition-all focus:ring-1 focus:ring-pink-500/50" 
                    placeholder="Enter your name" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-pink-500 transition-all focus:ring-1 focus:ring-pink-500/50" 
                    placeholder="Enter your email" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Message</label>
                  <textarea 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-pink-500 transition-all focus:ring-1 focus:ring-pink-500/50 resize-none" 
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-pink-600/20 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
