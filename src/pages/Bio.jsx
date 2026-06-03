import React, { useState, useEffect } from 'react';
import BioText from '../entities/BioText.jsx';
import { BioMedia } from '@/entities/BioMedia';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookUser, Camera, Video } from 'lucide-react';

export default function BioPage() {
  const [bio, setBio] = useState(null);
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const bioTextData = await BioText.list();
        if (bioTextData.length > 0) {
          setBio(bioTextData[0]);
        }

        const bioMediaData = await BioMedia.list('order');
        setMedia(bioMediaData);

      } catch (error) {
        console.error("Failed to fetch bio content:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const openMedia = (item) => {
    setSelectedMedia(item);
  };

  const closeMedia = () => {
    setSelectedMedia(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Skeleton className="h-12 w-1/3 mb-8 bg-neutral-800" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Skeleton className="h-64 w-full bg-neutral-800" />
            <Skeleton className="h-6 w-3/4 bg-neutral-800" />
          </div>
          <div className="md:col-span-2 space-y-4">
             <Skeleton className="h-8 w-full bg-neutral-800" />
             <Skeleton className="h-8 w-full bg-neutral-800" />
             <Skeleton className="h-8 w-5/6 bg-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-6 py-12 text-gray-300">
        <div className="flex items-center gap-4 mb-8">
          <BookUser className="w-10 h-10 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">{bio?.title || "Biography"}</h1>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 mb-12">
            <p className="whitespace-pre-wrap leading-relaxed text-lg">
                {bio?.content || "No biography has been added yet."}
            </p>
        </div>

        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Gallery</h2>
            {media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {media.map(item => (
                        <div key={item.id} className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg" onClick={() => openMedia(item)}>
                            <img src={item.media_type === 'image' ? item.media_url : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'} alt={item.caption || 'Gallery item'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.media_type === 'image' ? <Camera className="w-10 h-10 text-white" /> : <Video className="w-10 h-10 text-white" />}
                            </div>
                            {item.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white text-sm truncate">{item.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No media has been added to the gallery yet.</p>
            )}
        </div>
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={closeMedia}>
        <DialogContent className="max-w-4xl bg-black border-neutral-800 p-4">
          {selectedMedia && (
            <>
              {selectedMedia.media_type === 'image' ? (
                <img src={selectedMedia.media_url} alt={selectedMedia.caption || 'Bio Media'} className="max-h-[80vh] w-auto mx-auto rounded-lg" />
              ) : (
                <video src={selectedMedia.media_url} controls autoPlay className="w-full h-auto rounded-lg max-h-[80vh]">
                  Your browser does not support the video tag.
                </video>
              )}
              {selectedMedia.caption && <p className="text-white text-center mt-4">{selectedMedia.caption}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
