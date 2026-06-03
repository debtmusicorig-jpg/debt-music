
import React, { useState, useEffect } from 'react';
import { Subscriber } from '@/entities/Subscriber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Users, Mail, Loader2 } from 'lucide-react';

export default function SubscribersList() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const data = await Subscriber.list('-created_date');
      setSubscribers(data);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      // Backend security rules should prevent unauthorized access here.
      // If access is denied, the error will be caught, and subscribers will remain an empty array.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []); // Run only once on component mount

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading subscribers...
        </CardContent>
      </Card>
    );
  }

  // If not isLoading (subscribers are loaded or attempted to load)
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-400" />
          Subscribers ({subscribers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {subscribers.map((subscriber) => (
            <div key={subscriber.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-white font-medium">{subscriber.name}</p>
                  <p className="text-gray-400 text-sm">{subscriber.email}</p>
                </div>
              </div>
              <div className="text-gray-500 text-sm">
                {format(new Date(subscriber.created_date), 'MMM d, yyyy')}
              </div>
            </div>
          ))}
          {subscribers.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No subscribers yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
