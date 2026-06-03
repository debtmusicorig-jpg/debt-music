
import React, { useState, useEffect } from 'react';
import { SiteSettings } from '@/entities/SiteSettings';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Save, Image } from 'lucide-react';

export default function SiteSettingsComponent() {
  const [settings, setSettings] = useState({
    logo_url: '',
    site_name: 'D.E.B.T-Music',
    tip_jar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [existingSettingsId, setExistingSettingsId] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsList = await SiteSettings.list();
      if (settingsList && settingsList.length > 0) {
        const existingSettings = settingsList[0];
        setSettings({
          logo_url: existingSettings.logo_url || '',
          site_name: existingSettings.site_name || 'D.E.B.T-Music',
          tip_jar_url: existingSettings.tip_jar_url || ''
        });
        setExistingSettingsId(existingSettings.id);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, logo_url: file_url }));
    } catch (error) {
      console.error('Logo upload failed:', error);
      alert('Logo upload failed. Please try again.');
    }
    setUploadingLogo(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (existingSettingsId) {
        await SiteSettings.update(existingSettingsId, settings);
      } else {
        const newSettings = await SiteSettings.create(settings);
        setExistingSettingsId(newSettings.id);
      }
      
      alert('Settings saved successfully!');
      // Reload the page to reflect changes in the header
      window.location.reload();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Image className="w-5 h-5 text-yellow-400" />
          Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site_name" className="text-gray-300">Site Name</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="D.E.B.T-Music"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Logo/Banner</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload-input"
              />
              <Button 
                type="button" 
                variant="outline" 
                className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                onClick={() => document.getElementById('logo-upload-input').click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {settings.logo_url ? 'Replace Logo' : 'Upload Logo'}
              </Button>
              {settings.logo_url && (
                <div className="flex items-center gap-2">
                  <img src={settings.logo_url} alt="Site logo" className="h-24 w-24 object-contain rounded" />
                  <span className="text-green-400 text-sm">✓ Logo uploaded</span>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm">Upload your custom logo/banner. Recommended size: 500x500px or similar ratio.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tip_jar_url" className="text-gray-300">Tip Jar URL</Label>
            <Input
              id="tip_jar_url"
              value={settings.tip_jar_url}
              onChange={(e) => setSettings(prev => ({ ...prev, tip_jar_url: e.target.value }))}
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="https://www.buymeacoffee.com/yourname"
            />
            <p className="text-gray-500 text-sm">Enter the full URL for your tipping page (e.g., PayPal.Me, Buy Me a Coffee).</p>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
