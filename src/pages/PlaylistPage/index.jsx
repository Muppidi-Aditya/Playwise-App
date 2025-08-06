import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LikedSongsContext from "../../LikedSongsContext";
import { usePlaylist } from "../../PlaylistContext";
import SongComponent from "../../components/SongComponent";
import MusicPlayer from "../MusicPage";
import "./style.css";

export default function PlaylistPage({ playlistType, onBack }) {
  const { type } = useParams();
  const navigate = useNavigate();
  const actualPlaylistType = playlistType || type || "liked";
  const { likedSongs, reverseLikedSongs } = useContext(LikedSongsContext);
  const { playlists } = usePlaylist();
  
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const actionsRef = useRef(null);

  const getPlaylistTitle = () => {
    switch (actualPlaylistType) {
      case "liked":
        return "Liked Songs";
      default:
        return "Playlist";
    }
  };

  const getPlaylistSongs = () => {
    switch (actualPlaylistType) {
      case "liked":
        return likedSongs || [];
      default:
        return [];
    }
  };

  const songs = getPlaylistSongs();

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

  const handleReversePlaylist = () => {
    if (confirm("Are you sure you want to reverse your liked songs?")) {
      try {
        reverseLikedSongs();
        setMessage('Liked songs reversed successfully!');
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
      } catch (error) {
        setMessage('Error reversing liked songs');
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 2000);
      }
    }
    setShowActions(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  // If music player should be shown, render it instead of the playlist page
  if (showMusicPlayer && currentSong) {
    return (
      <MusicPlayer 
        song={currentSong} 
        onBack={handleBackFromPlayer}
        allSongs={songs}
      />
    );
  }

  return (
    <div className="playlist-page">
      {/* Header */}
      <div className="playlist-header">
        <button className="back-button" onClick={onBack || (() => navigate(-1))}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="playlist-info">
          <h1 className="playlist-title">{getPlaylistTitle()}</h1>
          <p className="playlist-subtitle">{songs.length} songs</p>
        </div>
        {actualPlaylistType === "liked" && (
          <div className="playlist-actions" ref={actionsRef}>
            <button 
              className="action-button"
              onClick={() => setShowActions(!showActions)}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Actions Menu */}
      {actualPlaylistType === "liked" && showActions && (
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
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Songs List */}
      <div className="playlist-songs">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <SongComponent 
              key={song.id} 
              song={song} 
              index={index + 1}
              onSongClick={handleSongClick}
            />
          ))
        ) : (
          <div className="empty-playlist">
            <div className="empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="empty-title">No liked songs yet</h3>
            <p className="empty-subtitle">Start liking songs to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
} 