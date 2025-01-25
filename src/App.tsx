import { useState, useEffect, useCallback } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, CircularProgress, Typography, Snackbar } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MovieCard } from './components/MovieCard';
import { getInitialMovies, getPersonalizedRecommendations } from './services/tmdb';
import { Movie, MovieCache } from './types';
import { ruLocale } from './locales/ru';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
});

const queryClient = new QueryClient();

const RECOMMENDATIONS_THRESHOLD = 20;

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendationNotice, setShowRecommendationNotice] = useState(false);
  const [movieCache, setMovieCache] = useState<MovieCache>(() => {
    const saved = localStorage.getItem('movieCache');
    return saved ? JSON.parse(saved) : {};
  });

  const getLikedMovieIds = useCallback(() => {
    return Object.entries(movieCache)
      .filter(([_, data]) => data.liked)
      .map(([id]) => parseInt(id));
  }, [movieCache]);

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      const likedMovieIds = getLikedMovieIds();
      
      let newMovies: Movie[];
      if (likedMovieIds.length >= RECOMMENDATIONS_THRESHOLD) {
        newMovies = await getPersonalizedRecommendations(likedMovieIds);
        if (newMovies.length > 0) {
          setShowRecommendationNotice(true);
        }
      } else {
        newMovies = await getInitialMovies();
      }
      
      setMovies(newMovies);
      setError(null);
    } catch (error) {
      console.error('Error loading movies:', error);
      setError(ruLocale.errors.loadingFailed);
    } finally {
      setLoading(false);
    }
  }, [getLikedMovieIds]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    localStorage.setItem('movieCache', JSON.stringify(movieCache));
    
    const likedMovieIds = getLikedMovieIds();
    if (likedMovieIds.length === RECOMMENDATIONS_THRESHOLD) {
      loadMovies();
    }
  }, [movieCache, getLikedMovieIds, loadMovies]);

  const handleLike = (movieId: number) => {
    setMovieCache((prev) => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        liked: !prev[movieId]?.liked,
      },
    }));
  };

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < movies.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
            overflow: 'hidden',
            bgcolor: 'background.default',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            touchAction: 'none',
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Box sx={{ textAlign: 'center', color: 'error.main', p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {error}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => window.location.reload()}
              >
                {ruLocale.errors.tryAgain}
              </Typography>
            </Box>
          ) : movies[currentIndex] ? (
            <MovieCard
              movie={movies[currentIndex]}
              onLike={handleLike}
              isLiked={movieCache[movies[currentIndex].id]?.liked}
              onSwipe={handleSwipe}
            />
          ) : null}
        </Box>

        <Snackbar
          open={showRecommendationNotice}
          autoHideDuration={4000}
          onClose={() => setShowRecommendationNotice(false)}
          message="Теперь мы показываем рекомендации на основе ваших любимых фильмов!"
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
