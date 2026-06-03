import React, { useState, useEffect } from 'react';
import { Subscriber } from '@/entities/Subscriber';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, X, Loader2 } from 'lucide-react';

export default function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has already subscribed
    const hasSubscribed = localStorage.getItem('debt-music-subscribed') === 'true';
    
    if (hasSubscribed) {
      return; // Don't show popup if already subscribed
    }

    // Track page views
    const pageViewCount = parseInt(localStorage.getItem('debt-music-page-views') || '0', 10);
    const newPageViewCount = pageViewCount + 1;
    localStorage.setItem('debt-music-page-views', newPageViewCount.toString());

    // Get last dismiss time
    const lastDismissTime = parseInt(localStorage.getItem('debt-music-popup-dismissed-time') || '0', 10);
    const currentTime = Date.now();
    const timeSinceLastDismiss = currentTime - lastDismissTime;

    // Show popup after 10 seconds on first visit, or after 2 page views if dismissed before
    const shouldShowOnFirstVisit = newPageViewCount === 1;
    const shouldShowAfterPageViews = newPageViewCount >= 2 && timeSinceLastDismiss > 0;

    if (shouldShowOnFirstVisit || shouldShowAfterPageViews) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Reset page view counter after showing popup
        localStorage.setItem('debt-music-page-views', '0');
      }, 10000); // 10 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('debt-music-popup-dismissed-time', Date.now().toString());
    localStorage.setItem('debt-music-page-views', '0'); // Reset counter
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await Subscriber.create({ name, email });
      localStorage.setItem('debt-music-subscribed', 'true');
      localStorage.removeItem('debt-music-popup-dismissed-time');
      localStorage.setItem('debt-music-page-views', '0');
      alert('Thank you for subscribing! You\'ll receive updates about new releases and exclusive content.');
      setIsOpen(false);
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription failed. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="bg-black border-2 border-yellow-400 max-w-md">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-white" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-400 rounded-full p-3">
              <Mail className="w-8 h-8 text-black" />
            </div>
          </div>
          <DialogTitle className="text-white text-2xl text-center">Stay Connected</DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            Get exclusive updates about new releases, unreleased tracks, and special content from D.E.B.T-Music.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="popup-name" className="text-gray-300">Name</Label>
            <Input
              id="popup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-neutral-900 border-neutral-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="popup-email" className="text-gray-300">Email</Label>
            <Input
              id="popup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-neutral-900 border-neutral-700 text-white"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-500 h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe for Free'
            )}
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-300 mt-2"
          >
            Maybe later
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}