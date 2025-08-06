import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import './style.css';

const SongComponent = ({ song, onSongClick, showAddToPlaylist = false, onAddToPlaylist }) => {
    const [showAddButton, setShowAddButton] = useState(false);
    // Default image URL if no imgUrl is provided
    const defaultImageUrl = "https://i.scdn.co/image/ab67616d0000b27325fa8e214ad888b7d291f25e";
    
    const handleClick = (event) => {
        if (onSongClick) {
            onSongClick(song, event);
        }
    };

    const handleAddToPlaylist = (event) => {
        event.stopPropagation();
        if (onAddToPlaylist) {
            onAddToPlaylist(song);
        }
    };
    
    return (
        <div 
            className='song-block' 
            onClick={handleClick}
            onMouseEnter={() => setShowAddButton(true)}
            onMouseLeave={() => setShowAddButton(false)}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            <img 
                src={song?.imgUrl || defaultImageUrl} 
                alt={song?.name || "Song"}
            />
            <div className='sub-block'>
                <h1>{song?.name || "Song Name"}</h1>
                <h1 style={{color: 'darkgray'}}>{song?.artist || "Artist Name"}</h1>
            </div>
            <p>{song?.duration || "0:00"}</p>
            
            {showAddToPlaylist && showAddButton && (
                <button 
                    className="add-to-playlist-button"
                    onClick={handleAddToPlaylist}
                    title="Add to Playlist"
                >
                    <IoAdd />
                </button>
            )}
        </div>
    );
};

export default SongComponent;