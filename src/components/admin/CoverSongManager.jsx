import React, { useState, useEffect } from 'react';
import { CoverSong } from '@/entities/CoverSong';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Loader2, Save, Edit, Guitar, GripVertical, AlertTriangle } from 'lucide-react';
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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DateDropdownPicker from '../shared/DateDropdownPicker';

const PLATFORMS = ["Spotify", "Apple Music", "YouTube", "SoundCloud", "Bandcamp", "Amazon Music"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export default function CoverSongManager() {
  const [coverSongs, setCoverSongs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    original_artist: '',
    cover_art_url: '',
    audio_url: '',
    streaming_links: [],
    release_date: '',
    description: ''
  });

  useEffect(() => {
    loadCoverSongs();
  }, []);

  const loadCoverSongs = async () => {
    try {
      const data = await CoverSong.list('-release_date');
      setCoverSongs(data);
    } catch (error) {
      console.error("Failed to fetch cover songs:", error);
      alert('Failed to load cover songs. You might not have permission.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      original_artist: '',
      cover_art_url: '',
      audio_url: '',
      streaming_links: [],
      release_date: '',
      description: ''
    });
    setEditingSong(null);
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStreamingLink = () => {
    setFormData(prev => ({
      ...prev,
      streaming_links: [...(prev.streaming_links || []), { platform: '', url: '' }]
    }));
  };

  const updateStreamingLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      streaming_links: prev.streaming_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeStreamingLink = (index) => {
    setFormData(prev => ({
      ...prev,
      streaming_links: prev.streaming_links.filter((_, i) => i !== index)
    }));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.streaming_links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      streaming_links: items
    }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`Cover art file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB. Please compress or resize the image.`);
      e.target.value = '';
      return;
    }

    setUploadingCover(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('cover_art_url', file_url);
    } catch (error) {
      console.error('Cover art upload failed:', error);
      alert('Cover art upload failed. Please try a smaller file or different format.');
    }
    setUploadingCover(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`Audio file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.\n\nFor audio files:\n• Use MP3 format (recommended)\n• Convert WAV to MP3 to reduce file size\n• Or link to externally hosted audio instead`);
      e.target.value = '';
      return;
    }

    setUploadingAudio(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('audio_url', file_url);
    } catch (error) {
      console.error('Audio upload failed:', error);
      alert('Audio upload failed. Please use a smaller file (under 10MB) or link to externally hosted audio instead.');
    }
    setUploadingAudio(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = { ...formData };

    if (!dataToSend.release_date) {
        alert('Please select a release date.');
        return;
    }

    setIsLoading(true);

    try {
      if (editingSong) {
        await CoverSong.update(editingSong.id, dataToSend);
        alert('Cover song updated successfully!');
      } else {
        await CoverSong.create(dataToSend);
        alert('Cover song created successfully!');
      }

      resetForm();
      loadCoverSongs();
    } catch (error) {
      console.error('Failed to save cover song:', error);
      alert('Failed to save cover song. You might not have permission.');
    }
    setIsLoading(false);
  };

  const handleEdit = (song) => {
    setFormData({
      title: song.title || '',
      original_artist: song.original_artist || '',
      cover_art_url: song.cover_art_url || '',
      audio_url: song.audio_url || '',
      streaming_links: song.streaming_links || [],
      release_date: song.release_date || '',
      description: song.description || ''
    });
    setEditingSong(song);
    setShowForm(true);
  };

  const handleDelete = async (song) => {
    try {
      await CoverSong.delete(song.id);
      loadCoverSongs();
      alert('Cover song deleted successfully!');
    } catch (error) {
      console.error('Failed to delete cover song:', error);
      alert('Failed to delete cover song. You might not have permission.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Cover Songs</h3>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" /> Add Cover Song
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-white">{editingSong ? 'Edit Cover Song' : 'Add New Cover Song'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File size warning banner */}
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <strong>Audio Upload Tips:</strong> Files must be under 10MB. For WAV files, please convert to MP3 first. Alternatively, you can upload audio to SoundCloud, Bandcamp, or your hosting service and link to it via streaming links.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="title" className="text-gray-300">Song Title</Label><Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" required/></div>
                <div><Label htmlFor="original_artist" className="text-gray-300">Original Artist</Label><Input id="original_artist" value={formData.original_artist} onChange={(e) => handleInputChange('original_artist', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" required/></div>
              </div>

              <div><Label htmlFor="release_date" className="text-gray-300">Release Date</Label><DateDropdownPicker value={formData.release_date} onChange={(date) => handleInputChange('release_date', date)}/></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Cover Art</Label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" id="cover-upload-coversong"/>
                    <Button type="button" variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={() => document.getElementById('cover-upload-coversong').click()} disabled={uploadingCover}>
                      {uploadingCover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {formData.cover_art_url ? 'Replace' : 'Upload'}
                    </Button>
                    {formData.cover_art_url && <img src={formData.cover_art_url} alt="Cover" className="w-12 h-12 object-cover rounded" />}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Audio File (Optional - Max 10MB)</Label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" onChange={handleAudioUpload} className="hidden" id="audio-upload-coversong"/>
                    <Button type="button" variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={() => document.getElementById('audio-upload-coversong').click()} disabled={uploadingAudio}>
                      {uploadingAudio ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {formData.audio_url ? 'Replace' : 'Upload'}
                    </Button>
                    {formData.audio_url && <span className="text-green-400 text-sm">✓ Audio uploaded</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Prefer MP3 format. WAV files are usually too large.</p>
                </div>
              </div>

              {/* Streaming Links */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Streaming Links</Label>
                  <Button type="button" onClick={addStreamingLink} variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="streaming-links">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {formData.streaming_links?.map((link, index) => (
                          <Draggable key={`link-${index}`} draggableId={`link-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex gap-2 items-center bg-neutral-800/50 p-2 rounded-lg"
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-white p-1">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <Select
                                  value={link.platform}
                                  onValueChange={(value) => updateStreamingLink(index, 'platform', value)}
                                >
                                  <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700 text-white">
                                    <SelectValue placeholder="Platform" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                    {PLATFORMS.map(platform => (
                                      <SelectItem key={platform} value={platform} className="text-white hover:bg-neutral-700">{platform}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="URL"
                                  value={link.url}
                                  onChange={(e) => updateStreamingLink(index, 'url', e.target.value)}
                                  className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeStreamingLink(index)}
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              <div><Label htmlFor="description" className="text-gray-300">Description (Optional)</Label><Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white h-24"/></div>

              <div className="flex gap-3"><Button type="submit" disabled={isLoading || !formData.title || !formData.original_artist || !formData.cover_art_url} className="bg-yellow-400 text-black font-bold hover:bg-yellow-500">{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{editingSong ? 'Update Song' : 'Create Song'}</Button><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Guitar className="w-5 h-5 text-yellow-400" />Current Covers ({coverSongs.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverSongs.map((song) => (
              <div key={song.id} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg">
                <img src={song.cover_art_url} alt={song.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{song.title}</h3>
                  <p className="text-gray-400 text-sm">by {song.original_artist}</p>
                  <p className="text-gray-500 text-xs">
                    Released: {song.release_date ? format(new Date(`${song.release_date}T00:00:00`), 'MMM d, yyyy') : 'N/A'}
                  </p>
                  {song.streaming_links?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {song.streaming_links.map((link, index) => (
                        <span key={index} className="text-xs bg-neutral-700 text-gray-300 px-2 py-1 rounded">
                          {link.platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(song)} className="text-blue-400 hover:text-blue-300"><Edit className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-700">
                      <AlertDialogHeader><AlertDialogTitle className="text-white">Delete Cover Song</AlertDialogTitle><AlertDialogDescription className="text-gray-400">Are you sure you want to delete "{song.title}"? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(song)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {coverSongs.length === 0 && <div className="text-center text-gray-400 py-8">No cover songs yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}