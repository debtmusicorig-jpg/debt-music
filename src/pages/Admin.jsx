import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import ReleaseForm from '../components/admin/ReleaseForm';
import SubscribersList from '../components/admin/SubscribersList';
import ReleasesList from '../components/admin/ReleasesList';
import ContactMessages from '../components/admin/ContactMessages';
import SiteSettingsComponent from '../components/admin/SiteSettings';
import BioManager from '../components/admin/BioManager';
import PhysicalReleaseManager from '../components/admin/PhysicalReleaseManager';
import CoverSongManager from '../components/admin/CoverSongManager';
import DigitalDownloadManager from '../components/admin/DigitalDownloadManager';
import XmasSongManager from '../components/admin/XmasSongManager';
// Keep Card imports if they are used elsewhere, though not in outline directly for new features
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Users, Plus, ShieldX, Loader2, Mail, Settings, BookUser, Disc3, Guitar, Download, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'allowed', 'denied'
  const [activeTab, setActiveTab] = useState('releases');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (user && user.role === 'admin') {
          setAuthStatus('allowed');
        } else {
          setAuthStatus('denied');
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthStatus('denied');
      }
    };
    checkAuth();
  }, []);

  // New generic success handler
  const handleSuccess = (entity) => {
    toast({
      title: "Success",
      description: `${entity} saved successfully.`,
    });
  };

  if (authStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
        <p className="mt-4 text-lg">Verifying access...</p>
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-white text-center p-4">
        <ShieldX className="w-20 h-20 text-red-500" />
        <h1 className="mt-6 text-3xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-400">You do not have permission to view this page.</p>
        <Button onClick={() => navigate(createPageUrl("Home"))} className="mt-6 bg-yellow-400 text-black hover:bg-yellow-500">
          Return to Site
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your music, subscribers, messages, and site settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Updated grid-cols for responsiveness and new tab */}
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-10 bg-neutral-800 border-neutral-700">
            <TabsTrigger value="releases" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Music className="w-4 h-4 mr-2" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="covers" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Guitar className="w-4 h-4 mr-2" />
              Covers
            </TabsTrigger>
            <TabsTrigger value="physical" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Disc3 className="w-4 h-4 mr-2" />
              Vinyl & CD
            </TabsTrigger>
            <TabsTrigger value="downloads" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Download className="w-4 h-4 mr-2" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="xmas" className="text-white data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <TreePine className="w-4 h-4 mr-2" />
              Xmas
            </TabsTrigger>
            <TabsTrigger value="bio" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <BookUser className="w-4 h-4 mr-2" />
              Bio
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Mail className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="add-release" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases" className="space-y-4">
            {/* ReleasesList now manages its own data and takes onEditSuccess prop */}
            <ReleasesList onEditSuccess={() => handleSuccess('Release')} />
          </TabsContent>

          <TabsContent value="add-release">
            {/* Using the new handleSuccess and changing tab back to releases on success */}
            <ReleaseForm onSuccess={() => { handleSuccess('Release'); setActiveTab('releases'); }} />
          </TabsContent>

          <TabsContent value="covers">
            <CoverSongManager />
          </TabsContent>

          <TabsContent value="physical">
            <PhysicalReleaseManager />
          </TabsContent>

          <TabsContent value="downloads">
            <DigitalDownloadManager />
          </TabsContent>

          <TabsContent value="xmas">
            <XmasSongManager />
          </TabsContent>

          <TabsContent value="bio">
            <BioManager />
          </TabsContent>

          <TabsContent value="subscribers">
            <SubscribersList />
          </TabsContent>

          <TabsContent value="messages">
            <ContactMessages />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsComponent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}