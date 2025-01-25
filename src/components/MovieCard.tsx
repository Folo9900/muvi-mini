import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Card, Tooltip, Button } from '@mui/material';
import { motion, PanInfo } from 'framer-motion';
import ReactPlayer from 'react-player';
import { 
  Favorite, FavoriteBorder, 
  VolumeUp, VolumeOff,
  Comment,
  Star,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { Movie, MovieDetails } from '../types';
import { getMovieDetails } from '../services/tmdb';
import { ruLocale } from '../locales/ru';
import { CommentsDialog } from './CommentsDialog';

interface MovieCardProps {
  movie: Movie;
  onLike?: (movieId: number) => void;
  isLiked?: boolean;
  onSwipe?: (direction: 'up' | 'down') => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  onLike, 
  isLiked = false,
  onSwipe 
}) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const movieDetails = await getMovieDetails(movie.id);
        setDetails(movieDetails);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };
    fetchDetails();
  }, [movie.id]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.y < -swipeThreshold) {
      onSwipe?.('up');
    } else if (info.offset.y > swipeThreshold) {
      onSwipe?.('down');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Получаем первые 5 слов
  const shortDescription = movie.overview
    .split(' ')
    .slice(0, 5)
    .join(' ') + '...';

  const hasMoreText = movie.overview.split(' ').length > 5;

  const trailer = details?.videos.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const getCommentsCount = () => {
    const saved = localStorage.getItem(`comments_${movie.id}`);
    return saved ? JSON.parse(saved).length : 0;
  };

  const commentsCount = getCommentsCount();

  return (
    <>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ height: '100vh', width: '100%', position: 'relative' }}
      >
        <Card 
          sx={{ 
            height: '100%', 
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {trailer ? (
            <Box sx={{ height: '100%', width: '100%' }}>
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${trailer.key}`}
                playing={isPlaying}
                muted={muted}
                width="100%"
                height="100%"
                style={{ objectFit: 'cover' }}
                onReady={() => setIsPlaying(true)}
                config={{
                  youtube: {
                    playerVars: {
                      controls: 0,
                      modestbranding: 1,
                      rel: 0,
                    },
                  },
                }}
              />
            </Box>
          ) : (
            <Box
              component="img"
              src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
              alt={movie.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
              color: 'white',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: '1.1rem',
                fontWeight: 500,
                lineHeight: 1.2
              }}
            >
              {movie.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Star sx={{ color: 'gold', mr: 0.5, fontSize: '1rem' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {movie.vote_average.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ mx: 2, fontSize: '0.85rem' }}>
                • {formatDate(movie.release_date)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                  opacity: 0.9
                }}
              >
                {expanded ? movie.overview : shortDescription}
              </Typography>
              {hasMoreText && (
                <Button
                  size="small"
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none', 
                    mt: 0.5,
                    fontSize: '0.85rem',
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                  onClick={() => setExpanded(!expanded)}
                  endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                >
                  {expanded ? 'Свернуть' : 'Читать далее'}
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isLiked ? ruLocale.actions.unlike : ruLocale.actions.like}>
                <IconButton 
                  onClick={() => onLike?.(movie.id)}
                  sx={{ color: 'white' }}
                >
                  {isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={ruLocale.actions.toggleSound}>
                <IconButton 
                  onClick={() => setMuted(!muted)}
                  sx={{ color: 'white' }}
                >
                  {muted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
              </Tooltip>

              <Tooltip title={ruLocale.actions.showComments}>
                <IconButton 
                  sx={{ color: 'white' }}
                  onClick={() => setCommentsOpen(true)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Comment />
                    {commentsCount > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                        }}
                      >
                        {commentsCount}
                      </Typography>
                    )}
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Card>
      </motion.div>

      <CommentsDialog
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        movieId={movie.id}
      />
    </>
  );
};
