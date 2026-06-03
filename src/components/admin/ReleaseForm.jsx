
import React, { useState, useEffect } from 'react';
import { Release } from '@/entities/Release';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Loader2, Save, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DateDropdownPicker from '../shared/DateDropdownPicker';
import { format } from 'date-fns';

const PLATFORMS = [
  "Spotify",
  "Apple Music",
  "YouTube",
  "SoundCloud",
  "Bandcamp",
  "Amazon Music",
  "Artist Link YT",
  "Artist Link Spotify",
  "Artist Link Amazon",
  "Artist Link Apple",
  "Artist Link Pandora"
];

export default function ReleaseForm({ release = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    album_name: '', // Added album_name
    release_date: '',
    cover_art_url: '',
    video_url: '',
    type: 'Single Only',
    streaming_links: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  useEffect(() => {
    if (release) {
      setFormData({
        title: release.title || '',
        album_name: release.album_name || '', // Populate album_name from release
        release_date: release.release_date || '',
        cover_art_url: release.cover_art_url || '',
        video_url: release.video_url || '',
        type: release.type || 'Single Only',
        streaming_links: release.streaming_links || []
      });
    }
  }, [release]);

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

    setUploadingCover(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('cover_art_url', file_url);
    } catch (error) {
      console.error('Cover upload failed:', error);
    }
    setUploadingCover(false);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    console.log(`Uploading video: ${file.name} (${fileSizeMB} MB)`);

    setUploadingVideo(true);
    setVideoUploadProgress(0);

    // Simulate progress for better UX since we can't track actual upload progress
    const progressInterval = setInterval(() => {
      setVideoUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('video_url', file_url);
      setVideoUploadProgress(100);
    } catch (error) {
      console.error('Video upload failed:', error);
      alert(`Video upload failed: ${error.message || 'Unknown error'}`);
    }

    clearInterval(progressInterval);
    setTimeout(() => {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...formData };
      // If type is not 'Single from Album', clear album_name to avoid saving unnecessary data
      if (payload.type !== 'Single from Album') {
        delete payload.album_name;
      }

      if (release) {
        // Update existing release
        await Release.update(release.id, payload);
      } else {
        // Create new release
        await Release.create(payload);
      }
      onSuccess?.();

      // Reset form if creating new release
      if (!release) {
        setFormData({
          title: '',
          album_name: '', // Reset album_name
          release_date: '',
          cover_art_url: '',
          video_url: '',
          type: 'Single Only',
          streaming_links: []
        });
      }
    } catch (error) {
      console.error('Failed to save release:', error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">
            {release ? 'Edit Release' : 'Add New Release'}
          </CardTitle>
          {release && onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-300">Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                <SelectItem value="Single Only" className="text-white hover:bg-neutral-700">Single Only</SelectItem>
                <SelectItem value="Single from Album" className="text-white hover:bg-neutral-700">Single from Album</SelectItem>
                <SelectItem value="Album" className="text-white hover:bg-neutral-700">Album</SelectItem>
                <SelectItem value="EP" className="text-white hover:bg-neutral-700">EP</SelectItem>
                <SelectItem value="Unreleased" className="text-white hover:bg-neutral-700">Unreleased</SelectItem>
                <SelectItem value="Bonus only available On D.E.B.T-Music" className="text-white hover:bg-neutral-700">Bonus only available On D.E.B.T-Music</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditionally show Album Name field */}
          {formData.type === 'Single from Album' && (
            <div className="space-y-2">
              <Label htmlFor="album_name" className="text-gray-300">Album Name</Label>
              <Input
                id="album_name"
                value={formData.album_name}
                onChange={(e) => handleInputChange('album_name', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Enter the album name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-300">Release Date</Label>
            <DateDropdownPicker
               value={formData.release_date}
               onChange={(date) => handleInputChange('release_date', date)}
            />
            {formData.release_date && (
              <p className="text-sm text-gray-400">
                Selected date: {format(new Date(`${formData.release_date}T00:00:00`), 'dd/MM/yyyy')}
              </p>
            )}
          </div>

          {/* Cover Art Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">Cover Art</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                id="cover-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                onClick={() => document.getElementById('cover-upload').click()}
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

          {/* Video Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">Music Video (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                  onClick={() => document.getElementById('video-upload').click()}
                  disabled={uploadingVideo}
                >
                  {uploadingVideo ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {formData.video_url ? 'Replace Video' : 'Upload Video'}
                </Button>
                {formData.video_url && !uploadingVideo && (
                  <>
                    <span className="text-green-400 text-sm">✓ Video uploaded</span>
                    <Button
                      type="button"
                      onClick={() => handleInputChange('video_url', '')}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300"
                      aria-label="Remove video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {uploadingVideo && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uploading video...</span>
                    <span className="text-yellow-400">{Math.round(videoUploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Large videos may take several minutes to upload. Please be patient.
                  </p>
                </div>
              )}
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

          <Button
            type="submit"
            disabled={isLoading || !formData.title || !formData.release_date || !formData.cover_art_url || (formData.type === 'Single from Album' && !formData.album_name)}
            className="w-full bg-yellow-400 text-black font-bold hover:bg-yellow-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {release ? 'Update Release' : 'Create Release'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
