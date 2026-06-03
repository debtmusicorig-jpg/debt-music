import React, { useState, useEffect } from 'react';
import Release from '../entities/Release.json';
import ReleaseCard from './ReleaseCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function Releases({ title, description, type, limit }) {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      setIsLoading(true);
      try {
        let data;
        if (type) {
          data = await Release.filter({ type }, '-release_date', limit);
        } else {
          data = await Release.list('-release_date', limit);
        }
        setReleases(data || []);
      } catch (error) {
        console.error("Failed to fetch releases:", error);
        setReleases([]);
      }
      setIsLoading(false);
    };
    fetchReleases();
  }, [type, limit]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <Skeleton className="h-12 w-3/4 mx-auto bg-neutral-800" />
          <Skeleton className="h-6 w-1/2 mx-auto mt-4 bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: limit || 3 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-64 w-full bg-neutral-800" />
              <Skeleton className="h-6 w-3/4 bg-neutral-800" />
              <Skeleton className="h-4 w-1/2 bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (releases.length === 0) {
    return null; // Don't render the section if there are no releases
  }

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-extrabold tracking-tight text-blue-500 sm:text-5xl">{title}</h2>
        <p className="mt-4 text-lg text-neutral-400">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {releases.map(release => <ReleaseCard key={release.id} release={release} />)}
      </div>
    </div>
  );
}
