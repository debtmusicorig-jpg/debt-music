import React, { useState, useEffect } from 'react';
import { DigitalDownload } from '@/entities/DigitalDownload';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Loader2, Save, Edit, Download, Headphones, AlertTriangle } from 'lucide-react';
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export default function DigitalDownloadManager() {
  const [downloads, setDownloads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDownload, setEditingDownload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_art_url: '',
    audio_preview_url: '',
    purchase_url: '',
    min_price: 1.00,
    release_date: ''
  });

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const data = await DigitalDownload.list('-created_date');
      setDownloads(data);
    } catch (error) {
      console.error("Failed to fetch digital downloads:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cover_art_url: '',
      audio_preview_url: '',
      purchase_url: '',
      min_price: 1.00,
      release_date: ''
    });
    setEditingDownload(null);
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e, field, setUploadingState) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const fileType = field === 'cover_art_url' ? 'Image' : 'Audio';
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      
      if (field === 'audio_preview_url') {
        alert(`Audio file is too large (${fileSizeMB}MB). Maximum size is 10MB.\n\nFor audio previews:\n• Use MP3 format (recommended)\n• Keep previews short (30-60 seconds)\n• Convert WAV to MP3 to reduce file size\n• Or host externally and use streaming links`);
      } else {
        alert(`${fileType} file is too large (${fileSizeMB}MB). Maximum size is 10MB. Please compress or resize the file.`);
      }
      
      e.target.value = '';
      return;
    }
    
    setUploadingState(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange(field, file_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try a smaller file or different format.');
    }
    setUploadingState(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submitData = { ...formData, min_price: parseFloat(formData.min_price) };

      if (editingDownload) {
        await DigitalDownload.update(editingDownload.id, submitData);
        alert('Download updated successfully!');
      } else {
        await DigitalDownload.create(submitData);
        alert('Download created successfully!');
      }
      
      resetForm();
      loadDownloads();
    } catch (error) {
      console.error('Failed to save download:', error);
      alert('Failed to save download. Please try again.');
    }
    setIsLoading(false);
  };

  const handleEdit = (download) => {
    setFormData({
      title: download.title || '',
      description: download.description || '',
      cover_art_url: download.cover_art_url || '',
      audio_preview_url: download.audio_preview_url || '',
      purchase_url: download.purchase_url || '',
      min_price: download.min_price || 1.00,
      release_date: download.release_date || ''
    });
    setEditingDownload(download);
    setShowForm(true);
  };

  const handleDelete = async (download) => {
    try {
      await DigitalDownload.delete(download.id);
      loadDownloads();
      alert('Download deleted successfully!');
    } catch (error) {
      console.error('Failed to delete download:', error);
      alert('Failed to delete download.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Digital Downloads</h3>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" />
          Add Download
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-white">{editingDownload ? 'Edit Download' : 'New Download'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File size warning banner */}
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <strong>Audio Preview Tips:</strong> Files must be under 10MB. Use MP3 format and keep previews short (30-60 seconds). For full tracks, link to your Bandcamp or external hosting via the Purchase URL.
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="text-gray-300">Track Title</Label>
                <Input 
                  id="title" 
                  placeholder="Track Title" 
                  value={formData.title} 
                  onChange={(e) => handleInputChange('title', e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500" 
                  required 
                />
              </div>
              
              <DateDropdownPicker 
                value={formData.release_date} 
                onChange={(date) => handleInputChange('release_date', date)} 
              />
              
              <div>
                <Label htmlFor="description" className="text-gray-300">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Description (optional)" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Cover Art</Label>
                  <Button type="button" variant="outline" className="w-full bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={() => document.getElementById('cover-art-upload').click()} disabled={uploadingCover}>
                    {uploadingCover ? <Loader2 className="animate-spin" /> : <Upload />} {formData.cover_art_url ? 'Replace' : 'Upload'}
                  </Button>
                  <input id="cover-art-upload" type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'cover_art_url', setUploadingCover)} />
                  {formData.cover_art_url && <img src={formData.cover_art_url} alt="preview" className="mt-2 w-16 h-16 rounded"/>}
                </div>
                <div>
                  <Label className="text-gray-300">Audio Preview (optional - Max 10MB)</Label>
                  <Button type="button" variant="outline" className="w-full bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={() => document.getElementById('audio-upload').click()} disabled={uploadingAudio}>
                    {uploadingAudio ? <Loader2 className="animate-spin" /> : <Headphones />} {formData.audio_preview_url ? 'Replace' : 'Upload'}
                  </Button>
                  <input id="audio-upload" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" className="hidden" onChange={e => handleFileUpload(e, 'audio_preview_url', setUploadingAudio)} />
                  {formData.audio_preview_url && <audio src={formData.audio_preview_url} controls className="mt-2 w-full"/>}
                  <p className="text-xs text-gray-500 mt-1">Use MP3. Keep short for faster loading.</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="purchase_url" className="text-gray-300">External Purchase URL (Bandcamp, etc.)</Label>
                <Input 
                  id="purchase_url" 
                  placeholder="External Purchase URL (Bandcamp, etc.)" 
                  value={formData.purchase_url} 
                  onChange={(e) => handleInputChange('purchase_url', e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="min_price" className="text-gray-300">Minimum Price (£)</Label>
                <Input 
                  id="min_price" 
                  type="number" 
                  min="1.00" 
                  step="0.01" 
                  value={formData.min_price} 
                  onChange={(e) => handleInputChange('min_price', e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500" 
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="bg-yellow-400 text-black hover:bg-yellow-500">
                  <Save className="w-4 h-4 mr-2" />
                  {editingDownload ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Download />Current Downloads ({downloads.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {downloads.map((dl) => (
              <div key={dl.id} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg">
                <img src={dl.cover_art_url} alt={dl.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{dl.title}</h3>
                  <p className="text-gray-400 text-sm">£{dl.min_price.toFixed(2)}+ • Released: {format(new Date(`${dl.release_date}T00:00:00`), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(dl)} className="text-blue-400 hover:text-blue-300"><Edit className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-700">
                      <AlertDialogHeader><AlertDialogTitle className="text-white">Delete Download</AlertDialogTitle><AlertDialogDescription className="text-gray-400">Delete "{dl.title}"?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-neutral-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(dl)} className="bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}