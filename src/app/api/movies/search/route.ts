// app/api/movies/search/route.ts
import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const JUSTWATCH_API_KEY = process.env.JUSTWATCH_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Search movies from TMDB
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
    );
    const tmdbData = await tmdbResponse.json();

    // For each movie, get streaming availability from JustWatch
    const moviesWithStreaming = await Promise.all(
      tmdbData.results.slice(0, 5).map(async (movie: any) => {
        const streamingResponse = await fetch(
          `https://api.justwatch.com/content/titles/movie/${movie.id}/locale/en_US`
        );
        const streamingData = await streamingResponse.json();

        return {
          ...movie,
          streaming: streamingData.offers || [],
        };
      })
    );

    return NextResponse.json(moviesWithStreaming);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
