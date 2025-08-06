import PlaylistMergeDetector from './playlistMergeDetector.js';

// Test data - create playlists with overlapping songs
const createTestPlaylists = () => {
  const playlist1 = {
    id: 1,
    name: "Rock Hits",
    songs: {
      toArray: () => [
        { name: "Song A", artist: "Artist 1" },
        { name: "Song B", artist: "Artist 2" },
        { name: "Song C", artist: "Artist 3" },
        { name: "Song D", artist: "Artist 4" },
        { name: "Song E", artist: "Artist 5" }
      ]
    }
  };

  const playlist2 = {
    id: 2,
    name: "Rock Classics",
    songs: {
      toArray: () => [
        { name: "Song A", artist: "Artist 1" },
        { name: "Song B", artist: "Artist 2" },
        { name: "Song C", artist: "Artist 3" },
        { name: "Song D", artist: "Artist 4" },
        { name: "Song F", artist: "Artist 6" }
      ]
    }
  };

  const playlist3 = {
    id: 3,
    name: "Pop Hits",
    songs: {
      toArray: () => [
        { name: "Song G", artist: "Artist 7" },
        { name: "Song H", artist: "Artist 8" },
        { name: "Song I", artist: "Artist 9" }
      ]
    }
  };

  return [playlist1, playlist2, playlist3];
};

// Test the merge detector
function testPlaylistMergeDetector() {
  console.log("Testing Playlist Merge Detector...");
  
  const detector = new PlaylistMergeDetector();
  const testPlaylists = createTestPlaylists();
  
  // Update detector with test data
  detector.updatePlaylistData(testPlaylists);
  
  // Find merge suggestions
  const suggestions = detector.findMergeSuggestions(80);
  
  console.log("Merge Suggestions:", suggestions);
  
  // Test detailed analysis
  if (suggestions.length > 0) {
    const detailedAnalysis = detector.getDetailedAnalysis(
      suggestions[0].playlist1Id, 
      suggestions[0].playlist2Id
    );
    console.log("Detailed Analysis:", detailedAnalysis);
  }
  
  // Test statistics
  const stats = detector.getSimilarityStatistics();
  console.log("Similarity Statistics:", stats);
  
  console.log("Playlist merge detector test completed!");
}

export default testPlaylistMergeDetector; 