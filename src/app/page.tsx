// app/page.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Film, PlayCircle } from "lucide-react";
import { useDebounce } from "react-use";
import Image from "next/image";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  streaming: StreamingOffer[];
}

interface StreamingOffer {
  provider_name: string;
  provider_logo: string;
  url: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async (query: string) => {
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/movies/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
    setLoading(false);
  };

  useDebounce(
    () => {
      if (searchQuery) {
        searchMovies(searchQuery);
      }
    },
    500,
    [searchQuery]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Film className="w-10 h-10" />
            Movie Stream Finder
          </h1>
          <p className="text-gray-400">
            Find where to watch your favorite movies
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a movie..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Card key={movie.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-48 relative rounded-lg overflow-hidden">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                      {new Date(movie.release_date).getFullYear()}
                    </p>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Available on:
                      </h3>
                      {movie.streaming.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {movie.streaming.map((platform, index) => (
                            <a
                              key={index}
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
                            >
                              <Image
                                src={platform.provider_logo}
                                alt={platform.provider_name}
                                width={16}
                                height={16}
                                className="mr-2 rounded"
                              />
                              {platform.provider_name}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No streaming options found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
