import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import indianSongs from '../../music.js';
import './style.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [topDurationSongs, setTopDurationSongs] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [artistTopSongs, setArtistTopSongs] = useState({});

  useEffect(() => {
    calculateDashboardData();
  }, []);

  const calculateDashboardData = () => {
    // Convert duration string to minutes for sorting
    const parseDuration = (duration) => {
      const [minutes, seconds] = duration.split(':').map(Number);
      return minutes + seconds / 60;
    };

    // Get top 5 duration songs
    const sortedByDuration = [...indianSongs]
      .sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration))
      .slice(0, 5);
    setTopDurationSongs(sortedByDuration);

    // Calculate rating statistics
    const ratingCounts = {};
    indianSongs.forEach(song => {
      const rating = Math.floor(song.rating);
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    setRatingStats(ratingCounts);

    // Get top 5 rated songs for each artist
    const artistSongs = {};
    indianSongs.forEach(song => {
      if (!artistSongs[song.artist]) {
        artistSongs[song.artist] = [];
      }
      artistSongs[song.artist].push(song);
    });

    const topSongsByArtist = {};
    Object.keys(artistSongs).forEach(artist => {
      const topSongs = artistSongs[artist]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      topSongsByArtist[artist] = topSongs;
    });
    setArtistTopSongs(topSongsByArtist);
  };

  const formatDuration = (duration) => {
    return duration;
  };

  const handleSongClick = (song) => {
    navigate('/music', { state: { song } });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1>Music Dashboard</h1>
      </div>

      <div className="dashboard-content">
        {/* Top 5 Duration Songs */}
        <div className="dashboard-section">
          <h2>Top 5 Longest Songs</h2>
          <div className="songs-grid">
            {topDurationSongs.map((song, index) => (
              <div key={song.id} className="song-card" onClick={() => handleSongClick(song)}>
                <div className="song-rank">{index + 1}</div>
                <img src={song.imgUrl} alt={song.name} className="song-image" />
                <div className="song-info">
                  <h3>{song.name}</h3>
                  <p className="artist">{song.artist}</p>
                  <p className="duration">{formatDuration(song.duration)}</p>
                  <div className="rating">
                    <span className="stars">{'★'.repeat(Math.floor(song.rating))}</span>
                    <span className="rating-value">{song.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Statistics */}
        <div className="dashboard-section">
          <h2>Song Rating Distribution</h2>
          <div className="rating-stats">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-stat">
                <div className="rating-label">
                  <span className="stars">{'★'.repeat(rating)}</span>
                  <span className="rating-text">{rating}+ Stars</span>
                </div>
                <div className="rating-count">
                  {ratingStats[rating] || 0} songs
                </div>
                <div className="rating-bar">
                  <div 
                    className="rating-fill" 
                    style={{ 
                      width: `${((ratingStats[rating] || 0) / indianSongs.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Songs by Artist */}
        <div className="dashboard-section">
          <h2>Top 5 Rated Songs by Artist</h2>
          <div className="artist-sections">
            {Object.keys(artistTopSongs).map(artist => (
              <div key={artist} className="artist-section">
                <h3 className="artist-name">{artist}</h3>
                <div className="artist-songs">
                  {artistTopSongs[artist].map((song, index) => (
                    <div key={song.id} className="artist-song-card" onClick={() => handleSongClick(song)}>
                      <div className="song-rank-small">{index + 1}</div>
                      <img src={song.imgUrl} alt={song.name} className="song-image-small" />
                      <div className="song-info-small">
                        <h4>{song.name}</h4>
                        <p className="movie">{song.movie}</p>
                        <div className="rating-small">
                          <span className="stars">{'★'.repeat(Math.floor(song.rating))}</span>
                          <span className="rating-value">{song.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 