import React, { useState } from 'react';
import { usePlaylist } from '../../PlaylistContext';
import './style.css';

const AddSongModal = ({ isOpen, onClose, playlistId }) => {
  const { addSongToPlaylist } = usePlaylist();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    duration: '',
    imgUrl: '',
    youtubeId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.artist.trim() && formData.duration.trim()) {
      addSongToPlaylist(
        playlistId,
        formData.title.trim(),
        formData.artist.trim(),
        formData.duration.trim(),
        formData.imgUrl.trim() || null,
        formData.youtubeId.trim() || null
      );
      setFormData({ title: '', artist: '', duration: '', imgUrl: '', youtubeId: '' });
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Song to Playlist</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Song Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter song title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="artist">Artist *</label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="Enter artist name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">Duration *</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 3:45"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="imgUrl">Cover Image URL</label>
            <input
              type="url"
              id="imgUrl"
              name="imgUrl"
              value={formData.imgUrl}
              onChange={handleChange}
              placeholder="Enter image URL (optional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="youtubeId">YouTube Video ID</label>
            <input
              type="text"
              id="youtubeId"
              name="youtubeId"
              value={formData.youtubeId}
              onChange={handleChange}
              placeholder="Enter YouTube video ID (optional)"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-button">
              Add Song
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSongModal; 