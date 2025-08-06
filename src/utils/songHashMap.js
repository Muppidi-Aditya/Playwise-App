import indianSongs from '../music.js';

// Create multiple hashmaps for different search criteria
const createSongHashMaps = () => {
  const titleHashMap = new Map();
  const artistHashMap = new Map();
  const movieHashMap = new Map();
  const keywordHashMap = new Map();
  
  indianSongs.forEach((song, index) => {
    const songData = { song, index };
    const normalizedTitle = song.name.toLowerCase();
    const normalizedArtist = song.artist.toLowerCase();
    const normalizedMovie = song.movie.toLowerCase();
    
    // Title hashmap for exact matches
    titleHashMap.set(normalizedTitle, songData);
    
    // Artist hashmap
    if (!artistHashMap.has(normalizedArtist)) {
      artistHashMap.set(normalizedArtist, []);
    }
    artistHashMap.get(normalizedArtist).push(songData);
    
    // Movie hashmap
    if (!movieHashMap.has(normalizedMovie)) {
      movieHashMap.set(normalizedMovie, []);
    }
    movieHashMap.get(normalizedMovie).push(songData);
    
    // Keyword hashmap for partial matches
    const keywords = [
      ...normalizedTitle.split(' '),
      ...normalizedArtist.split(' '),
      ...normalizedMovie.split(' ')
    ].filter(word => word.length > 2); // Only meaningful keywords
    
    keywords.forEach(keyword => {
      if (!keywordHashMap.has(keyword)) {
        keywordHashMap.set(keyword, []);
      }
      keywordHashMap.get(keyword).push(songData);
    });
  });
  
  return { titleHashMap, artistHashMap, movieHashMap, keywordHashMap };
};

// Create the hashmap instances
export const { titleHashMap, artistHashMap, movieHashMap, keywordHashMap } = createSongHashMaps();

// Enhanced search function with multiple search strategies
export const searchSongByTitle = (searchTerm) => {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  if (!normalizedSearchTerm) return [];
  
  const results = new Set(); // Use Set to avoid duplicates
  const maxResults = 15;
  
  // Strategy 1: Exact title match - O(1)
  if (titleHashMap.has(normalizedSearchTerm)) {
    results.add(titleHashMap.get(normalizedSearchTerm).song);
  }
  
  // Strategy 2: Partial title matches - O(k) where k is number of matching titles
  for (const [title, data] of titleHashMap) {
    if (title.includes(normalizedSearchTerm) && results.size < maxResults) {
      results.add(data.song);
    }
  }
  
  // Strategy 3: Artist matches - O(1) for exact artist match
  if (artistHashMap.has(normalizedSearchTerm)) {
    artistHashMap.get(normalizedSearchTerm).forEach(data => {
      if (results.size < maxResults) {
        results.add(data.song);
      }
    });
  }
  
  // Strategy 4: Movie matches - O(1) for exact movie match
  if (movieHashMap.has(normalizedSearchTerm)) {
    movieHashMap.get(normalizedSearchTerm).forEach(data => {
      if (results.size < maxResults) {
        results.add(data.song);
      }
    });
  }
  
  // Strategy 5: Keyword matches for partial searches
  const searchWords = normalizedSearchTerm.split(' ').filter(word => word.length > 2);
  for (const word of searchWords) {
    if (keywordHashMap.has(word)) {
      keywordHashMap.get(word).forEach(data => {
        if (results.size < maxResults) {
          results.add(data.song);
        }
      });
    }
  }
  
  // Convert Set back to array and sort by relevance
  const resultsArray = Array.from(results);
  return sortByRelevance(resultsArray, normalizedSearchTerm);
};

// Sort results by relevance score
const sortByRelevance = (songs, searchTerm) => {
  return songs.sort((a, b) => {
    const aScore = calculateRelevanceScore(a, searchTerm);
    const bScore = calculateRelevanceScore(b, searchTerm);
    return bScore - aScore; // Higher score first
  });
};

// Calculate relevance score for sorting
const calculateRelevanceScore = (song, searchTerm) => {
  let score = 0;
  const title = song.name.toLowerCase();
  const artist = song.artist.toLowerCase();
  const movie = song.movie.toLowerCase();
  
  // Exact title match gets highest score
  if (title === searchTerm) score += 100;
  // Title starts with search term
  else if (title.startsWith(searchTerm)) score += 50;
  // Title contains search term
  else if (title.includes(searchTerm)) score += 30;
  
  // Artist matches
  if (artist === searchTerm) score += 40;
  else if (artist.includes(searchTerm)) score += 20;
  
  // Movie matches
  if (movie === searchTerm) score += 30;
  else if (movie.includes(searchTerm)) score += 15;
  
  return score;
};

// Get all songs for display
export const getAllSongs = () => indianSongs;

// Get song by exact title match - O(1)
export const getSongByExactTitle = (title) => {
  const normalizedTitle = title.toLowerCase().trim();
  const result = titleHashMap.get(normalizedTitle);
  return result ? result.song : null;
};

// Get songs by artist - O(1)
export const getSongsByArtist = (artist) => {
  const normalizedArtist = artist.toLowerCase().trim();
  const results = artistHashMap.get(normalizedArtist);
  return results ? results.map(data => data.song) : [];
};

// Get songs by movie - O(1)
export const getSongsByMovie = (movie) => {
  const normalizedMovie = movie.toLowerCase().trim();
  const results = movieHashMap.get(normalizedMovie);
  return results ? results.map(data => data.song) : [];
};

// Get hashmap statistics for debugging
export const getHashMapStats = () => {
  return {
    totalSongs: indianSongs.length,
    uniqueArtists: artistHashMap.size,
    uniqueMovies: movieHashMap.size,
    uniqueKeywords: keywordHashMap.size,
    titleHashMapSize: titleHashMap.size
  };
};

export default { titleHashMap, artistHashMap, movieHashMap, keywordHashMap }; 