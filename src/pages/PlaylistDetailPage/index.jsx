import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylist } from "../../PlaylistContext";
import SongComponent from "../../components/SongComponent";
import MusicPlayer from "../MusicPage";
import AddSongModal from "../../components/AddSongModal";
import "./style.css";

export default function PlaylistDetailPage() {
  const { playlistName } = useParams();
  const navigate = useNavigate();
  const { playlists, deleteSongFromPlaylist, moveSongInPlaylist, reversePlaylist, sortPlaylist, getPlaylistSongs, playlistUpdateTrigger } = usePlaylist();
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showMoveSongModal, setShowMoveSongModal] = useState(false);
  const [selectedSongForMove, setSelectedSongForMove] = useState(null);
  const [movePosition, setMovePosition] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Get playlist ID from URL
  const playlistId = parseInt(playlistName);
  
  // Find the playlist by ID
  const playlist = playlists.find(p => p.id === playlistId);
  
  console.log('PlaylistDetailPage - playlistId from URL:', playlistId);
  console.log('PlaylistDetailPage - all playlists:', playlists);
  console.log('PlaylistDetailPage - found playlist:', playlist);

  // Force re-render when playlist changes
  useEffect(() => {
    console.log('PlaylistDetailPage - playlist updated');
  }, [playlist, playlists, playlistUpdateTrigger]);

  const handleSongClick = (song, event) => {
    // Prevent event bubbling to parent components
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setCurrentSong(song);
    setShowMusicPlayer(true);
  };

  const handleBackFromPlayer = () => {
    setShowMusicPlayer(false);
    setCurrentSong(null);
  };

  const handleDeleteSong = (index) => {
    if (playlist && confirm(`Are you sure you want to delete "${playlist.songs.getSongAt(index).name}"?`)) {
      try {
        deleteSongFromPlaylist(playlist.id, index);
        setMessage('Song deleted successfully!');
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
      } catch {
        setMessage('Error deleting song');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
      }
    }
  };



  const handleReversePlaylist = () => {
    if (playlist && confirm("Are you sure you want to reverse this playlist?")) {
      try {
        reversePlaylist(playlist.id);
        setMessage('Playlist reversed successfully!');
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
      } catch {
        setMessage('Error reversing playlist');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
      }
    }
  };

  const handleLongPress = (song, index) => {
    setSelectedSongForMove({ song, index });
    setShowMoveSongModal(true);
  };

  const handleMoveSongToPosition = () => {
    if (!selectedSongForMove || !playlist) return;

    const position = parseInt(movePosition);
    const currentIndex = selectedSongForMove.index;
    const playlistSize = playlist.songs.getSize();

    // Validation
    if (isNaN(position) || position < 1 || position > playlistSize) {
      setMessage(`Invalid position! Please enter a number between 1 and ${playlistSize}`);
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    if (position === currentIndex + 1) {
      setMessage('Song is already at this position!');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
      return;
    }

    try {
      moveSongInPlaylist(playlist.id, currentIndex, position - 1);
      setMessage(`Song moved to position ${position} successfully!`);
      setMessageType('success');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
      setShowMoveSongModal(false);
      setSelectedSongForMove(null);
      setMovePosition('');
    } catch {
      setMessage('Error moving song');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
    }
  };

  const handleCloseMoveModal = () => {
    setShowMoveSongModal(false);
    setSelectedSongForMove(null);
    setMovePosition('');
  };



  const handleSortPlaylist = () => {
    if (!playlist) return;

    try {
      // Use the new sortPlaylist function from context
      sortPlaylist(playlist.id, sortCriteria, sortOrder);

      setMessage(`Playlist sorted by ${sortCriteria} (${sortOrder === 'asc' ? 'ascending' : 'descending'}) successfully!`);
      setMessageType('success');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
      
      setShowSortModal(false);
    } catch (error) {
      console.error('Error sorting playlist:', error);
      setMessage('Error sorting playlist');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
    }
  };

  const handleCloseSortModal = () => {
    setShowSortModal(false);
    setSortCriteria('title');
    setSortOrder('asc');
  };

  // Get songs as array for display
  const songs = playlist ? getPlaylistSongs(playlist.id) : [];
  console.log('PlaylistDetailPage - songs array:', songs);

  // If playlist not found
  if (!playlist) {
    return (
      <div className="playlist-detail-page">
        <div className="playlist-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="playlist-info">
            <h1 className="playlist-title">Playlist Not Found</h1>
          </div>
        </div>
        <div className="playlist-content">
          <p>The playlist you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // If music player should be shown, render it instead of the playlist detail page
  if (showMusicPlayer && currentSong) {
    // Find the current song's index in the playlist
    const currentSongIndex = songs.findIndex(song => song.id === currentSong.id);
    
    return (
      <MusicPlayer 
        song={currentSong} 
        onBack={handleBackFromPlayer}
        allSongs={songs}
        playlistId={playlistId}
        songIndexInPlaylist={currentSongIndex}
      />
    );
  }

  return (
    <div className="playlist-detail-page">
      {/* Header */}
      <div className="playlist-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="playlist-info">
          <h1 className="playlist-title">{playlist.name}</h1>
          <p className="playlist-subtitle">{playlist.songs.getSize()} songs</p>
          {playlist.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}
        </div>
        <div className="playlist-actions">
          <button 
            className="action-button"
            onClick={() => {
              console.log('Three dots clicked, current showActions:', showActions);
              setShowActions(!showActions);
              console.log('Setting showActions to:', !showActions);
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Actions Menu */}
      {console.log('Rendering actions menu, showActions:', showActions)}
      {showActions && (
        <div className="actions-menu">
          <button 
            className="action-item"
            onClick={handleReversePlaylist}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
            Reverse Playlist
          </button>
          <button 
            className="action-item"
            onClick={() => setShowSortModal(true)}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
            </svg>
            Sort Playlist
          </button>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Playlist Cover */}
      <div className="playlist-cover">
        <div className="playlist-letter">
          {playlist.image || playlist.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Songs List */}
      <div className="playlist-songs">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div 
              key={song.id} 
              className="song-item-with-actions"
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(song, index);
              }}
              onTouchStart={(e) => {
                const touchTimer = setTimeout(() => {
                  handleLongPress(song, index);
                }, 500);
                e.currentTarget.touchTimer = touchTimer;
              }}
              onTouchEnd={(e) => {
                if (e.currentTarget.touchTimer) {
                  clearTimeout(e.currentTarget.touchTimer);
                }
              }}
              onMouseDown={(e) => {
                const mouseTimer = setTimeout(() => {
                  handleLongPress(song, index);
                }, 500);
                e.currentTarget.mouseTimer = mouseTimer;
              }}
              onMouseUp={(e) => {
                if (e.currentTarget.mouseTimer) {
                  clearTimeout(e.currentTarget.mouseTimer);
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.mouseTimer) {
                  clearTimeout(e.currentTarget.mouseTimer);
                }
              }}
            >
              <SongComponent 
                song={song} 
                index={index + 1}
                onSongClick={handleSongClick}
              />
              <div className="song-actions">
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteSong(index)}
                  title="Delete Song"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-playlist">
            <div className="empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="empty-title">No songs in this playlist</h3>
            <p className="empty-subtitle">Add some songs to get started</p>
          </div>
        )}
      </div>
      
      {/* Add Song Modal */}
      <AddSongModal 
        isOpen={showAddSongModal}
        onClose={() => setShowAddSongModal(false)}
        playlistId={playlist?.id}
      />

      {/* Move Song Modal */}
      {showMoveSongModal && selectedSongForMove && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Move Song</h3>
            <p>Move "{selectedSongForMove.song.name}" to position:</p>
            <input
              type="number"
              value={movePosition}
              onChange={(e) => setMovePosition(e.target.value)}
              placeholder={`1-${playlist?.songs.getSize() || 1}`}
              min="1"
              max={playlist?.songs.getSize() || 1}
              className="position-input"
            />
            <div className="modal-actions">
              <button onClick={handleMoveSongToPosition} className="confirm-button">
                Move
              </button>
              <button onClick={handleCloseMoveModal} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Playlist Modal */}
      {showSortModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sort Playlist</h3>
            <p>Choose sorting criteria and order:</p>
            
            <div className="sort-options">
              <div className="sort-criteria">
                <label>Sort by:</label>
                <select 
                  value={sortCriteria} 
                  onChange={(e) => setSortCriteria(e.target.value)}
                  className="sort-select"
                >
                  <option value="title">Song Title</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
              
              <div className="sort-order">
                <label>Order:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="asc">Ascending (A-Z / Shortest first)</option>
                  <option value="desc">Descending (Z-A / Longest first)</option>
                </select>
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={handleSortPlaylist} className="confirm-button">
                Sort
              </button>
              <button onClick={handleCloseSortModal} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 