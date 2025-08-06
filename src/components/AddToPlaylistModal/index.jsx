import React, { useState } from 'react';
import { usePlaylist } from '../../PlaylistContext';
import './style.css';

const AddToPlaylistModal = ({ isOpen, onClose, currentSong }) => {
  const { playlists, addSongToPlaylist } = usePlaylist();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId || !currentSong) return;

    setIsAdding(true);
    setMessage('');
    setMessageType('');
    
    try {
      // Add the current song to the selected playlist
      const success = addSongToPlaylist(
        parseInt(selectedPlaylistId),
        currentSong.name,
        currentSong.artist,
        currentSong.duration,
        currentSong.imgUrl,
        currentSong.youtubeId
      );
      
      if (success) {
        setMessage('Song added to playlist successfully!');
        setMessageType('success');
        // Reset form and close modal after a short delay
        setTimeout(() => {
          setSelectedPlaylistId('');
          onClose();
        }, 1500);
      } else {
        setMessage('This song is already in the playlist!');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      setMessage('Error adding song to playlist');
      setMessageType('error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedPlaylistId('');
    onClose();
  };

  if (!isOpen || !currentSong) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to Playlist</h2>
          <button className="close-button" onClick={handleClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {/* Current Song Info */}
          <div className="current-song-info">
            <div className="song-cover">
              <img 
                src={currentSong.imgUrl} 
                alt={currentSong.name}
                onError={(e) => {
                  e.target.src = 'https://i.scdn.co/image/ab67616d0000b27325fa8e214ad888b7d291f25e';
                }}
              />
            </div>
            <div className="song-details">
              <h3 className="song-title">{currentSong.name}</h3>
              <p className="song-artist">{currentSong.artist}</p>
              <p className="song-duration">{currentSong.duration}</p>
            </div>
          </div>

          {/* Playlist Selection */}
          <div className="playlist-selection">
            <label htmlFor="playlist-select" className="form-label">
              Choose a playlist:
            </label>
            <select
              id="playlist-select"
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
              className="playlist-select"
            >
              <option value="">Select a playlist...</option>
              {playlists.map(playlist => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name} ({playlist.songs.getSize()} songs)
                </option>
              ))}
            </select>
          </div>

          {playlists.length === 0 && (
            <div className="no-playlists">
              <p>You don't have any playlists yet.</p>
              <p>Create a playlist first to add songs to it.</p>
            </div>
          )}
          
          {/* Message Display */}
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="add-button"
            onClick={handleAddToPlaylist}
            disabled={!selectedPlaylistId || isAdding}
          >
            {isAdding ? 'Adding...' : 'Add to Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal; 