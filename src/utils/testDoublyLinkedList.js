import DoublyLinkedList from './DoublyLinkedList.js';

// Test the DoublyLinkedList
console.log('Testing DoublyLinkedList...');

const playlist = new DoublyLinkedList();

// Test 1: Add first song
console.log('\n=== Test 1: Add first song ===');
playlist.addSong('Test Song 1', 'Test Artist 1', '3:30');
console.log('Size after first song:', playlist.getSize());
console.log('Songs array:', playlist.toArray());

// Test 2: Add second song
console.log('\n=== Test 2: Add second song ===');
playlist.addSong('Test Song 2', 'Test Artist 2', '4:15');
console.log('Size after second song:', playlist.getSize());
console.log('Songs array:', playlist.toArray());

// Test 3: Add third song
console.log('\n=== Test 3: Add third song ===');
playlist.addSong('Test Song 3', 'Test Artist 3', '2:45');
console.log('Size after third song:', playlist.getSize());
console.log('Songs array:', playlist.toArray());

// Test 4: Get song at index
console.log('\n=== Test 4: Get song at index ===');
console.log('Song at index 0:', playlist.getSongAt(0));
console.log('Song at index 1:', playlist.getSongAt(1));
console.log('Song at index 2:', playlist.getSongAt(2));

// Test 5: Move song
console.log('\n=== Test 5: Move song ===');
playlist.moveSong(0, 2);
console.log('Songs array after moving song 0 to position 2:', playlist.toArray());

// Test 6: Delete song
console.log('\n=== Test 6: Delete song ===');
const deletedSong = playlist.deleteSong(1);
console.log('Deleted song:', deletedSong);
console.log('Songs array after deletion:', playlist.toArray());

// Test 7: Reverse playlist
console.log('\n=== Test 7: Reverse playlist ===');
playlist.reversePlaylist();
console.log('Songs array after reversal:', playlist.toArray());

console.log('\n=== All tests completed ==='); 