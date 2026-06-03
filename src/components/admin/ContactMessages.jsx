
import React, { useState, useEffect } from 'react';
import { ContactMessage } from '@/entities/ContactMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, Clock, User as UserIcon, Loader2 } from 'lucide-react';

const subjectColors = {
  'Privacy': 'bg-red-100 text-red-800 border-red-200',
  'Releases': 'bg-blue-100 text-blue-800 border-blue-200',
  'General Info': 'bg-green-100 text-green-800 border-green-200',
  'Sync Placements': 'bg-purple-100 text-purple-800 border-purple-200'
};

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Manages loading state for message fetching

  // Function to fetch messages
  const fetchMessages = async () => {
    setIsLoading(true); // Set isLoading to true at the start of fetch
    try {
      const data = await ContactMessage.list('-created_date');
      setMessages(data);
    } catch(error) {
        console.error("Failed to fetch messages:", error);
        // Optionally handle error display to user, e.g., if backend denies access
        // For this refactor, we assume backend security rules will prevent the fetch
        // and an appropriate error will be caught, which can be logged.
    } finally {
        setIsLoading(false); // Always set isLoading to false after fetch attempt
    }
  };

  // Effect for initial data fetch
  useEffect(() => {
    fetchMessages();
  }, []); // Run once on component mount

  // Conditional rendering for loading state
  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading messages...
        </CardContent>
      </Card>
    );
  }

  // Render messages if authentication is allowed and not loading
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-yellow-400" />
          Contact Messages ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-black" /> {/* Using UserIcon to avoid conflict with User entity */}
                  </div>
                  <div>
                    <p className="text-white font-medium">{message.name}</p>
                    <p className="text-gray-400 text-sm">{message.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${subjectColors[message.subject]} border`}>
                    {message.subject}
                  </Badge>
                  <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {format(new Date(message.created_date), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="bg-neutral-700 rounded-lg p-3">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No messages yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
