import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';

interface Comment {
  id: number;
  text: string;
  date: string;
  author: string;
}

interface CommentsDialogProps {
  open: boolean;
  onClose: () => void;
  movieId: number;
}

export const CommentsDialog: React.FC<CommentsDialogProps> = ({ open, onClose, movieId }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(`comments_${movieId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        text: newComment.trim(),
        date: new Date().toLocaleString('ru-RU'),
        author: 'Вы',
      };
      
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      localStorage.setItem(`comments_${movieId}`, JSON.stringify(updatedComments));
      setNewComment('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Комментарии</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <List sx={{ mb: 2 }}>
          {comments.map((comment) => (
            <ListItem key={comment.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{comment.author[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={comment.author}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {comment.text}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption" color="text.secondary">
                      {comment.date}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
          {comments.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              Пока нет комментариев. Будьте первым!
            </Typography>
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите комментарий..."
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            sx={{ minWidth: 'auto' }}
          >
            <SendIcon />
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
