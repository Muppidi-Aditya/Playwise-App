import RatingBST from './ratingBST.js';

// Test data
const testSongs = [
  { id: 1, name: "Song 1", rating: 4.9 },
  { id: 2, name: "Song 2", rating: 4.2 },
  { id: 3, name: "Song 3", rating: 4.7 },
  { id: 4, name: "Song 4", rating: 4.1 },
  { id: 5, name: "Song 5", rating: 4.8 },
  { id: 6, name: "Song 6", rating: 4.3 },
  { id: 7, name: "Song 7", rating: 4.6 },
  { id: 8, name: "Song 8", rating: 4.0 },
];

// Test the BST implementation
function testRatingBST() {
  console.log("Testing Rating BST Implementation...");
  
  const bst = new RatingBST();
  bst.buildFromSongs(testSongs);
  
  console.log("All songs:", bst.getAllSongs().map(s => `${s.name} (${s.rating})`));
  
  console.log("Songs above 4.5:", bst.getSongsAboveRating(4.5).map(s => `${s.name} (${s.rating})`));
  console.log("Songs above 4.2:", bst.getSongsAboveRating(4.2).map(s => `${s.name} (${s.rating})`));
  console.log("Songs above 4.0:", bst.getSongsAboveRating(4.0).map(s => `${s.name} (${s.rating})`));
  
  console.log("BST test completed!");
}

export default testRatingBST; 