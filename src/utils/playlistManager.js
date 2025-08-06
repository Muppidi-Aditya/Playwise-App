
class SongNode {
    constructor(song) {
        this.song = song;
        this.prev = null;
        this.next = null;
    }
}


class PlaylistLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    add_song(title, artist, duration) {
        const song = {
            id: Date.now() + Math.random(), // Unique ID
            name: title,
            artist: artist,
            duration: duration,
            imgUrl: "https://i.scdn.co/image/ab67616d0000b27325fa8e214ad888b7d291f25e", // Default image
            youtubeId: "", // Will be set when actual song is added
            movie: "Custom Playlist",
            genre: "Playlist",
            rating: 4.0
        };

        const newNode = new SongNode(song);
        
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        
        this.size++;
        return song;
    }

    // Delete song at specific index
    delete_song(index) {
        if (index < 0 || index >= this.size) {
            throw new Error("Index out of bounds");
        }

        if (this.size === 1) {
            this.head = null;
            this.tail = null;
            this.size = 0;
            return;
        }

        let current = this.head;
        for (let i = 0; i < index; i++) {
            current = current.next;
        }

        if (current === this.head) {
            this.head = current.next;
            this.head.prev = null;
        } else if (current === this.tail) {
            this.tail = current.prev;
            this.tail.next = null;
        } else {
            current.prev.next = current.next;
            current.next.prev = current.prev;
        }

        this.size--;
    }

    // Move song from one index to another
    move_song(from_index, to_index) {
        if (from_index < 0 || from_index >= this.size || 
            to_index < 0 || to_index >= this.size) {
            throw new Error("Index out of bounds");
        }

        if (from_index === to_index) return;

        // Get the node to move
        let current = this.head;
        for (let i = 0; i < from_index; i++) {
            current = current.next;
        }

        // Remove the node from its current position
        if (current === this.head) {
            this.head = current.next;
            if (this.head) this.head.prev = null;
        } else if (current === this.tail) {
            this.tail = current.prev;
            this.tail.next = null;
        } else {
            current.prev.next = current.next;
            current.next.prev = current.prev;
        }

        // Insert at new position
        if (to_index === 0) {
            current.next = this.head;
            current.prev = null;
            if (this.head) this.head.prev = current;
            this.head = current;
        } else if (to_index === this.size) {
            current.next = null;
            current.prev = this.tail;
            this.tail.next = current;
            this.tail = current;
        } else {
            let target = this.head;
            for (let i = 0; i < to_index; i++) {
                target = target.next;
            }
            current.next = target;
            current.prev = target.prev;
            target.prev.next = current;
            target.prev = current;
        }
    }

    // Reverse the entire playlist
    reverse_playlist() {
        if (this.size <= 1) return;

        let current = this.head;
        let temp = null;

        while (current) {
            temp = current.prev;
            current.prev = current.next;
            current.next = temp;
            current = current.prev;
        }

        temp = this.head;
        this.head = this.tail;
        this.tail = temp;
    }

    // Get all songs as array
    toArray() {
        const songs = [];
        let current = this.head;
        while (current) {
            songs.push(current.song);
            current = current.next;
        }
        return songs;
    }

    // Get playlist size
    getSize() {
        return this.size;
    }

    // Get first song (for banner)
    getFirstSong() {
        return this.head ? this.head.song : null;
    }
}

// Playlist Manager Class
class PlaylistManager {
    constructor() {
        this.playlists = new Map(); // Store playlists by name
    }

    // Create a new playlist
    createPlaylist(name) {
        if (this.playlists.has(name)) {
            throw new Error("Playlist with this name already exists");
        }

        const playlist = {
            name: name,
            songs: new PlaylistLinkedList(),
            createdAt: new Date(),
            bannerImage: null
        };

        this.playlists.set(name, playlist);
        return playlist;
    }

    // Add song to playlist
    addSongToPlaylist(playlistName, song) {
        const playlist = this.playlists.get(playlistName);
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        // Add the actual song to the playlist
        const songNode = new SongNode(song);
        
        if (!playlist.songs.head) {
            playlist.songs.head = songNode;
            playlist.songs.tail = songNode;
        } else {
            songNode.prev = playlist.songs.tail;
            playlist.songs.tail.next = songNode;
            playlist.songs.tail = songNode;
        }
        
        playlist.songs.size++;

        // Set banner image to first song's image
        if (!playlist.bannerImage) {
            playlist.bannerImage = song.imgUrl;
        }

        return song;
    }

    // Delete song from playlist
    deleteSongFromPlaylist(playlistName, index) {
        const playlist = this.playlists.get(playlistName);
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        playlist.songs.delete_song(index);
        
        // Update banner image if first song was deleted
        if (playlist.songs.size === 0) {
            playlist.bannerImage = null;
        } else if (index === 0) {
            playlist.bannerImage = playlist.songs.head.song.imgUrl;
        }
    }

    // Move song in playlist
    moveSongInPlaylist(playlistName, fromIndex, toIndex) {
        const playlist = this.playlists.get(playlistName);
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        playlist.songs.move_song(fromIndex, toIndex);
        
        // Update banner image if first song was moved
        if (toIndex === 0 || fromIndex === 0) {
            playlist.bannerImage = playlist.songs.head.song.imgUrl;
        }
    }

    // Reverse playlist
    reversePlaylist(playlistName) {
        const playlist = this.playlists.get(playlistName);
        if (!playlist) {
            throw new Error("Playlist not found");
        }

        playlist.songs.reverse_playlist();
        
        // Update banner image
        if (playlist.songs.head) {
            playlist.bannerImage = playlist.songs.head.song.imgUrl;
        }
    }

    // Get all playlists
    getAllPlaylists() {
        return Array.from(this.playlists.values());
    }

    // Get playlist by name
    getPlaylist(name) {
        return this.playlists.get(name);
    }

    // Delete playlist
    deletePlaylist(name) {
        return this.playlists.delete(name);
    }

    // Get playlist songs as array
    getPlaylistSongs(playlistName) {
        const playlist = this.playlists.get(playlistName);
        return playlist ? playlist.songs.toArray() : [];
    }
}

// Create singleton instance
const playlistManager = new PlaylistManager();

export default playlistManager;
export { PlaylistLinkedList, SongNode };