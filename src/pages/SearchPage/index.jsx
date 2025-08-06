import React, { useState, useContext } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoAdd } from "react-icons/io5";
import FooterMenuContext from "../../FooterMenuContext";
import { searchSongByTitle, getAllSongs, getHashMapStats } from "../../utils/songHashMap";
import { usePlaylist } from "../../PlaylistContext.jsx";
import Navbar from "../../components/Navbar";
import SongComponent from "../../components/SongComponent";
import CreatePlaylistModal from "../../components/CreatePlaylistModal";
import MusicPlayer from "../MusicPage";
import './style.css';

const SearchPage = ({ onSongClick }) => {
    const { footerMenuTab } = useContext(FooterMenuContext);
    const { setShowCreatePlaylist, showCreatePlaylist } = usePlaylist();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchStats, setSearchStats] = useState(null);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            setSearchStats(null);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        
        // Use the enhanced hashmap for fast search
        const startTime = performance.now();
        const results = searchSongByTitle(searchTerm);
        const endTime = performance.now();
        
        setSearchResults(results);
        setSearchStats({
            resultsCount: results.length,
            searchTime: (endTime - startTime).toFixed(2),
            totalSongs: getHashMapStats().totalSongs
        });
        setIsSearching(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSongClick = (song) => {
        if (onSongClick) {
            onSongClick(song, searchResults);
        }
    };



    const renderSearchResults = () => {
        // Don't show anything until user has searched
        if (!hasSearched) {
            return null;
        }

        if (searchResults.length === 0 && searchTerm.trim()) {
            return (
                <div className="no-results">
                    <p>No songs found for "{searchTerm}"</p>
                    <p className="search-tip">Try searching by artist, movie, or song title</p>
                </div>
            );
        }

        return (
            <div className="search-results">
                {searchStats && (
                    <div className="search-stats">
                        <span>Found {searchStats.resultsCount} results</span>
                        <span>in {searchStats.searchTime}ms</span>
                        <span>from {searchStats.totalSongs} songs</span>
                    </div>
                )}
                {searchResults.map((song, index) => (
                    <SongComponent 
                        key={song.id}
                        song={song}
                        onSongClick={handleSongClick}
                    />
                ))}
            </div>
        );
    };

    const renderSearchInput = () => {
        return (
            <div className="search-container">
                <div className="search-block">
                    <input 
                        type="search" 
                        className="search-input-block" 
                        placeholder="Browse Music" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <div className="search-icon-block" onClick={handleSearch}>
                        <AiOutlineSearch className="search-icon" />
                    </div>
                </div>
                <button 
                    className="create-playlist-button"
                    onClick={() => setShowCreatePlaylist(true)}
                    title="Create New Playlist"
                >
                    <IoAdd className="add-icon" />
                </button>
            </div>
        );
    };

    // Note: MusicPlayer rendering is handled by parent HomePage
    // This component only manages search functionality

    return (
        <div 
            className="search-page" 
            style={{
                transform: footerMenuTab === 'search' ? 'translateX(0)' : 'translateX(100%)'
            }}
        >
            <Navbar />
            {renderSearchInput()}
            {isSearching && (
                <div className="searching-indicator">
                    <p>Searching...</p>
                </div>
            )}
            {renderSearchResults()}
            <CreatePlaylistModal 
                isOpen={showCreatePlaylist}
                onClose={() => setShowCreatePlaylist(false)}
            />
        </div>
    );
};

export default SearchPage;