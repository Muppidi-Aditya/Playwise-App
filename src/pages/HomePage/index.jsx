import React, { Component } from "react";
import './style.css';

// Import music data
import indianSongs from "../../music.js";

import Navbar from "../../components/Navbar";
import SongComponent from "../../components/SongComponent";
import FooterMenuContext from "../../FooterMenuContext";

import MusicPlayer from "../MusicPage"; // Import the MusicPlayer component

import SearchPage from "../SearchPage";
import LibraryPage from "../LibraryPage";
import songStack from "../../utils/songStack";
import RatingBST from "../../utils/ratingBST";

const personImages = [
  "https://i.scdn.co/image/ab6761610000e5eb5ba2d75eb08a2d672f9b69b7",
 "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da843f62d1e7cabffe4511903b9f",
 "https://i.scdn.co/image/ab67616100005174c9ac92d87de28795c1c49730",
 "https://i.scdn.co/image/ab6761610000e5eba0199b159c0c5a9f62333d32",
 "https://in.bmscdn.com/iedb/artist/images/website/poster/large/a_r_rahman_38.jpg",
 "https://i.scdn.co/image/ab6761610000e5eb77c63908ac248d3bf6d42f27",
 "https://i.scdn.co/image/ab6761610000e5eb7b386b1320742bd6686854e7",
 "https://i.scdn.co/image/ab6761610000e5eba80a803733f6a070e8f873fb",
 "https://i.scdn.co/image/ab6761610000e5eba45f7ef3e1c982461f2dad6b",
 "https://i.scdn.co/image/ab6761610000e5eba45f7ef3e1c982461f2dad6b",
 ];

const genreList = [
  "Romantic", "Dance", "Sad", "Folk", "Retro",
  "Sufi", "Classical", "Patriotic", "Rock"
];

// Artist names corresponding to the images
const artistNames = [
  "Arijit Singh", "Shreya Ghoshal", "A.R. Rahman", "Sonu Nigam",
  "Lata Mangeshkar", "Kishore Kumar", "Rahat Fateh Ali Khan",
  "Armaan Malik", "Sunidhi Chauhan", "Udit Narayan"
];

class HomePage extends Component {
  state = {
    selectedMenuTab: 'artists',
    selectedImageIndex: 0,
    selectedGenreIndex: 0,
    showMusicPlayer: false,
    currentSong: null,
    searchResults: [],
    topDurationSongs: [],
    ratingStats: {},
    artistTopSongs: {},
    showThreeDotsMenu: false,
    ratingFilter: null,
    ratingBST: null,
  };

  static contextType = FooterMenuContext;

  componentDidMount() {
    this.calculateDashboardData();
    this.initializeRatingBST();
    // Add click outside handler for three dots menu
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    // Remove click outside handler
    document.removeEventListener('click', this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (this.state.showThreeDotsMenu && !event.target.closest('.three-dots-menu-container')) {
      this.setState({ showThreeDotsMenu: false });
    }
  };

  changeSelectedTab = (tab) => {
    this.setState({
      selectedMenuTab: tab,
      selectedImageIndex: 0,
    });
  };

  handleImageClick = (index) => {
    this.setState({ selectedImageIndex: index });
  };

  handleGenreClick = (index) => {
    this.setState({
      selectedGenreIndex: index
    });
  }

  // Handle song click - open music player with selected song
  handleSongClick = (song) => {
    this.setState({
      showMusicPlayer: true,
      currentSong: song
    });
    this.context.setIsMusicPlayerActive(true);
  };

  // Handle back from music player
  handleBackFromPlayer = () => {
    this.setState({
      showMusicPlayer: false,
      currentSong: null
    });
    this.context.setIsMusicPlayerActive(false);
  };

  // Handle song click from search page
  handleSearchSongClick = (song, searchResults) => {
    this.setState({
      showMusicPlayer: true,
      currentSong: song,
      searchResults: searchResults || []
    });
    this.context.setIsMusicPlayerActive(true);
  };

  // Toggle three dots menu
  toggleThreeDotsMenu = () => {
    this.setState(prevState => ({
      showThreeDotsMenu: !prevState.showThreeDotsMenu
    }));
  };

  // Initialize rating BST
  initializeRatingBST = () => {
    const ratingBST = new RatingBST();
    ratingBST.buildFromSongs(indianSongs);
    this.setState({ ratingBST });
  };

  // Handle rating filter
  handleRatingFilter = (threshold) => {
    this.setState({
      ratingFilter: threshold,
      showThreeDotsMenu: false
    });
  };

  // Clear rating filter
  clearRatingFilter = () => {
    this.setState({
      ratingFilter: null
    });
  };

  // Handle play last played song
  handlePlayLastPlayedSong = () => {
    const lastPlayedSong = songStack.peek();
    if (lastPlayedSong) {
      this.setState({
        showMusicPlayer: true,
        currentSong: lastPlayedSong,
        showThreeDotsMenu: false
      });
      this.context.setIsMusicPlayerActive(true);
    } else {
      alert("No recently played songs found.");
    }
  };

  // Calculate dashboard data
  calculateDashboardData = () => {
    // Convert duration string to minutes for sorting
    const parseDuration = (duration) => {
      const [minutes, seconds] = duration.split(':').map(Number);
      return minutes + seconds / 60;
    };

    // Get top 5 duration songs
    const sortedByDuration = [...indianSongs]
      .sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration))
      .slice(0, 5);
    this.setState({ topDurationSongs: sortedByDuration });

