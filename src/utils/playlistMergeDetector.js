// Playlist Merge Detector using HashSet and Map
class PlaylistMergeDetector {
  constructor() {
    this.playlistSongSets = new Map(); // Map<playlistId, Set<songKey>>
    this.songKeyToPlaylists = new Map(); // Map<songKey, Set<playlistId>>
  }

  // Create a unique song key (title + artist)
  createSongKey(song) {
    return `${song.name.toLowerCase()}-${song.artist.toLowerCase()}`;
  }

  // Update playlist data in the detector
  updatePlaylistData(playlists) {
    this.playlistSongSets.clear();
    this.songKeyToPlaylists.clear();

    playlists.forEach(playlist => {
      const songSet = new Set();
      
      // Get songs from the playlist
      const songs = playlist.songs ? playlist.songs.toArray() : [];
      
      songs.forEach(song => {
        const songKey = this.createSongKey(song);
        songSet.add(songKey);
        
        // Track which playlists contain this song
        if (!this.songKeyToPlaylists.has(songKey)) {
          this.songKeyToPlaylists.set(songKey, new Set());
        }
        this.songKeyToPlaylists.get(songKey).add(playlist.id);
      });
      
      this.playlistSongSets.set(playlist.id, songSet);
    });
  }

  // Calculate intersection of two sets
  getIntersection(set1, set2) {
    const intersection = new Set();
    for (const item of set1) {
      if (set2.has(item)) {
        intersection.add(item);
      }
    }
    return intersection;
  }

  // Calculate union of two sets
  getUnion(set1, set2) {
    const union = new Set(set1);
    for (const item of set2) {
      union.add(item);
    }
    return union;
  }

  // Calculate Jaccard similarity (intersection / union)
  calculateJaccardSimilarity(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 1;
    if (set1.size === 0 || set2.size === 0) return 0;
    
    const intersection = this.getIntersection(set1, set2);
    const union = this.getUnion(set1, set2);
    
    return intersection.size / union.size;
  }

  // Calculate overlap percentage (intersection / smaller set)
  calculateOverlapPercentage(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 100;
    if (set1.size === 0 || set2.size === 0) return 0;
    
    const intersection = this.getIntersection(set1, set2);
    const smallerSetSize = Math.min(set1.size, set2.size);
    
    return (intersection.size / smallerSetSize) * 100;
  }

  // Find playlist pairs with ≥80% overlap
  findMergeSuggestions(threshold = 80) {
    const suggestions = [];
    const playlistIds = Array.from(this.playlistSongSets.keys());
    
    // Compare each pair of playlists
    for (let i = 0; i < playlistIds.length; i++) {
      for (let j = i + 1; j < playlistIds.length; j++) {
        const playlist1Id = playlistIds[i];
        const playlist2Id = playlistIds[j];
        
        const set1 = this.playlistSongSets.get(playlist1Id);
        const set2 = this.playlistSongSets.get(playlist2Id);
        
        if (!set1 || !set2) continue;
        
        const overlapPercentage = this.calculateOverlapPercentage(set1, set2);
        const jaccardSimilarity = this.calculateJaccardSimilarity(set1, set2);
        
        if (overlapPercentage >= threshold) {
          const intersection = this.getIntersection(set1, set2);
          const union = this.getUnion(set1, set2);
          
          suggestions.push({
            playlist1Id,
            playlist2Id,
            overlapPercentage: Math.round(overlapPercentage * 100) / 100,
            jaccardSimilarity: Math.round(jaccardSimilarity * 100) / 100,
            sharedSongs: intersection.size,
            totalUniqueSongs: union.size,
            intersection: Array.from(intersection),
            set1Size: set1.size,
            set2Size: set2.size
          });
        }
      }
    }
    
    // Sort by overlap percentage (highest first)
    return suggestions.sort((a, b) => b.overlapPercentage - a.overlapPercentage);
  }

  // Get detailed analysis for a specific playlist pair
  getDetailedAnalysis(playlist1Id, playlist2Id) {
    const set1 = this.playlistSongSets.get(playlist1Id);
    const set2 = this.playlistSongSets.get(playlist2Id);
    
    if (!set1 || !set2) {
      return null;
    }
    
    const intersection = this.getIntersection(set1, set2);
    const union = this.getUnion(set1, set2);
    const overlapPercentage = this.calculateOverlapPercentage(set1, set2);
    const jaccardSimilarity = this.calculateJaccardSimilarity(set1, set2);
    
    // Find songs unique to each playlist
    const uniqueToPlaylist1 = new Set();
    const uniqueToPlaylist2 = new Set();
    
    for (const songKey of set1) {
      if (!set2.has(songKey)) {
        uniqueToPlaylist1.add(songKey);
      }
    }
    
    for (const songKey of set2) {
      if (!set1.has(songKey)) {
        uniqueToPlaylist2.add(songKey);
      }
    }
    
    return {
      playlist1Id,
      playlist2Id,
      overlapPercentage: Math.round(overlapPercentage * 100) / 100,
      jaccardSimilarity: Math.round(jaccardSimilarity * 100) / 100,
      sharedSongs: intersection.size,
      totalUniqueSongs: union.size,
      uniqueToPlaylist1: Array.from(uniqueToPlaylist1),
      uniqueToPlaylist2: Array.from(uniqueToPlaylist2),
      intersection: Array.from(intersection),
      set1Size: set1.size,
      set2Size: set2.size
    };
  }

  // Get statistics about playlist similarities
  getSimilarityStatistics() {
    const playlistIds = Array.from(this.playlistSongSets.keys());
    const totalComparisons = (playlistIds.length * (playlistIds.length - 1)) / 2;
    
    let highSimilarityCount = 0; // ≥80%
    let mediumSimilarityCount = 0; // 50-79%
    let lowSimilarityCount = 0; // <50%
    
    for (let i = 0; i < playlistIds.length; i++) {
      for (let j = i + 1; j < playlistIds.length; j++) {
        const set1 = this.playlistSongSets.get(playlistIds[i]);
        const set2 = this.playlistSongSets.get(playlistIds[j]);
        
        if (!set1 || !set2) continue;
        
        const overlapPercentage = this.calculateOverlapPercentage(set1, set2);
        
        if (overlapPercentage >= 80) {
          highSimilarityCount++;
        } else if (overlapPercentage >= 50) {
          mediumSimilarityCount++;
        } else {
          lowSimilarityCount++;
        }
      }
    }
    
    return {
      totalPlaylists: playlistIds.length,
      totalComparisons,
      highSimilarityCount,
      mediumSimilarityCount,
      lowSimilarityCount,
      highSimilarityPercentage: (highSimilarityCount / totalComparisons) * 100
    };
  }
}

export default PlaylistMergeDetector; 