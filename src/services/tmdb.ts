import axios from 'axios';
import { Movie, MovieDetails } from '../types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'ru-RU',
    region: 'RU',
  },
});

export const getTrendingMovies = async (page = 1): Promise<Movie[]> => {
  const response = await api.get(`/trending/movie/week`, {
    params: { page },
  });
  return response.data.results;
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  const response = await api.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'videos',
    },
  });
  return response.data;
};

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  const response = await api.get(`/search/movie`, {
    params: {
      query,
      page,
    },
  });
  return response.data.results;
};

export const getMoviesByGenre = async (genreId: number, page = 1): Promise<Movie[]> => {
  const response = await api.get(`/discover/movie`, {
    params: {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
    },
  });
  return response.data.results;
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  const response = await api.get(`/movie/${movieId}/similar`);
  return response.data.results;
};

export const getRecommendedMovies = async (movieId: number): Promise<Movie[]> => {
  const response = await api.get(`/movie/${movieId}/recommendations`);
  return response.data.results;
};

// Проверяем наличие трейлера у фильма
const checkMovieHasTrailer = async (movieId: number): Promise<boolean> => {
  try {
    const details = await getMovieDetails(movieId);
    return details.videos.results.some(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
  } catch (error) {
    console.error(`Error checking trailer for movie ${movieId}:`, error);
    return false;
  }
};

// Получаем рекомендации на основе любимых фильмов
export const getPersonalizedRecommendations = async (likedMovieIds: number[]): Promise<Movie[]> => {
  if (likedMovieIds.length === 0) {
    return getTrendingMovies();
  }

  // Получаем рекомендации и похожие фильмы для каждого понравившегося фильма
  const recommendationsPromises = likedMovieIds.map(id => getRecommendedMovies(id));
  const similarMoviesPromises = likedMovieIds.map(id => getSimilarMovies(id));

  const [recommendationsResults, similarMoviesResults] = await Promise.all([
    Promise.all(recommendationsPromises),
    Promise.all(similarMoviesPromises),
  ]);

  // Объединяем все рекомендации
  const allMovies = [
    ...recommendationsResults.flat(),
    ...similarMoviesResults.flat(),
  ];

  // Удаляем дубликаты и уже лайкнутые фильмы
  const uniqueMovies = allMovies.reduce((acc, movie) => {
    if (!acc.some(m => m.id === movie.id) && !likedMovieIds.includes(movie.id)) {
      acc.push(movie);
    }
    return acc;
  }, [] as Movie[]);

  // Сортируем по рейтингу и берем топ-200
  const topRatedMovies = uniqueMovies
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 200);

  // Проверяем наличие трейлеров (параллельно для ускорения)
  const moviesWithTrailerInfo = await Promise.all(
    topRatedMovies.map(async (movie) => ({
      movie,
      hasTrailer: await checkMovieHasTrailer(movie.id),
    }))
  );

  // Сначала фильмы с трейлерами, потом остальные
  return moviesWithTrailerInfo
    .sort((a, b) => {
      if (a.hasTrailer === b.hasTrailer) {
        return b.movie.vote_average - a.movie.vote_average;
      }
      return a.hasTrailer ? -1 : 1;
    })
    .map(item => item.movie)
    .slice(0, 200);
};
