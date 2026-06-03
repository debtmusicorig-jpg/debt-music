import React, { useState, useEffect } from 'react';
import { XmasSong } from '@/entities/XmasSong';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Loader2, Save, Edit, TreePine, GripVertical, AlertTriangle } from 'lucide-react';
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function XmasSongManager() {
  const [xmasSongs, setXmasSongs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    original_artist: '',
    release_type: 'Single',
    cover_art_url: '',
    audio_url: '',
    tracks: [],
    streaming_links: [],
    release_date: '',
    description: ''
  });
  const [uploadingTrackIndex, setUploadingTrackIndex] = useState(null);

  useEffect(() => {
    loadXmasSongs();
  }, []);

  const loadXmasSongs = async () => {
    try {
      const data = await XmasSong.list('-release_date');
      setXmasSongs(data);
    } catch (error) {
      console.error("Failed to fetch Xmas songs:", error);
      alert('Failed to load Xmas songs. You might not have permission.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      original_artist: '',
      release_type: 'Single',
      cover_art_url: '',
      audio_url: '',
      tracks: [],
      streaming_links: [],
      release_date: '',
      description: ''
    });
    setEditingSong(null);
    setShowForm(false);
  };

  const addTrack = () => {
    const nextTrackNumber = (formData.tracks?.length || 0) + 1;
    setFormData(prev => ({
      ...prev,
      tracks: [...(prev.tracks || []), { track_number: nextTrackNumber, track_title: '', audio_url: '' }]
    }));
  };

  const updateTrack = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.map((track, i) =>
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const removeTrack = (index) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index).map((track, i) => ({ ...track, track_number: i + 1 }))
    }));
  };

  const handleTrackAudioUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert(`Audio file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
      e.target.value = '';
      return;
    }
    setUploadingTrackIndex(index);
    try {
      const { file_url } = await UploadFile({ file });
      updateTrack(index, 'audio_url', file_url);
    } catch (error) {
      console.error('Track audio upload failed:', error);
      alert('Track audio upload failed.');
    }
    setUploadingTrackIndex(null);
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
    setFormData(prev => ({ ...prev, streaming_links: items }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert(`Cover art file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
      e.target.value = '';
      return;
    }
    setUploadingCover(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('cover_art_url', file_url);
    } catch (error) {
      console.error('Cover art upload failed:', error);
      alert('Cover art upload failed. Please try a smaller file.');
    }
    setUploadingCover(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert(`Audio file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB. Use MP3 format.`);
      e.target.value = '';
      return;
    }
    setUploadingAudio(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('audio_url', file_url);
    } catch (error) {
      console.error('Audio upload failed:', error);
      alert('Audio upload failed. Please use a smaller file.');
    }
    setUploadingAudio(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.release_date) {
      alert('Please select a release date.');
      return;
    }
    setIsLoading(true);
    try {
      if (editingSong) {
        await XmasSong.update(editingSong.id, formData);
        alert('Xmas song updated successfully!');
      } else {
        await XmasSong.create(formData);
        alert('Xmas song created successfully!');
      }
      resetForm();
      loadXmasSongs();
    } catch (error) {
      console.error('Failed to save Xmas song:', error);
      alert('Failed to save Xmas song. You might not have permission.');
    }
    setIsLoading(false);
  };

  const handleEdit = (song) => {
    setFormData({
      title: song.title || '',
      original_artist: song.original_artist || '',
      release_type: song.release_type || 'Single',
      cover_art_url: song.cover_art_url || '',
      audio_url: song.audio_url || '',
      tracks: song.tracks || [],
      streaming_links: song.streaming_links || [],
      release_date: song.release_date || '',
      description: song.description || ''
    });
    setEditingSong(song);
    setShowForm(true);
  };

  const handleDelete = async (song) => {
    try {
      await XmasSong.delete(song.id);
      loadXmasSongs();
      alert('Xmas song deleted successfully!');
    } catch (error) {
      console.error('Failed to delete Xmas song:', error);
      alert('Failed to delete Xmas song.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Xmas Songs</h3>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-red-500 text-white hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" /> Add Xmas Song
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-white">{editingSong ? 'Edit Xmas Song' : 'Add New Xmas Song'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <strong>Audio Upload Tips:</strong> Files must be under 10MB. Use MP3 format for best results.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="title" className="text-gray-300">Song Title</Label><Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" required/></div>
                <div><Label htmlFor="original_artist" className="text-gray-300">Original Artist (if cover)</Label><Input id="original_artist" value={formData.original_artist} onChange={(e) => handleInputChange('original_artist', e.target.value)} className="bg-neutral-800 border-neutral-700 text-white"/></div>
                <div>
                  <Label className="text-gray-300">Release Type</Label>
                  <Select value={formData.release_type} onValueChange={(value) => handleInputChange('release_type', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectItem value="Single" className="text-white hover:bg-neutral-700">Single</SelectItem>
                      <SelectItem value="EP" className="text-white hover:bg-neutral-700">EP</SelectItem>
                      <SelectItem value="Album" className="text-white hover:bg-neutral-700">Album</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div><Label htmlFor="release_date" className="text-gray-300">Release Date</Label><DateDropdownPicker value={formData.release_date} onChange={(date) => handleInputChange('release_date', date)}/></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Cover Art</Label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" id="cover-upload-xmas"/>
                    <Button type="button" variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={() => document.getElementById('cover-upload-xmas').click()} disabled={uploadingCover}>
                      {uploadingCover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {formData.cover_art_url ? 'Replace' : 'Upload'}
                    </Button>
                    {formData.cover_art_url && <img src={formData.cover_art_url} alt="Cover" className="w-12 h-12 object-cover rounded" />}
                  </div>
                </div>
                {formData.release_type === 'Single' && (
                  <div>
                    <Label className="text-gray-300">Audio File (Optional - Max 10MB)</Label>
                    <div className="flex items-center gap-4">
                      <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" onChange={handleAudioUpload} className="hidden" id="audio-upload-xmas"/>
                      <Button type="button" variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={() => document.getElementById('audio-upload-xmas').click()} disabled={uploadingAudio}>
                        {uploadingAudio ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        {formData.audio_url ? 'Replace' : 'Upload'}
                      </Button>
                      {formData.audio_url && <span className="text-green-400 text-sm">✓ Audio uploaded</span>}
                    </div>
                  </div>
                )}
              </div>

              {(formData.release_type === 'EP' || formData.release_type === 'Album') && (
                <div className="space-y-4 border border-neutral-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-300 text-lg">Tracks</Label>
                    <Button type="button" onClick={addTrack} variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                      <Plus className="w-4 h-4 mr-2" /> Add Track
                    </Button>
                  </div>
                  {formData.tracks?.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No tracks added yet. Click "Add Track" to add tracks to this {formData.release_type}.</p>
                  )}
                  <div className="space-y-3">
                    {formData.tracks?.map((track, index) => (
                      <div key={index} className="flex gap-3 items-center bg-neutral-800/50 p-3 rounded-lg">
                        <span className="text-gray-400 font-mono w-8 text-center">{track.track_number}.</span>
                        <Input
                          placeholder="Track title"
                          value={track.track_title}
                          onChange={(e) => updateTrack(index, 'track_title', e.target.value)}
                          className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                            onChange={(e) => handleTrackAudioUpload(e, index)}
                            className="hidden"
                            id={`track-audio-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                            onClick={() => document.getElementById(`track-audio-${index}`).click()}
                            disabled={uploadingTrackIndex === index}
                          >
                            {uploadingTrackIndex === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                          </Button>
                          {track.audio_url && <span className="text-green-400 text-xs">✓</span>}
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeTrack(index)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Streaming Links</Label>
                  <Button type="button" onClick={addStreamingLink} variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Link
                  </Button>
                </div>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="streaming-links-xmas">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {formData.streaming_links?.map((link, index) => (
                          <Draggable key={`link-${index}`} draggableId={`link-${index}`} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="flex gap-2 items-center bg-neutral-800/50 p-2 rounded-lg">
                                <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-white p-1">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <Select value={link.platform} onValueChange={(value) => updateStreamingLink(index, 'platform', value)}>
                                  <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700 text-white">
                                    <SelectValue placeholder="Platform" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                    {PLATFORMS.map(platform => (
                                      <SelectItem key={platform} value={platform} className="text-white hover:bg-neutral-700">{platform}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input placeholder="URL" value={link.url} onChange={(e) => updateStreamingLink(index, 'url', e.target.value)} className="flex-1 bg-neutral-800 border-neutral-700 text-white"/>
                                <Button type="button" onClick={() => removeStreamingLink(index)} variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
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

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading || !formData.title || !formData.cover_art_url} className="bg-red-500 text-white font-bold hover:bg-red-600">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingSong ? 'Update Song' : 'Create Song'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><TreePine className="w-5 h-5 text-green-500" />Current Xmas Songs ({xmasSongs.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {xmasSongs.map((song) => (
              <div key={song.id} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg">
                <img src={song.cover_art_url} alt={song.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{song.title}</h3>
                  {song.original_artist && <p className="text-gray-400 text-sm">by {song.original_artist}</p>}
                  {song.release_type && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">{song.release_type}</span>}
                  {song.tracks?.length > 0 && <span className="text-xs text-gray-400 ml-2">({song.tracks.length} tracks)</span>}
                  <p className="text-gray-500 text-xs">
                    Released: {song.release_date ? format(new Date(`${song.release_date}T00:00:00`), 'MMM d, yyyy') : 'N/A'}
                  </p>
                  {song.streaming_links?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {song.streaming_links.map((link, index) => (
                        <span key={index} className="text-xs bg-neutral-700 text-gray-300 px-2 py-1 rounded">{link.platform}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(song)} className="text-blue-400 hover:text-blue-300"><Edit className="w-4 h-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-700">
                      <AlertDialogHeader><AlertDialogTitle className="text-white">Delete Xmas Song</AlertDialogTitle><AlertDialogDescription className="text-gray-400">Are you sure you want to delete "{song.title}"?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(song)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {xmasSongs.length === 0 && <div className="text-center text-gray-400 py-8">No Xmas songs yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}