# Playwise App - Client Side

A music streaming application built with React and Vite, featuring playlist management using Doubly Linked Lists.

## Features

### ✅ Completed Features

1. **Playlist Management**
   - Create new playlists with custom names and descriptions
   - Add songs to playlists using a modal interface
   - Delete songs from playlists
   - Move songs up/down within playlists
   - Reverse entire playlists

2. **Doubly Linked List Implementation**
   - All playlist operations use a custom DoublyLinkedList class
   - Efficient song insertion, deletion, and movement
   - Proper state management with React

3. **User Interface**
   - Modern, responsive design
   - Music player integration
   - Playlist detail pages with song management
   - Search functionality
   - Library page for managing playlists

4. **Data Structures**
   - Custom DoublyLinkedList implementation in `src/utils/DoublyLinkedList.js`
   - Proper song object structure with metadata
   - Efficient playlist operations

## Technical Implementation

### Doubly Linked List
- Located in `src/utils/DoublyLinkedList.js`
- Supports all CRUD operations (Create, Read, Update, Delete)
- Efficient O(1) insertion at end, O(n) for indexed operations
- Proper memory management with bidirectional links

### State Management
- Uses React Context API (`PlaylistContext.jsx`)
- All playlist operations update state properly
- Real-time UI updates when songs are added/removed

### Components
- `PlaylistDetailPage`: Main playlist view with song management
- `AddSongModal`: Modal for adding new songs to playlists
- `SongComponent`: Reusable song display component
- Various other UI components for navigation and layout

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5174`

## File Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── utils/              # Utility classes (DoublyLinkedList)
├── PlaylistContext.jsx # State management
└── main.jsx           # App entry point
```

## Testing

The DoublyLinkedList implementation has been thoroughly tested. Run the test file:

```bash
node src/utils/testDoublyLinkedList.js
```

This will verify all operations (add, delete, move, reverse) work correctly.

## Future Enhancements

- Server-side integration
- User authentication
- Music file upload
- Advanced playlist features
- Social features (sharing playlists)
