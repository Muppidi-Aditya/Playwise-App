class SongStack {
  constructor() {
    this.songs = [];
    this.maxSize = 10; // Keep last 10 songs
  }

  // Add a song to the top of the stack
  push(song) {
    // Remove the song if it already exists to avoid duplicates
    this.songs = this.songs.filter(s => s.id !== song.id);
    
    // Add the song to the top
    this.songs.unshift(song);
    
    // Keep only the last maxSize songs
    if (this.songs.length > this.maxSize) {
      this.songs = this.songs.slice(0, this.maxSize);
    }
  }

  // Get the most recently played song (top of stack)
  peek() {
    return this.songs.length > 0 ? this.songs[0] : null;
  }

  // Get all songs in the stack (most recent first)
  getAllSongs() {
    return [...this.songs];
  }

  // Check if stack is empty
  isEmpty() {
    return this.songs.length === 0;
  }

  // Get the size of the stack
  size() {
    return this.songs.length;
  }

  // Clear the stack
  clear() {
    this.songs = [];
  }
}

// Create a singleton instance
const songStack = new SongStack();

export default songStack; 