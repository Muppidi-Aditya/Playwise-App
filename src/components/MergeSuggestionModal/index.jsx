import React, { useState, useEffect } from 'react';
import { usePlaylist } from '../../PlaylistContext';
import PlaylistMergeDetector from '../../utils/playlistMergeDetector';
import './style.css';

const MergeSuggestionModal = ({ isOpen, onClose }) => {
  const { playlists, deletePlaylist } = usePlaylist();
  const [mergeDetector] = useState(() => new PlaylistMergeDetector());
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showMergeDetails, setShowMergeDetails] = useState(false);
  const [mergeInProgress, setMergeInProgress] = useState(false);

  useEffect(() => {
    if (isOpen && playlists.length > 1) {
      // Update detector with current playlist data
      mergeDetector.updatePlaylistData(playlists);
      
      // Find merge suggestions
      const newSuggestions = mergeDetector.findMergeSuggestions(80);
      setSuggestions(newSuggestions);
    }
  }, [isOpen, playlists, mergeDetector]);

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowMergeDetails(true);
  };

  const handleMergePlaylists = async () => {
    if (!selectedSuggestion) return;

    setMergeInProgress(true);
    
    try {
      // For now, we'll just delete the smaller playlist
      // In a real implementation, you might want to merge the songs into one playlist
      const { playlist1Id, playlist2Id, set1Size, set2Size } = selectedSuggestion;
      
      // Delete the smaller playlist (you could also merge songs into the larger one)
      const playlistToDelete = set1Size <= set2Size ? playlist1Id : playlist2Id;
      
      if (confirm(`This will delete one of the playlists. Are you sure?`)) {
        deletePlaylist(playlistToDelete);
        setShowMergeDetails(false);
        setSelectedSuggestion(null);
        onClose();
      }
    } catch (error) {
      console.error('Error merging playlists:', error);
    } finally {
      setMergeInProgress(false);
    }
  };

  const getPlaylistName = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist ? playlist.name : 'Unknown Playlist';
  };

  const getPlaylistSize = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist ? playlist.songs.getSize() : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="merge-suggestion-modal-overlay">
      <div className="merge-suggestion-modal">
        <div className="modal-header">
          <h2>🎵 Playlist Merge Suggestions</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {suggestions.length === 0 ? (
            <div className="no-suggestions">
              <div className="no-suggestions-icon">🎉</div>
              <h3>No Merge Suggestions</h3>
              <p>Great! Your playlists are well-organized with minimal overlap.</p>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">{playlists.length}</span>
                  <span className="stat-label">Playlists</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">High Overlap</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="suggestions-header">
                <h3>Found {suggestions.length} playlist(s) with ≥80% overlap</h3>
                <p>These playlists have very similar content and might benefit from merging.</p>
              </div>

              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-playlists">
                      <div className="playlist-info">
                        <span className="playlist-name">{getPlaylistName(suggestion.playlist1Id)}</span>
                        <span className="playlist-size">{getPlaylistSize(suggestion.playlist1Id)} songs</span>
                      </div>
                      <div className="merge-arrow">→</div>
                      <div className="playlist-info">
                        <span className="playlist-name">{getPlaylistName(suggestion.playlist2Id)}</span>
                        <span className="playlist-size">{getPlaylistSize(suggestion.playlist2Id)} songs</span>
                      </div>
                    </div>
                    <div className="suggestion-stats">
                      <div className="overlap-percentage">
                        <span className="percentage">{suggestion.overlapPercentage}%</span>
                        <span className="label">Overlap</span>
                      </div>
                      <div className="shared-songs">
                        <span className="count">{suggestion.sharedSongs}</span>
                        <span className="label">Shared Songs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {showMergeDetails && selectedSuggestion && (
          <div className="merge-details-modal">
            <div className="details-header">
              <h3>Merge Details</h3>
              <button className="close-details" onClick={() => setShowMergeDetails(false)}>✕</button>
            </div>
            
            <div className="details-content">
              <div className="playlist-comparison">
                <div className="playlist-card">
                  <h4>{getPlaylistName(selectedSuggestion.playlist1Id)}</h4>
                  <p>{getPlaylistSize(selectedSuggestion.playlist1Id)} songs</p>
                </div>
                <div className="comparison-stats">
                  <div className="overlap-circle">
                    <span className="overlap-text">{selectedSuggestion.overlapPercentage}%</span>
                    <span className="overlap-label">Overlap</span>
                  </div>
                </div>
                <div className="playlist-card">
                  <h4>{getPlaylistName(selectedSuggestion.playlist2Id)}</h4>
                  <p>{getPlaylistSize(selectedSuggestion.playlist2Id)} songs</p>
                </div>
              </div>
              
              <div className="merge-actions">
                <button 
                  className="merge-button"
                  onClick={handleMergePlaylists}
                  disabled={mergeInProgress}
                >
                  {mergeInProgress ? 'Merging...' : 'Merge Playlists'}
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => setShowMergeDetails(false)}
                  disabled={mergeInProgress}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MergeSuggestionModal; 