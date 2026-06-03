
import React, { useState, useEffect } from 'react';
import { BioText } from '@/entities/BioText';
import { BioMedia } from '@/entities/BioMedia';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Upload, Trash2, GripVertical, Image as ImageIcon, Video } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function BioManager() {
  const [bioText, setBioText] = useState({ title: '', content: '' });
  const [bioTextId, setBioTextId] = useState(null);
  const [isTextLoading, setIsTextLoading] = useState(false);

  const [mediaItems, setMediaItems] = useState([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadBioText();
    loadMedia();
  }, []);

  const loadBioText = async () => {
    try {
      const data = await BioText.list();
      if (data.length > 0) {
        setBioText({ title: data[0].title, content: data[0].content });
        setBioTextId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load bio text:", error);
      alert('Error loading biography text. You might not have permission.');
    }
  };

  const loadMedia = async () => {
    setIsMediaLoading(true);
    try {
      const data = await BioMedia.list('order');
      setMediaItems(data);
    } catch (error) {
      console.error("Failed to load media:", error);
      alert('Error loading media gallery. You might not have permission.');
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleTextSave = async () => {
    setIsTextLoading(true);
    try {
      if (bioTextId) {
        await BioText.update(bioTextId, bioText);
      } else {
        const newText = await BioText.create(bioText);
        setBioTextId(newText.id);
      }
      alert('Biography text saved!');
    } catch (error) {
      console.error("Failed to save bio text:", error);
      alert('Error saving text. You might not have permission.');
    }
    setIsTextLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const media_type = file.type.startsWith('image/') ? 'image' : 'video';
      
      await BioMedia.create({
        media_url: file_url,
        media_type,
        caption: '',
        order: mediaItems.length,
      });
      await loadMedia();
    } catch (error) {
      console.error("Failed to upload media:", error);
      alert('Error uploading media. You might not have permission.');
    }
    setIsUploading(false);
  };
  
  const handleDeleteMedia = async (id) => {
    if (confirm('Are you sure you want to delete this media item?')) {
        try {
            await BioMedia.delete(id);
            await loadMedia();
        } catch(error) {
            console.error("Failed to delete media:", error);
            alert('Error deleting media. You might not have permission.');
        }
    }
  };

  const handleCaptionChange = async (id, caption) => {
    // Optimistic update
    setMediaItems(items => items.map(item => item.id === id ? {...item, caption} : item));
    try {
        await BioMedia.update(id, { caption });
    } catch(error) {
        console.error("Failed to update caption:", error);
        alert("Error saving caption, please refresh. You might not have permission.");
        loadMedia(); // Revert on failure
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(mediaItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMediaItems(items);

    // Update order in the backend
    const updates = items.map((item, index) => 
        BioMedia.update(item.id, { order: index })
    );

    try {
        await Promise.all(updates);
    } catch (error) {
        console.error("Failed to reorder media:", error);
        alert("Error saving new order, please refresh. You might not have permission.");
        loadMedia(); // Revert
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Biography Text</CardTitle>
          <CardDescription className="text-gray-400">Set the title and content for your bio page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bio-title" className="text-gray-300">Title</Label>
            <Input id="bio-title" value={bioText.title} onChange={e => setBioText(prev => ({...prev, title: e.target.value}))} className="bg-neutral-800 border-neutral-700 text-white" />
          </div>
          <div>
            <Label htmlFor="bio-content" className="text-gray-300">Content</Label>
            <Textarea id="bio-content" value={bioText.content} onChange={e => setBioText(prev => ({...prev, content: e.target.value}))} className="bg-neutral-800 border-neutral-700 text-white h-48" />
          </div>
          <Button onClick={handleTextSave} disabled={isTextLoading} className="bg-yellow-400 text-black hover:bg-yellow-500">
            {isTextLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Text
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Media Gallery</CardTitle>
          <CardDescription className="text-gray-400">Upload and manage pictures and videos for your bio page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                 <Label htmlFor="media-upload" className="text-gray-300">Upload New Media</Label>
                <div className="flex items-center gap-4 mt-2">
                    <input type="file" id="media-upload" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" disabled={isUploading} />
                    <Button type="button" onClick={() => document.getElementById('media-upload').click()} disabled={isUploading} variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload
                    </Button>
                </div>
            </div>

             <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="media-gallery">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {mediaItems.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded-lg">
                                            <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 p-2"><GripVertical className="w-5 h-5"/></div>
                                            {item.media_type === 'image' ? <ImageIcon className="w-6 h-6 text-yellow-400" /> : <Video className="w-6 h-6 text-yellow-400" />}
                                            <a href={item.media_url} target="_blank" rel="noreferrer" className="text-sm text-gray-300 truncate hover:underline">{item.media_url.split('/').pop()}</a>
                                            <Input placeholder="Caption..." value={item.caption || ''} onChange={(e) => handleCaptionChange(item.id, e.target.value)} className="flex-grow bg-neutral-800 border-neutral-700 text-white mx-4" />
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMedia(item.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                             {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            {isMediaLoading && <p className="text-gray-400">Loading media...</p>}
            {!isMediaLoading && mediaItems.length === 0 && (
                <p className="text-gray-400 text-center">No media items found. Upload some!</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
