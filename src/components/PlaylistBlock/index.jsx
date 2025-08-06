import React from 'react';
import './style.css';

import { FaMusic } from "react-icons/fa";


const PlaylistBlock = ({ playlist, onPlaylistClick }) => {
    const handleClick = () => {
        if (onPlaylistClick) {
            onPlaylistClick(playlist);
        }
    };

    // Determine the cover image to display
    const getCoverImage = () => {
        // If playlist has a cover image (imported asset or URL), use it
        if (playlist.coverImage) {
            return { type: 'image', src: playlist.coverImage };
        }
        
        // If playlist has songs and first song has an image, use it
        if (playlist.songs && playlist.songs.getSize && playlist.songs.getSize() > 0) {
            const songs = playlist.songs.toArray();
            if (songs.length > 0 && songs[0].imgUrl) {
                return { type: 'image', src: songs[0].imgUrl };
            }
        }
        
        // If playlist has songs array and first song has an image, use it
        if (playlist.songs && Array.isArray(playlist.songs) && playlist.songs.length > 0) {
            if (playlist.songs[0].imgUrl) {
                return { type: 'image', src: playlist.songs[0].imgUrl };
            }
        }
        
        // Default to first letter of playlist name
        return { type: 'letter', letter: playlist.name.charAt(0).toUpperCase() };
    };

    const cover = getCoverImage();

    return (
        <div 
            className="playlist-block" 
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <div className="playlist-image">
                {cover.type === 'image' ? (
                    <img 
                        src={cover.src} 
                        alt={playlist.name} 
                        className="playlist-cover-img"
                        onError={(e) => {
                            console.error('Image failed to load:', cover.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div className="playlist-letter" style={{ display: cover.type === 'image' ? 'none' : 'flex' }}>
                    {cover.letter}
                </div>
                <div className="playlist-overlay">
                    <div className="playlist-icon">
                        <FaMusic style={{color: 'white'}} />
                    </div>
                </div>
            </div>
            <div className="playlist-info">
                <h3 className="playlist-name">{playlist.name}</h3>
                <p className="playlist-songs-count">
                    {playlist.songs.getSize ? playlist.songs.getSize() : playlist.songs.length} songs
                </p>
                <p className="playlist-date">
                    Created {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default PlaylistBlock;