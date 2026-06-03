import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play, Calendar, ArrowRight, Music, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function ReleaseCard({ release }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  if (!release) {
    return null;
  }

  const handleVideoClick = (e) => {
    e.stopPropagation();
    setShowVideo(true);
  };

  const hasStreamingLinks = release.streaming_links && release.streaming_links.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group h-full"
      >
        <Card className="bg-neutral-900/80 backdrop-blur-sm border-neutral-800 hover:border-yellow-400/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
          <CardHeader className="relative p-0 aspect-square">
            {release.video_url && (
              <button
                onClick={handleVideoClick}
                className="absolute top-2 right-2 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors"
                aria-label="Play video"
              >
                <Play className="w-6 h-6" />
              </button>
            )}
            {release.cover_art_url ? (
              <img
                src={release.cover_art_url}
                alt={`${release.title} cover art`}
                className="w-full h-full object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center rounded-t-lg">
                <Music className="w-16 h-16 text-neutral-700" />
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6 flex flex-col flex-grow">
            <div className="mb-4 flex-grow">
              <h3 className="text-2xl font-bold text-white mb-2">{release.title}</h3>
              {release.album_name && (
                <p className="text-yellow-400 text-sm mb-1">from "{release.album_name}"</p>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                  {release.type}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {release.release_date ? format(new Date(`${release.release_date}T00:00:00`), 'MMM d, yyyy') : 'Date TBC'}
                </span>
              </div>
            </div>

            {hasStreamingLinks && (
              <div className="mt-auto">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full text-left text-yellow-400 hover:text-yellow-300 transition-colors flex items-center justify-between"
                >
                  <span>Streaming Links</span>
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-2">
                    {release.streaming_links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
                      >
                        <span className="text-white flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          {link.platform}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {release.video_url && (
        <Dialog open={showVideo} onOpenChange={setShowVideo}>
          <DialogContent className="max-w-4xl p-0 bg-black border-neutral-800">
            <div className="aspect-video">
              <video
                src={release.video_url}
                className="w-full h-full"
                controls
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}