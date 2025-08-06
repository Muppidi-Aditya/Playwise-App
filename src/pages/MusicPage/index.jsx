import React, { useState, useEffect, useRef, useContext } from "react";
import LikedSongsContext from "../../LikedSongsContext";
import AddToPlaylistModal from "../../components/AddToPlaylistModal";
import { usePlaylist } from "../../PlaylistContext";
import songStack from "../../utils/songStack";


export default function MusicPlayer({ song: propSong, onBack, allSongs = [], playlistId = null, songIndexInPlaylist = null }) {
  const { addLikedSong, removeLikedSong, isSongLiked } = useContext(LikedSongsContext);
  const { deleteSongFromPlaylist } = usePlaylist();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isRepeated, setIsRepeated] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [listeningStartTime, setListeningStartTime] = useState(null);
  
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  

  // Initialize current song and find its index in the playlist
  useEffect(() => {
    if (propSong) {
      setCurrentSong(propSong);
      const songIndex = allSongs.findIndex(song => song.id === propSong.id);
      setCurrentSongIndex(songIndex >= 0 ? songIndex : 0);
      
      // Reset listening timer for new song
      setListeningStartTime(null);
    }
  }, [propSong, allSongs]);

  // Default song if no song is provided
  const defaultSong = {
    id: 1,
    name: "Tum Hi Ho",
    artist: "Arijit Singh",
    rating: 4.9,
    duration: "4:28",
    movie: "Aashiqui 2",
    genre: "Romantic",
    imgUrl: "https://i.scdn.co/image/ab67616d0000b2736404721c1943d5069f0805f3",
    youtubeId: "Umqb9KENgmk"
  };

  const activeSong = currentSong || propSong || defaultSong;

  // Load YouTube API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true);
      return;
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true);
    };

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Initialize player when API is loaded or song changes
  useEffect(() => {
    if (!apiLoaded) return;

    // Reset player state
    setIsPlaying(false);
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);

    // Destroy existing player
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying player:', error);
      }
    }

    // Create new player
    try {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: activeSong.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
          rel: 0,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            try {
              setIsReady(true);
              const dur = event.target.getDuration();
              setDuration(dur || 0);
              event.target.setVolume(volume);
            } catch (error) {
              console.warn('Error in onReady:', error);
            }
          },
          onStateChange: (event) => {
            try {
              const state = event.data;
              setIsPlaying(state === window.YT.PlayerState.PLAYING);
              
              if (state === window.YT.PlayerState.PLAYING) {
                startTimeUpdate();
                startListeningTimer(); // Start listening timer when song starts playing
              } else if (state === window.YT.PlayerState.ENDED) {
                stopTimeUpdate();
                handleSongEnd();
              } else {
                stopTimeUpdate();
              }
            } catch (error) {
              console.warn('Error in onStateChange:', error);
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            setIsReady(false);
          }
        }
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }

    return () => {
      stopTimeUpdate();
    };
  }, [apiLoaded, activeSong.youtubeId]);

  // Track listening time for next song restriction
  const startListeningTimer = () => {
    if (!listeningStartTime) {
      setListeningStartTime(Date.now());
      // Add song to the stack when it starts playing
      songStack.push(activeSong);
    }
  };

  const checkListeningTime = () => {
    if (!listeningStartTime) return false;
    
    const listeningDuration = (Date.now() - listeningStartTime) / 1000; // Convert to seconds
    return listeningDuration >= 30; // 30 seconds requirement
  };

  const getRemainingTime = () => {
    if (!listeningStartTime) return 30;
    
    const listeningDuration = (Date.now() - listeningStartTime) / 1000;
    const remaining = Math.max(0, 30 - listeningDuration);
    return Math.ceil(remaining);
  };

  // Update remaining time display every second
  useEffect(() => {
    if (!listeningStartTime || checkListeningTime()) return;

    const interval = setInterval(() => {
      // Force re-render to update the remaining time display
      // This will trigger a re-render to update the countdown
    }, 1000);

    return () => clearInterval(interval);
  }, [listeningStartTime, checkListeningTime]);

  const handleSongEnd = () => {
    if (isRepeated) {
      replaySong();
    } else {
      nextSong();
    }
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time || 0);
        } catch (error) {
          console.warn('Error getting current time:', error);
        }
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current || !isReady) return;
    
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.warn('Error toggling play/pause:', error);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressChange = (e) => {
    if (!playerRef.current || !isReady || !duration) return;
    
    try {
      const newTime = (e.target.value / 100) * duration;
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.warn('Error seeking:', error);
    }
  };

  // Handle volume changes separately to avoid player recreation
  useEffect(() => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.setVolume(volume);
      } catch (error) {
        console.warn('Error setting volume:', error);
      }
    }
  }, [volume, isReady]);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value) || 0;
    setVolume(newVolume);
  };

  const toggleLike = () => {
    if (isSongLiked(activeSong.id)) {
      removeLikedSong(activeSong.id);
    } else {
      addLikedSong(activeSong);
    }
  };
  const toggleRepeat = () => setIsRepeated(!isRepeated);

  const nextSong = () => {
    if (allSongs.length === 0) return;
    
    // Check if user has listened for at least 30 seconds
    if (!checkListeningTime()) {
      const remainingTime = 30 - ((Date.now() - (listeningStartTime || Date.now())) / 1000);
      alert(`Please listen to this song for at least 30 seconds before skipping. You need to wait ${Math.ceil(remainingTime)} more seconds.`);
      return;
    }
    
    const nextIndex = (currentSongIndex + 1) % allSongs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentSong(allSongs[nextIndex]);
    
    // Reset listening timer for the new song
    setListeningStartTime(null);
  };

  const previousSong = () => {
    if (allSongs.length === 0) return;
    
    const prevIndex = currentSongIndex === 0 ? allSongs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    setCurrentSong(allSongs[prevIndex]);
  };

  const replaySong = () => {
    if (!playerRef.current || !isReady) return;
    
    try {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
      
      if (!isPlaying) {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.warn('Error replaying song:', error);
    }
  };

  const handleDeleteSong = () => {
    if (playlistId && songIndexInPlaylist !== null) {
      if (confirm(`Are you sure you want to delete "${activeSong.name}" from this playlist?`)) {
        try {
          deleteSongFromPlaylist(playlistId, songIndexInPlaylist);
          // Go back to playlist after deletion
          if (onBack) {
            onBack();
          }
        } catch (error) {
          console.error('Error deleting song:', error);
          alert('Error deleting song from playlist');
        }
      }
    }
  };

  const progressPercentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    backgroundAnimation: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      pointerEvents: 'none'
    },
    bgCircle1: {
      position: 'absolute',
      top: '25%',
      left: '25%',
      width: '384px',
      height: '384px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      filter: 'blur(48px)',
      animation: 'pulse 2s infinite'
    },
    bgCircle2: {
      position: 'absolute',
      bottom: '25%',
      right: '25%',
      width: '320px',
      height: '320px',
      backgroundColor: '#dc2626',
      borderRadius: '50%',
      filter: 'blur(48px)',
      animation: 'pulse 2s infinite',
      animationDelay: '1s'
    },
    navbar: {
      position: 'relative',
      zIndex: 10,
      backgroundColor: 'rgba(17, 24, 39, 0.5)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(31, 41, 55, 1)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '24px'
    },
    navContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    navButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#fff'
    },
    mainContent: {
      position: 'relative',
      zIndex: 10,
      backgroundColor: 'rgba(17, 24, 39, 0.3)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(31, 41, 55, 1)',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    albumSection: {
      position: 'relative',
      height: '384px',
      background: 'linear-gradient(135deg, #7f1d1d 0%, #000 50%, #991b1b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    particlesContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none'
    },
    particle: {
      position: 'absolute',
      width: '4px',
      height: '4px',
      backgroundColor: '#fb7185',
      borderRadius: '50%',
      animation: 'pulse 3s infinite'
    },
    vinylContainer: {
      position: 'relative',
      width: '320px',
      height: '320px',
      transition: 'all 0.7s ease'
    },
    vinylDisc: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #374151 0%, #111827 50%, #000 100%)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '4px solid #374151'
    },
    vinylGroove: {
      position: 'absolute',
      borderRadius: '50%',
      border: '1px solid rgba(75, 85, 99, 0.3)'
    },
    albumCover: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '4px solid #ef4444',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
    },
    albumImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    centerHole: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '16px',
      height: '16px',
      backgroundColor: '#000',
      borderRadius: '50%',
      border: '2px solid #4b5563'
    },
    vinylShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
    },
    glowEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    glow: {
      width: '384px',
      height: '384px',
      borderRadius: '50%',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      filter: 'blur(48px)',
      animation: 'pulse 2s infinite'
    },
    controlsSection: {
      background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
      backdropFilter: 'blur(12px)',
      padding: '32px'
    },
    songInfo: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    songTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px',
      background: 'linear-gradient(to right, #fff, #d1d5db)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    artistName: {
      color: '#f87171',
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    movieName: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    progressContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px'
    },
    timeLabel: {
      fontSize: '14px',
      color: '#9ca3af',
      minWidth: '45px',
      textAlign: 'center'
    },
    progressWrapper: {
      flex: 1,
      position: 'relative'
    },
    progressTrack: {
      height: '8px',
      backgroundColor: '#374151',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(to right, #ef4444, #f87171)',
      borderRadius: '4px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    progressInput: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer'
    },
    mainControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      marginBottom: '32px'
    },
    controlButton: {
      padding: '12px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    likeButton: {
      backgroundColor: '#374151',
      color: '#d1d5db'
    },
    likeActiveButton: {
      backgroundColor: '#ef4444',
      color: '#fff',
      boxShadow: '0 10px 25px -3px rgba(239, 68, 68, 0.3)'
    },
    repeatButton: {
      backgroundColor: '#374151',
      color: '#d1d5db'
    },
    repeatActiveButton: {
      backgroundColor: '#ef4444',
      color: '#fff',
      boxShadow: '0 10px 25px -3px rgba(239, 68, 68, 0.3)'
    },
    playButton: {
      padding: '16px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'linear-gradient(to right, #ef4444, #dc2626)',
      color: '#fff',
      boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    disabledButton: {
      backgroundColor: '#6b7280',
      cursor: 'not-allowed',
      opacity: 0.5
    },
    volumeControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    },
    volumeWrapper: {
      width: '128px',
      position: 'relative'
    },
    volumeTrack: {
      height: '4px',
      backgroundColor: '#374151',
      borderRadius: '2px',
      overflow: 'hidden'
    },
    volumeFill: {
      height: '100%',
      background: 'linear-gradient(to right, #ef4444, #f87171)',
      borderRadius: '2px'
    },
    volumeInput: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer'
    },
    volumeLabel: {
      fontSize: '14px',
      color: '#9ca3af',
      minWidth: '40px',
      textAlign: 'center'
    },
    hiddenPlayer: {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      width: '1px',
      height: '1px'
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    loadingContent: {
      textAlign: 'center'
    },
    spinner: {
      width: '64px',
      height: '64px',
      border: '4px solid rgba(239, 68, 68, 0.3)',
      borderTop: '4px solid #ef4444',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },
    loadingTitle: {
      fontSize: '20px',
      fontWeight: '500',
      color: '#fff'
    },
    loadingSubtitle: {
      color: '#9ca3af',
      fontSize: '14px',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated background */}
      <div style={styles.backgroundAnimation}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
      </div>

      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <div style={styles.navContent}>
          <button 
            style={styles.navButton} 
            onClick={onBack}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'} 
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button style={styles.navButton} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Album Art Section */}
        <div style={styles.albumSection}>
          {/* Floating particles effect */}
          <div style={styles.particlesContainer}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.particle,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          {/* Vinyl Disc */}
          <div style={{
            ...styles.vinylContainer,
            animation: isPlaying ? 'spin 3s linear infinite' : 'none'
          }}>
            {/* Outer ring */}
            <div style={styles.vinylDisc}>
              {/* Vinyl grooves */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.vinylGroove,
                    top: `${10 + i * 8}px`,
                    left: `${10 + i * 8}px`,
                    right: `${10 + i * 8}px`,
                    bottom: `${10 + i * 8}px`
                  }}
                />
              ))}
              
              {/* Album cover in center */}
              <div style={styles.albumCover}>
                <img 
                  src={activeSong.imgUrl} 
                  alt={activeSong.name}
                  style={styles.albumImage}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSIjZDFkNWRiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0Ij5NdXNpYzwvdGV4dD4KPC9zdmc+';
                  }}
                />
              </div>
              
              {/* Center hole */}
              <div style={styles.centerHole} />
              
              {/* Shine effect */}
              <div style={styles.vinylShine} />
            </div>
          </div>

          {/* Glow effect around vinyl */}
          {isPlaying && (
            <div style={styles.glowEffect}>
              <div style={styles.glow} />
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div style={styles.controlsSection}>
          {/* Song Info */}
          <div style={styles.songInfo}>
            <h1 style={styles.songTitle}>
              {activeSong.name}
            </h1>
            <p style={styles.artistName}>{activeSong.artist}</p>
            <p style={styles.movieName}>{activeSong.movie}</p>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <span style={styles.timeLabel}>
              {formatTime(currentTime)}
            </span>
            
            <div style={styles.progressWrapper}>
              <div style={styles.progressTrack}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${progressPercentage}%`
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handleProgressChange}
                style={styles.progressInput}
                disabled={!isReady}
              />
            </div>
            
            <span style={styles.timeLabel}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Main Controls */}
          <div style={styles.mainControls}>
            <button 
              onClick={toggleLike}
              style={isSongLiked(activeSong.id) ? {...styles.controlButton, ...styles.likeActiveButton} : {...styles.controlButton, ...styles.likeButton}}
              onMouseOver={(e) => !isSongLiked(activeSong.id) && (e.target.style.backgroundColor = '#4b5563')}
              onMouseOut={(e) => !isSongLiked(activeSong.id) && (e.target.style.backgroundColor = '#374151')}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            
            <button 
              onClick={previousSong}
              style={{...styles.controlButton, backgroundColor: '#374151', color: '#d1d5db'}}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button 
              onClick={togglePlayPause}
              disabled={!isReady}
              style={isReady ? styles.playButton : {...styles.playButton, ...styles.disabledButton}}
              onMouseOver={(e) => isReady && (e.target.style.background = 'linear-gradient(to right, #f87171, #ef4444)')}
              onMouseOut={(e) => isReady && (e.target.style.background = 'linear-gradient(to right, #ef4444, #dc2626)')}
            >
              {isPlaying ? (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24" style={{marginLeft: '4px'}}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button 
              onClick={nextSong}
              disabled={!checkListeningTime()}
              style={{
                ...styles.controlButton, 
                backgroundColor: checkListeningTime() ? '#374151' : '#1f2937', 
                color: checkListeningTime() ? '#d1d5db' : '#6b7280',
                cursor: checkListeningTime() ? 'pointer' : 'not-allowed',
                opacity: checkListeningTime() ? 1 : 0.5
              }}
              onMouseOver={(e) => {
                if (checkListeningTime()) {
                  e.target.style.backgroundColor = '#4b5563';
                }
              }}
              onMouseOut={(e) => {
                if (checkListeningTime()) {
                  e.target.style.backgroundColor = '#374151';
                }
              }}
              title={checkListeningTime() ? 'Next Song' : `Wait ${getRemainingTime()}s to skip`}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
              {!checkListeningTime() && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {getRemainingTime()}s
                </span>
              )}
            </button>
            
            {/* <button 
              onClick={toggleRepeat}
              style={isRepeated ? {...styles.controlButton, ...styles.repeatActiveButton} : {...styles.controlButton, ...styles.repeatButton}}
              onMouseOver={(e) => !isRepeated && (e.target.style.backgroundColor = '#4b5563')}
              onMouseOut={(e) => !isRepeated && (e.target.style.backgroundColor = '#374151')}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            </button> */}

            {/* Add to Playlist button - only show when NOT playing from a playlist */}
            {!playlistId && (
              <button 
                onClick={() => setShowAddToPlaylistModal(true)}
                style={{...styles.controlButton, backgroundColor: '#374151', color: '#d1d5db'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
                title="Add to Playlist"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            )}

            {/* Delete button - only show if playing from a playlist */}
            {playlistId && songIndexInPlaylist !== null && (
              <button 
                onClick={handleDeleteSong}
                style={{...styles.controlButton, backgroundColor: '#dc2626', color: '#ffffff'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                title="Delete from Playlist"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Volume Control */}
          <div style={styles.volumeControls}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{color: '#9ca3af'}}>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div style={styles.volumeWrapper}>
              <div style={styles.volumeTrack}>
                <div 
                  style={{
                    ...styles.volumeFill,
                    width: `${volume}%`
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                style={styles.volumeInput}
              />
            </div>
            <span style={styles.volumeLabel}>{volume}%</span>
          </div>
        </div>
      </div>

      {/* Hidden YouTube player */}
      <div id="youtube-player" style={styles.hiddenPlayer} />

      {/* Loading overlay */}
      {(!isReady || !apiLoaded) && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner} />
            <div style={styles.loadingTitle}>Loading audio...</div>
            <div style={styles.loadingSubtitle}>Please wait while we prepare your music</div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal 
        isOpen={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(false)}
        currentSong={activeSong}
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ef4444;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ef4444;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          }
        `}
      </style>
    </div>
  );
}