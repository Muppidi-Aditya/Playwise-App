class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // Add a song to the end of the playlist
  addSong(title, artist, duration, imgUrl = null, youtubeId = null) {
    const songData = {
      id: Date.now() + Math.random(), // Unique ID
      name: title,
      artist: artist,
      duration: duration,
      imgUrl: imgUrl,
      youtubeId: youtubeId,
      movie: "", // Default empty
      genre: "", // Default empty
      rating: 0 // Default rating
    };

    const newNode = new Node(songData);

    if (!this.head) {
      // First song in playlist
      this.head = newNode;
      this.tail = newNode;
    } else {
      // Add to end of playlist
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    return songData;
  }

  // Delete song at specific index
  deleteSong(index) {
    if (index < 0 || index >= this.size) {
      throw new Error("Index out of bounds");
    }

    if (this.size === 1) {
      // Only one song in playlist
      const deletedSong = this.head.data;
      this.head = null;
      this.tail = null;
      this.size = 0;
      return deletedSong;
    }

    let current = this.head;
    let currentIndex = 0;

    // Find the node at the specified index
    while (currentIndex < index) {
      current = current.next;
      currentIndex++;
    }

    const deletedSong = current.data;

    if (current === this.head) {
      // Deleting first song
      this.head = current.next;
      this.head.prev = null;
    } else if (current === this.tail) {
      // Deleting last song
      this.tail = current.prev;
      this.tail.next = null;
    } else {
      // Deleting middle song
      current.prev.next = current.next;
      current.next.prev = current.prev;
    }

    this.size--;
    return deletedSong;
  }

  // Move song from one index to another
  moveSong(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.size || toIndex < 0 || toIndex >= this.size) {
      throw new Error("Index out of bounds");
    }

    if (fromIndex === toIndex) {
      return; // No movement needed
    }

    // Get the song to move
    const songToMove = this.getSongAt(fromIndex);
    
    // Delete from original position
    this.deleteSong(fromIndex);
    
    // Insert at new position
    this.insertSongAt(toIndex, songToMove);
  }

  // Insert song at specific index
  insertSongAt(index, songData) {
    if (index < 0 || index > this.size) {
      throw new Error("Index out of bounds");
    }

    const newNode = new Node(songData);

    if (index === 0) {
      // Insert at beginning
      newNode.next = this.head;
      if (this.head) {
        this.head.prev = newNode;
      } else {
        this.tail = newNode;
      }
      this.head = newNode;
    } else if (index === this.size) {
      // Insert at end
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    } else {
      // Insert in middle
      let current = this.head;
      let currentIndex = 0;

      while (currentIndex < index) {
        current = current.next;
        currentIndex++;
      }

      newNode.prev = current.prev;
      newNode.next = current;
      current.prev.next = newNode;
      current.prev = newNode;
    }

    this.size++;
  }

  // Reverse the entire playlist
  reversePlaylist() {
    if (this.size <= 1) {
      return; // No need to reverse
    }

    let current = this.head;
    let temp = null;

    // Swap head and tail
    this.head = this.tail;
    this.tail = current;

    // Reverse all links
    while (current) {
      temp = current.prev;
      current.prev = current.next;
      current.next = temp;
      current = current.prev;
    }
  }

  // Get song at specific index
  getSongAt(index) {
    if (index < 0 || index >= this.size) {
      throw new Error("Index out of bounds");
    }

    let current = this.head;
    let currentIndex = 0;

    while (currentIndex < index) {
      current = current.next;
      currentIndex++;
    }

    return current.data;
  }

  // Get all songs as array
  toArray() {
    const songs = [];
    let current = this.head;

    while (current) {
      songs.push(current.data);
      current = current.next;
    }

    return songs;
  }

  // Get size of playlist
  getSize() {
    return this.size;
  }

  // Check if playlist is empty
  isEmpty() {
    return this.size === 0;
  }

  // Clear all songs
  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // Find song by ID
  findSongById(id) {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.data.id === id) {
        return { song: current.data, index };
      }
      current = current.next;
      index++;
    }

    return null;
  }

  // Find song by name and artist
  findSongByNameAndArtist(name, artist) {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.data.name === name && current.data.artist === artist) {
        return { song: current.data, index };
      }
      current = current.next;
      index++;
    }

    return null;
  }
}

export default DoublyLinkedList; 