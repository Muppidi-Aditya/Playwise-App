import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import './style.css'
import FooterMenuContext from "../../FooterMenuContext";
import { usePlaylist } from "../../PlaylistContext";
import LikedSongsContext from "../../LikedSongsContext";
import Navbar from "../../components/Navbar";

import { IoMdAdd } from "react-icons/io";
import { IoMdGitMerge } from "react-icons/io";
import PlaylistBlock from "../../components/PlaylistBlock";
import CreatePlaylistModal from "../../components/CreatePlaylistModal";
import MergeSuggestionModal from "../../components/MergeSuggestionModal";
import PlaylistMergeDetector from "../../utils/playlistMergeDetector";
import likedSongsImage from "../../assets/liked-songs.png";

function LibraryPage() {
    const { footerMenuTab } = useContext(FooterMenuContext);
    const { playlists, setShowCreatePlaylist, showCreatePlaylist, playlistUpdateTrigger } = usePlaylist();
    const { likedSongs } = useContext(LikedSongsContext);
    const navigate = useNavigate();
    const [showMergeSuggestions, setShowMergeSuggestions] = useState(false);
    
    console.log('LibraryPage - playlists:', playlists);
    console.log('LibraryPage - likedSongs:', likedSongs);

    // Force re-render when playlists are updated
    useEffect(() => {
        console.log('LibraryPage - playlists updated, trigger:', playlistUpdateTrigger);
    }, [playlistUpdateTrigger]);



    const handlePlaylistClick = (playlist) => {
        // Navigate to the playlist detail page using playlist ID
        navigate(`/playlist-detail/${playlist.id}`);
    };

    const handleLikedSongsClick = () => {
        // Navigate to the liked songs playlist page
        navigate('/playlist/liked');
    };

    const handleCreatePlaylist = () => {
        setShowCreatePlaylist(true);
    };

    const handleShowMergeSuggestions = () => {
        setShowMergeSuggestions(true);
    };

    return (
        <div className="library-page" style={{transform: footerMenuTab === 'heart' ? 'translateX(0)' : 'translateX(100%)'}}>
            <Navbar />
            <div className="library-page-header-block">
                <h1> Your Library </h1>
                <div className="header-actions">
                    <div className="merge-suggestions-button" onClick={handleShowMergeSuggestions} title="Merge Suggestions">
                        <IoMdGitMerge />
                    </div>
                    <div className="add-playlist-button" onClick={handleCreatePlaylist}>
                        <IoMdAdd />
                    </div>
                </div>
            </div>
            <div className="playlists-container">
                {/* Liked Songs Playlist */}
                <div className="liked-songs-section">
                    <h2 className="section-title">Liked Songs</h2>
                    <PlaylistBlock 
                        playlist={{
                            name: "Liked Songs",
                            songs: likedSongs,
                            coverImage: likedSongsImage,
                            createdAt: new Date().toISOString()
                        }}
                        onPlaylistClick={handleLikedSongsClick}
                    />
                </div>
                
                {/* Custom Playlists */}
                {playlists.length > 0 && (
                    <div className="custom-playlists-section">
                        <h2 className="section-title">Your Playlists</h2>
                        {playlists.map((playlist) => (
                            <PlaylistBlock 
                                key={playlist.name}
                                playlist={playlist}
                                onPlaylistClick={handlePlaylistClick}
                            />
                        ))}
                    </div>
                )}
                
                {playlists.length === 0 && (
                    <div className="no-playlists">
                        <p>No custom playlists yet. Create your first playlist!</p>
                    </div>
                )}
            </div>
            <CreatePlaylistModal 
                isOpen={showCreatePlaylist}
                onClose={() => setShowCreatePlaylist(false)}
            />
            <MergeSuggestionModal 
                isOpen={showMergeSuggestions}
                onClose={() => setShowMergeSuggestions(false)}
            />
        </div>
    );
}

export default LibraryPage;