    // Calculate rating statistics
    const ratingCounts = {};
    indianSongs.forEach(song => {
      const rating = Math.floor(song.rating);
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    this.setState({ ratingStats: ratingCounts });

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
    this.setState({ artistTopSongs: topSongsByArtist });
  };

  // Filter songs based on selected tab and filters
  getFilteredSongs = () => {
    const { selectedMenuTab, selectedImageIndex, selectedGenreIndex, ratingFilter, ratingBST } = this.state;
    
    let filteredSongs = [];
    
    if (selectedMenuTab === 'artists') {
      const selectedArtist = artistNames[selectedImageIndex];
      filteredSongs = indianSongs.filter(song => 
        song.artist.toLowerCase().includes(selectedArtist.toLowerCase()) ||
        selectedArtist.toLowerCase().includes(song.artist.toLowerCase())
      );
    } else if (selectedMenuTab === 'genre') {
      const selectedGenre = genreList[selectedGenreIndex];
      filteredSongs = indianSongs.filter(song => 
        song.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    } else {
      // Dashboard - show all songs
      filteredSongs = indianSongs;
    }

    // Apply rating filter if set
    if (ratingFilter && ratingBST) {
      const songsAboveRating = ratingBST.getSongsAboveRating(ratingFilter);
      const songIdsAboveRating = new Set(songsAboveRating.map(song => song.id));
      filteredSongs = filteredSongs.filter(song => songIdsAboveRating.has(song.id));
    }

    return filteredSongs;
  };

  RenderHomePageSongOptions = () => {
    const { selectedMenuTab } = this.state;
    return (
      <div className="home-page-menu-options scroll-hidden">
        <h1 
          id="tab-artists" 
          onClick={() => this.changeSelectedTab('artists')} 
          style={{
            color: selectedMenuTab === 'artists' ? '#ff3130' : 'gray',
            fontSize: selectedMenuTab === 'artists' ? '70px' : '50px',
            cursor: 'pointer'
          }}
        >
          Artists
        </h1>

        <h1 
          id="tab-genre" 
          onClick={() => this.changeSelectedTab('genre')} 
          style={{
            color: selectedMenuTab === 'genre' ? '#ff3130' : 'gray',
            fontSize: selectedMenuTab === 'genre' ? '70px' : '50px',
            cursor: 'pointer'
          }}
        >
          Genre
        </h1>

        <h1 
          id="tab-dashboard" 
          onClick={() => this.changeSelectedTab('dashboard')} 
          style={{
            color: selectedMenuTab === 'dashboard' ? '#ff3130' : 'gray',
            fontSize: selectedMenuTab === 'dashboard' ? '70px' : '50px',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </h1>
      </div>
    );
  };

  RenderMenuOptionArtistsBlocks = () => {
    const { selectedImageIndex } = this.state;
    return (
      <div className="menu-options-artists-block scroll-hidden fade-slide-in">
        {personImages.map((imgUrl, index) => (
          <div key={index} className="artist-item" style = {{flexShrink: 0,}}>
            <img
              id={`artist-${index}`}
              src={imgUrl}
              alt={`${artistNames[index]}`}
              className={`artist-image ${selectedImageIndex === index ? 'active-image' : ''}`}
              onClick={() => this.handleImageClick(index)}
              style={{ cursor: 'pointer' }}
            />
            {/* <p className="artist-name">{artistNames[index]}</p> */}
          </div>
        ))}
      </div>
    );
  };

  RenderMenuOptionGenreBlocks = () => {
    const { selectedGenreIndex } = this.state;
    return (
      <div className="menu-options-genre-block scroll-hidden fade-slide-in">
        {genreList.map((genre, index) => (
          <p
            key={index}
            onClick={() => this.handleGenreClick(index)}
            className={`genre-name ${selectedGenreIndex === index ? 'active-genre' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            {genre}
          </p>
        ))}
      </div>
    );
  };

  RenderSongs = () => {
    const filteredSongs = this.getFilteredSongs();
    
    return (
      <div className="songs-container">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <SongComponent 
              key={song.id} 
              song={song} 
              onSongClick={this.handleSongClick}
            />
          ))
        ) : (
          <div className="no-songs">
            <p>No songs found for the selected filter.</p>
          </div>
        )}
      </div>
    );
  };

  RenderDashboard = () => {
    const { topDurationSongs, ratingStats, artistTopSongs } = this.state;

    return (
      <div className="dashboard-content">
        {/* Top 5 Duration Songs */}
        <div className="dashboard-section">
          <h2>Top 5 Longest Songs</h2>
          <div className="songs-grid">
            {topDurationSongs.map((song, index) => (
              <div key={song.id} className="song-card" onClick={() => this.handleSongClick(song)}>
                <div className="song-rank">{index + 1}</div>
                <img src={song.imgUrl} alt={song.name} className="song-image" />
                <div className="song-info">
                  <h3>{song.name}</h3>
                  <p className="artist">{song.artist}</p>
                  <p className="duration">{song.duration}</p>
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
                    <div key={song.id} className="artist-song-card" onClick={() => this.handleSongClick(song)}>
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
    );
  };

  render() {
    const { selectedMenuTab, showMusicPlayer, currentSong, searchResults, ratingFilter } = this.state;
    const { footerMenuTab } = this.context;

    console.log("Current footer menu tab:", footerMenuTab);

    // If music player should be shown, render it instead of the home page
    if (showMusicPlayer && currentSong) {
      return (
        <MusicPlayer 
          song={currentSong} 
          onBack={this.handleBackFromPlayer}
          allSongs={searchResults.length > 0 ? searchResults : indianSongs}
        />
      );
    }

    return (
      <div className="home-page">
        <Navbar />
        
        {/* Three Dots Menu */}
        <div className="three-dots-menu-container" style = {{marginTop: '15px'}}>
          <button 
            className="three-dots-button"
            onClick={this.toggleThreeDotsMenu}
            title="More Options"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          
          {this.state.showThreeDotsMenu && (
            <div className="three-dots-menu">
              <button 
                className="menu-item"
                onClick={this.handlePlayLastPlayedSong}
                disabled={songStack.isEmpty()}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Resume Last Played Song</span>
              </button>
              
              <div className="menu-divider"></div>
              
              <div className="filter-section">
                <div className="filter-header">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                  </svg>
                  <span>Filter by Rating</span>
                </div>
                
                <div className="filter-options">
                  <button 
                    className={`filter-option ${this.state.ratingFilter === 4.0 ? 'active' : ''}`}
                    onClick={() => this.handleRatingFilter(4.0)}
                  >
                    Above 4.0 ★
                  </button>
                  <button 
                    className={`filter-option ${this.state.ratingFilter === 4.2 ? 'active' : ''}`}
                    onClick={() => this.handleRatingFilter(4.2)}
                  >
                    Above 4.2 ★
                  </button>
                  <button 
                    className={`filter-option ${this.state.ratingFilter === 4.3 ? 'active' : ''}`}
                    onClick={() => this.handleRatingFilter(4.3)}
                  >
                    Above 4.3 ★
                  </button>
                  <button 
                    className={`filter-option ${this.state.ratingFilter === 4.4 ? 'active' : ''}`}
                    onClick={() => this.handleRatingFilter(4.4)}
                  >
                    Above 4.4 ★
                  </button>
                  <button 
                    className={`filter-option ${this.state.ratingFilter === 4.6 ? 'active' : ''}`}
                    onClick={() => this.handleRatingFilter(4.6)}
                  >
                    Above 4.6 ★
                  </button>
                  <button 
                    className={`filter-option ${this.state.ratingFilter === 4.8 ? 'active' : ''}`}
                    onClick={() => this.handleRatingFilter(4.8)}
                  >
                    Above 4.8 ★
                  </button>
                </div>
                
                {this.state.ratingFilter && (
                  <button 
                    className="clear-filter-btn"
                    onClick={this.clearRatingFilter}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {this.RenderHomePageSongOptions()}
        {selectedMenuTab === 'artists' && this.RenderMenuOptionArtistsBlocks()}
        {selectedMenuTab === 'genre' && this.RenderMenuOptionGenreBlocks()}
        {selectedMenuTab === 'dashboard' && this.RenderDashboard()}
        {selectedMenuTab !== 'dashboard' && this.RenderSongs()}
        
        {/* Active Filter Indicator */}
        {ratingFilter && (
          <div className="active-filter-indicator">
            <span>Filtered: Above {ratingFilter} ★</span>
            <button onClick={this.clearRatingFilter} className="clear-filter-indicator">
              ✕
            </button>
          </div>
        )}
        <SearchPage onSongClick={this.handleSearchSongClick} />
        <LibraryPage />
      </div>
    );
  }
}

export default HomePage;