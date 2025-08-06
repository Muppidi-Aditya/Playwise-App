import React, { createContext, useContext, useState } from 'react';
import DoublyLinkedList from './utils/DoublyLinkedList.js';

const PlaylistContext = createContext();

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(0);
  const [songsCache, setSongsCache] = useState({}); // Cache for songs arrays
  const [playlistSongSets, setPlaylistSongSets] = useState({}); // Track unique songs per playlist

  const createPlaylist = (playlistData) => {
    console.log('Creating new playlist with data:', playlistData);
    const newPlaylist = {
      id: Date.now(),
      name: playlistData.name,
      description: playlistData.description,
      songs: new DoublyLinkedList(), // Use doubly linked list
      createdAt: new Date().toISOString(),
      coverImage: null // Will be set to first song's image when songs are added
    };
    
    console.log('New playlist created:', newPlaylist);
    setPlaylists(prev => {
      const updatedPlaylists = [...prev, newPlaylist];
      console.log('Updated playlists:', updatedPlaylists);
      return updatedPlaylists;
    });
    
    // Initialize empty set for this playlist
    setPlaylistSongSets(prev => ({
      ...prev,
      [newPlaylist.id]: new Set()
    }));
    
    setShowCreatePlaylist(false);
  };

  // Add song to playlist using doubly linked list
  const addSongToPlaylist = (playlistId, title, artist, duration, imgUrl = null, youtubeId = null) => {
    console.log('Adding song to playlist:', playlistId, title, artist, duration);
    console.log('Current playlists:', playlists);
    console.log('Looking for playlist with ID:', playlistId, 'Type:', typeof playlistId);
    
    // Create a unique key for the song (title + artist)
    const songKey = `${title.toLowerCase()}-${artist.toLowerCase()}`;
    
    // Check if song already exists in this playlist
    const existingSongSet = playlistSongSets[playlistId] || new Set();
    if (existingSongSet.has(songKey)) {
      console.log('Song already exists in playlist:', songKey);
      return false; // Indicate that song was not added (duplicate)
    }
    
    setPlaylists(prev => {
      console.log('Previous playlists:', prev);
      const updatedPlaylists = prev.map(playlist => {
        console.log('Checking playlist:', playlist.id, 'Type:', typeof playlist.id);
        if (playlist.id === playlistId) {
          console.log('Found matching playlist:', playlist);
          const updatedPlaylist = { ...playlist };
          try {
            // Create a new DoublyLinkedList instance to ensure React detects the change
            const newSongsList = new DoublyLinkedList();
            
            // Copy existing songs to the new list
            const existingSongs = playlist.songs.toArray();
            existingSongs.forEach(song => {
              newSongsList.addSong(song.name, song.artist, song.duration, song.imgUrl, song.youtubeId);
            });
            
            // Add the new song
            newSongsList.addSong(title, artist, duration, imgUrl, youtubeId);
            updatedPlaylist.songs = newSongsList;
            
            console.log('Song added successfully. New size:', updatedPlaylist.songs.getSize());
            
            // Update playlist cover image to first song's image if this is the first song
            if (updatedPlaylist.songs.getSize() === 1 && imgUrl) {
                updatedPlaylist.coverImage = imgUrl;
            }
          } catch (error) {
            console.error('Error adding song:', error);
          }
          return updatedPlaylist;
        }
        return playlist;
      });
      console.log('Updated playlists:', updatedPlaylists);
      return updatedPlaylists;
    });
    
    // Update the song set for this playlist
    setPlaylistSongSets(prev => ({
      ...prev,
      [playlistId]: new Set([...existingSongSet, songKey])
    }));
    
    // Force re-render by updating the trigger
    setPlaylistUpdateTrigger(prev => prev + 1);
    
    return true; // Indicate that song was added successfully
  };

  // Delete song from playlist by index
  const deleteSongFromPlaylist = (playlistId, index) => {
    console.log('Deleting song from playlist:', playlistId, 'at index:', index);
    setPlaylists(prev => {
      const updatedPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedPlaylist = { ...playlist };
          try {
            // Get the song to be deleted first
            const songToDelete = playlist.songs.getSongAt(index);
            console.log('Song to delete:', songToDelete);
            
            // Create a new DoublyLinkedList instance to ensure React detects the change
            const newSongsList = new DoublyLinkedList();
            
            // Copy all songs except the one to be deleted
            const existingSongs = playlist.songs.toArray();
            existingSongs.forEach((song, songIndex) => {
              if (songIndex !== index) {
                newSongsList.addSong(song.name, song.artist, song.duration, song.imgUrl, song.youtubeId);
              }
            });
            
            updatedPlaylist.songs = newSongsList;
            console.log('Song deleted successfully:', songToDelete.name);
            
            // Update cover image if playlist becomes empty or if first song was deleted
            if (updatedPlaylist.songs.getSize() === 0) {
                // Reset to first letter of playlist name if empty
                updatedPlaylist.coverImage = null;
            } else if (index === 0 && updatedPlaylist.songs.getSize() > 0) {
                // If first song was deleted, update cover to new first song's image
                const newFirstSong = updatedPlaylist.songs.getSongAt(0);
                if (newFirstSong && newFirstSong.imgUrl) {
                    updatedPlaylist.coverImage = newFirstSong.imgUrl;
                }
            }
            
            // Update the song set by removing the deleted song
            const songKey = `${songToDelete.name.toLowerCase()}-${songToDelete.artist.toLowerCase()}`;
            setPlaylistSongSets(prevSets => {
              const currentSet = prevSets[playlistId] || new Set();
              const newSet = new Set(currentSet);
              newSet.delete(songKey);
              return {
                ...prevSets,
                [playlistId]: newSet
              };
            });
          } catch (error) {
            console.error('Error deleting song:', error);
          }
          return updatedPlaylist;
        }
        return playlist;
      });
      return updatedPlaylists;
    });
    
    // Force re-render by updating the trigger
    setPlaylistUpdateTrigger(prev => prev + 1);
  };

  // Move song in playlist
  const moveSongInPlaylist = (playlistId, fromIndex, toIndex) => {
    console.log('Moving song in playlist:', playlistId, 'from', fromIndex, 'to', toIndex);
    setPlaylists(prev => {
      const updatedPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedPlaylist = { ...playlist };
          try {
            // Create a new DoublyLinkedList instance to ensure React detects the change
            const newSongsList = new DoublyLinkedList();
            
            // Copy all songs to the new list
            const existingSongs = playlist.songs.toArray();
            
            // Remove the song from its original position
            const songToMove = existingSongs[fromIndex];
            const songsWithoutMoved = existingSongs.filter((_, index) => index !== fromIndex);
            
            // Insert the song at the new position
            songsWithoutMoved.forEach((song, index) => {
              if (index === toIndex) {
                newSongsList.addSong(songToMove.name, songToMove.artist, songToMove.duration, songToMove.imgUrl, songToMove.youtubeId);
              }
              newSongsList.addSong(song.name, song.artist, song.duration, song.imgUrl, song.youtubeId);
            });
            
            // If the song should be moved to the end
            if (toIndex >= songsWithoutMoved.length) {
              newSongsList.addSong(songToMove.name, songToMove.artist, songToMove.duration, songToMove.imgUrl, songToMove.youtubeId);
            }
            
            updatedPlaylist.songs = newSongsList;
            console.log('Song moved successfully');
          } catch (error) {
            console.error('Error moving song:', error);
          }
          return updatedPlaylist;
        }
        return playlist;
      });
      return updatedPlaylists;
    });
    
    // Force re-render by updating the trigger
    setPlaylistUpdateTrigger(prev => prev + 1);
  };

  // Sort playlist using merge sort algorithm
  const sortPlaylist = (playlistId, sortCriteria, sortOrder) => {
    console.log('Sorting playlist:', playlistId, 'by', sortCriteria, 'order:', sortOrder);
    
    // Merge sort algorithm
    const mergeSort = (arr, compareFunction) => {
      if (arr.length <= 1) return arr;
      
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid), compareFunction);
      const right = mergeSort(arr.slice(mid), compareFunction);
      
      return merge(left, right, compareFunction);
    };

    const merge = (left, right, compareFunction) => {
      const result = [];
      let leftIndex = 0;
      let rightIndex = 0;
      
      while (leftIndex < left.length && rightIndex < right.length) {
        if (compareFunction(left[leftIndex], right[rightIndex]) <= 0) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
      
      return result.concat(left.slice(leftIndex), right.slice(rightIndex));
    };

    // Comparison functions
    const compareByTitle = (a, b, order) => {
      const comparison = a.name.localeCompare(b.name);
      return order === 'asc' ? comparison : -comparison;
    };

    const compareByDuration = (a, b, order) => {
      const durationA = parseFloat(a.duration) || 0;
      const durationB = parseFloat(b.duration) || 0;
      const comparison = durationA - durationB;
      return order === 'asc' ? comparison : -comparison;
    };

    setPlaylists(prev => {
      const updatedPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedPlaylist = { ...playlist };
          try {
            // Get current songs
            const songsArray = playlist.songs.toArray();
            console.log('Original songs:', songsArray);
            
            // Create comparison function
            const compareFunction = (a, b) => {
              if (sortCriteria === 'title') {
                return compareByTitle(a, b, sortOrder);
              } else if (sortCriteria === 'duration') {
                return compareByDuration(a, b, sortOrder);
              }
              return 0;
            };

            // Sort using merge sort
            const sortedSongs = mergeSort([...songsArray], compareFunction);
            console.log('Sorted songs:', sortedSongs);
            
            // Create new DoublyLinkedList with sorted songs
            const newSongsList = new DoublyLinkedList();
            sortedSongs.forEach(song => {
              newSongsList.addSong(song.name, song.artist, song.duration, song.imgUrl, song.youtubeId);
            });
            
            updatedPlaylist.songs = newSongsList;
            console.log('Playlist sorted successfully');
          } catch (error) {
            console.error('Error sorting playlist:', error);
          }
          return updatedPlaylist;
        }
        return playlist;
      });
      return updatedPlaylists;
    });
    
    // Force re-render by updating the trigger
    setPlaylistUpdateTrigger(prev => prev + 1);
  };

  // Reverse playlist using the DoublyLinkedList's built-in reverse method
  const reversePlaylist = (playlistId) => {
    console.log('Reversing playlist:', playlistId);
    setPlaylists(prev => {
      const updatedPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId) {
          const updatedPlaylist = { ...playlist };
          try {
            // Use the DoublyLinkedList's built-in reverse method
            playlist.songs.reversePlaylist();
            
            // Create a new instance to ensure React detects the change
            const newSongsList = new DoublyLinkedList();
            const reversedSongs = playlist.songs.toArray();
            
            // Copy the reversed songs to the new list
            reversedSongs.forEach(song => {
              newSongsList.addSong(song.name, song.artist, song.duration, song.imgUrl, song.youtubeId);
            });
            
            updatedPlaylist.songs = newSongsList;
            console.log('Playlist reversed successfully using DoublyLinkedList reverse method');
          } catch (error) {
            console.error('Error reversing playlist:', error);
          }
          return updatedPlaylist;
        }
        return playlist;
      });
      return updatedPlaylists;
    });
    
    // Force re-render by updating the trigger
    setPlaylistUpdateTrigger(prev => prev + 1);
  };

  // Get playlist songs as array
  const getPlaylistSongs = (playlistId) => {
    console.log('getPlaylistSongs - playlistId:', playlistId, 'Type:', typeof playlistId);
    console.log('getPlaylistSongs - all playlists:', playlists);
    
    const playlist = playlists.find(p => p.id === playlistId);
    console.log('getPlaylistSongs - found playlist:', playlist);
    
    if (playlist && playlist.songs) {
      try {
        const songsArray = playlist.songs.toArray();
        console.log('getPlaylistSongs - songs array:', songsArray);
        return songsArray;
      } catch (error) {
        console.error('Error getting songs array:', error);
        return [];
      }
    }
    return [];
  };

  // Get playlist size
  const getPlaylistSize = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist ? playlist.songs.getSize() : 0;
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    
    // Clean up the song set for this playlist
    setPlaylistSongSets(prev => {
      const newSets = { ...prev };
      delete newSets[playlistId];
      return newSets;
    });
  };

  const value = {
    playlists,
    showCreatePlaylist,
    setShowCreatePlaylist,
    createPlaylist,
    addSongToPlaylist,
    deleteSongFromPlaylist,
    moveSongInPlaylist,
    reversePlaylist,
    sortPlaylist,
    getPlaylistSongs,
    getPlaylistSize,
    deletePlaylist,
    playlistUpdateTrigger
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}; 