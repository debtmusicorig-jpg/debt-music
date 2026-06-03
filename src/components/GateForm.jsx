import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Subscriber } from '@/entities/Subscriber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock } from 'lucide-react';

export default function GateForm({ onSubscribed }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please enter both your name and email.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await Subscriber.create({ name, email });
      localStorage.setItem('debt-music-subscribed', 'true');
      onSubscribed();
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop')",
          filter: 'blur(8px) brightness(0.4)'
        }}
      ></div>
      
      <div className="relative z-10 text-center text-white max-w-md w-full">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">EXCLUSIVE ACCESS</h2>
        <p className="text-lg text-gray-300 mb-8">Join the mailing list to unlock new releases, tour dates, and behind-the-scenes content.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-black bg-opacity-40 p-8 rounded-lg backdrop-blur-sm border border-gray-700">
          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-900 bg-opacity-70 border-gray-600 text-white h-12"
            required
          />
          <Input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900 bg-opacity-70 border-gray-600 text-white h-12"
            required
          />
          <div className="text-xs text-gray-400 pt-2 pb-2 text-left">
            By subscribing, you agree to our{' '}
            <Link to={createPageUrl('TermsAndConditions')} className="underline hover:text-yellow-400">
              Terms &amp; Conditions
            </Link>
            {' and '}
            <Link to={createPageUrl('PrivacyPolicy')} className="underline hover:text-yellow-400">
              Privacy Policy
            </Link>
            .
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition-colors duration-300"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
                <div className="flex items-center justify-center">
                    <Lock className="w-4 h-4 mr-2" />
                    UNLOCK CONTENT
                </div>
            )}
          </Button>
          {error && <p className="text-red-400 text-sm pt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}