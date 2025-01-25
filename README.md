# Muvi Mini - Movie Recommendation App

Modern movie recommendation web application built with React, TypeScript, and Vite.

## Features

- Infinite scroll movie feed with auto-playing trailers
- Swipe navigation between movies
- Smart recommendation system based on liked movies
- Movie details with trailers
- Comments system
- Dark mode interface

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

### GitHub

1. Create a new repository on GitHub
2. Initialize git and push the code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### Vercel Deployment

1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Add the following environment variable in Vercel project settings:
   - Name: `VITE_TMDB_API_KEY`
   - Value: Your TMDB API key
4. Deploy the project

## Technology Stack

- React
- TypeScript
- Vite
- Material-UI
- Framer Motion
- TMDB API

## License

MIT
