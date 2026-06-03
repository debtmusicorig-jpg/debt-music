
import React, { useState, useEffect } from 'react';
import { PhysicalRelease } from '@/entities/PhysicalRelease';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Loader2, Save, Edit, Disc3 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DateDropdownPicker from '../shared/DateDropdownPicker';

export default function PhysicalReleaseManager() {
  const [physicalReleases, setPhysicalReleases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingRear, setUploadingRear] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    release_type: 'Album',
    format: 'Vinyl',
    cover_art_url: '',
    rear_cover_url: '',
    description: '',
    purchase_platform: 'Bandcamp',
    purchase_url: '',
    physical_release_date: '',
    streaming_release_date: ''
  });

  useEffect(() => {
    loadPhysicalReleases();
  }, []);

  const loadPhysicalReleases = async () => {
    try {
      const data = await PhysicalRelease.list('-created_date');
      setPhysicalReleases(data);
    } catch (error) {
      console.error("Failed to fetch physical releases:", error);
      // In a real app, you might want to show an error message to the user
      // or handle unauthorized access if the backend returns a specific error code.
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      release_type: 'Album',
      format: 'Vinyl',
      cover_art_url: '',
      rear_cover_url: '',
      description: '',
      purchase_platform: 'Bandcamp',
      purchase_url: '',
      physical_release_date: '',
      streaming_release_date: ''
    });
    setEditingRelease(null);
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingCover(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('cover_art_url', file_url);
    } catch (error) {
      console.error('Cover upload failed:', error);
      alert('Cover upload failed. Please try again.');
    }
    setUploadingCover(false);
  };

  const handleRearCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingRear(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('rear_cover_url', file_url);
    } catch (error) {
      console.error('Rear cover upload failed:', error);
      alert('Rear cover upload failed. Please try again.');
    }
    setUploadingRear(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.physical_release_date) {
        alert('Please select a valid Physical Media Release Date.');
        return;
    }

    setIsLoading(true);
    
    try {
      const submitData = { ...formData };

      if (editingRelease) {
        await PhysicalRelease.update(editingRelease.id, submitData);
        alert('Physical release updated successfully!');
      } else {
        await PhysicalRelease.create(submitData);
        alert('Physical release created successfully!');
      }
      
      resetForm();
      loadPhysicalReleases();
    } catch (error) {
      console.error('Failed to save physical release:', error);
      alert('Failed to save physical release. Please try again.');
    }
    setIsLoading(false);
  };

  const handleEdit = (release) => {
    const editData = {
      title: release.title || '',
      release_type: release.release_type || 'Album',
      format: release.format || 'Vinyl',
      cover_art_url: release.cover_art_url || '',
      rear_cover_url: release.rear_cover_url || '',
      description: release.description || '',
      purchase_platform: release.purchase_platform || 'Bandcamp',
      purchase_url: release.purchase_url || '',
      physical_release_date: release.physical_release_date || '',
      streaming_release_date: release.streaming_release_date || ''
    };
    
    setFormData(editData);
    setEditingRelease(release);
    setShowForm(true);
  };

  const handleDelete = async (release) => {
    try {
      await PhysicalRelease.delete(release.id);
      loadPhysicalReleases();
      alert('Physical release deleted successfully!');
    } catch (error) {
      console.error('Failed to delete physical release:', error);
      alert('Failed to delete physical release.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Physical Releases</h3>
        <Button 
          onClick={() => { 
            resetForm();
            setShowForm(true); 
          }}
          className="bg-yellow-400 text-black hover:bg-yellow-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Physical Release
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">
              {editingRelease ? 'Edit Physical Release' : 'Add New Physical Release'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="release_type" className="text-gray-300">Release Type</Label>
                  <Select value={formData.release_type} onValueChange={(value) => handleInputChange('release_type', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectItem value="Album">Album</SelectItem>
                      <SelectItem value="EP">EP</SelectItem>
                      <SelectItem value="Single">Single</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="format" className="text-gray-300">Media Type</Label>
                <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="Vinyl">Vinyl</SelectItem>
                    <SelectItem value="CD">CD</SelectItem>
                    <SelectItem value="Digital Download">Digital Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="physical_release_date" className="text-gray-300">Physical Media Release Date</Label>
                    <DateDropdownPicker 
                      value={formData.physical_release_date}
                      onChange={(date) => handleInputChange('physical_release_date', date)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="streaming_release_date" className="text-gray-300">Streaming Release Date (Optional)</Label>
                    <DateDropdownPicker 
                      value={formData.streaming_release_date}
                      onChange={(date) => handleInputChange('streaming_release_date', date)}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Front Cover Art</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      id="cover-upload-physical"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                      onClick={() => document.getElementById('cover-upload-physical').click()}
                      disabled={uploadingCover}
                    >
                      {uploadingCover ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {formData.cover_art_url ? 'Replace Cover' : 'Upload Cover'}
                    </Button>
                    {formData.cover_art_url && (
                      <img src={formData.cover_art_url} alt="Cover preview" className="w-12 h-12 object-cover rounded" />
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Rear Cover / Tracklist (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRearCoverUpload}
                      className="hidden"
                      id="rear-cover-upload-physical"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                      onClick={() => document.getElementById('rear-cover-upload-physical').click()}
                      disabled={uploadingRear}
                    >
                      {uploadingRear ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {formData.rear_cover_url ? 'Replace Rear' : 'Upload Rear'}
                    </Button>
                    {formData.rear_cover_url && (
                      <img src={formData.rear_cover_url} alt="Rear cover preview" className="w-12 h-12 object-cover rounded" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white h-24"
                  placeholder="Describe this physical release..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_platform" className="text-gray-300">Purchase Platform</Label>
                  <Select value={formData.purchase_platform} onValueChange={(value) => handleInputChange('purchase_platform', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectItem value="Even">Even</SelectItem>
                      <SelectItem value="Elastic Stage">Elastic Stage</SelectItem>
                      <SelectItem value="Bandcamp">Bandcamp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="purchase_url" className="text-gray-300">Purchase URL</Label>
                  <Input
                    id="purchase_url"
                    type="url"
                    value={formData.purchase_url}
                    onChange={(e) => handleInputChange('purchase_url', e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    placeholder="https://store.example.com/product"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.title || !formData.cover_art_url || !formData.purchase_platform || !formData.purchase_url}
                  className="bg-yellow-400 text-black font-bold hover:bg-yellow-500"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingRelease ? 'Update Release' : 'Create Release'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-yellow-400" />
            Current Releases ({physicalReleases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {physicalReleases.map((release) => (
              <div key={release.id} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg">
                <img src={release.cover_art_url} alt={release.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{release.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {release.release_type} • {release.format} • Platform: {release.purchase_platform}
                  </p>
                  {release.physical_release_date && (
                    <p className="text-gray-500 text-xs">
                      Physical: {format(new Date(`${release.physical_release_date}T00:00:00`), 'MMM d, yyyy')}
                    </p>
                  )}
                  {release.streaming_release_date && (
                    <p className="text-gray-500 text-xs">
                      Streaming: {format(new Date(`${release.streaming_release_date}T00:00:00`), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(release)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Physical Release</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete "{release.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(release)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {physicalReleases.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No physical releases yet. Add your first vinyl or CD!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
