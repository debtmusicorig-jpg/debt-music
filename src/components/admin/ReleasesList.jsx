import React, { useState, useEffect } from 'react';
import { Release } from '@/entities/Release';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Edit, Trash2, Play, ExternalLink, Loader2 } from 'lucide-react';
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
import ReleaseForm from './ReleaseForm';

export default function ReleasesList({ onEditSuccess }) {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRelease, setEditingRelease] = useState(null);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    setIsLoading(true);
    try {
      const data = await Release.list('-release_date');
      setReleases(data || []);
    } catch (error) {
      console.error('Failed to load releases:', error);
      setReleases([]);
    }
    setIsLoading(false);
  };

  const handleDelete = async (release) => {
    try {
      await Release.delete(release.id);
      loadReleases();
    } catch (error) {
      console.error('Failed to delete release:', error);
    }
  };

  const handleEditCompleted = () => {
    setEditingRelease(null);
    loadReleases();
    if (onEditSuccess) {
      onEditSuccess();
    }
  };

  if (editingRelease) {
    return (
      <ReleaseForm 
        release={editingRelease} 
        onSuccess={handleEditCompleted}
        onCancel={() => setEditingRelease(null)}
      />
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white">Your Releases ({releases.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="ml-2 text-gray-400">Loading releases...</span>
          </div>
        ) : (
          <div className="grid gap-4">
            {releases.map((release) => (
              <div key={release.id} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg">
                <img src={release.cover_art_url} alt={release.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{release.title}</h3>
                  {release.album_name && (
                    <p className="text-gray-300 text-sm">from "{release.album_name}"</p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {release.type} • {release.release_date ? format(new Date(release.release_date), 'MMM d, yyyy') : 'No Date'}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {release.streaming_links?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-neutral-700 text-gray-300 px-2 py-1 rounded hover:bg-neutral-600 transition-colors flex items-center gap-1"
                      >
                        {link.platform}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {release.video_url && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <Play className="w-3 h-3" />
                      Video
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingRelease(release)}
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
                        <AlertDialogTitle className="text-white">Delete Release</AlertDialogTitle>
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
            {releases.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No releases yet. Add your first release!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}