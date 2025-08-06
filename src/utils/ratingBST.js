class RatingBSTNode {
  constructor(song) {
    this.song = song;
    this.rating = song.rating;
    this.left = null;
    this.right = null;
  }
}

class RatingBST {
  constructor() {
    this.root = null;
  }

  // Insert a song into the BST
  insert(song) {
    const newNode = new RatingBSTNode(song);
    
    if (!this.root) {
      this.root = newNode;
      return;
    }

    this.insertNode(this.root, newNode);
  }

  insertNode(node, newNode) {
    if (newNode.rating <= node.rating) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  // Get all songs with rating above a threshold
  getSongsAboveRating(threshold) {
    const result = [];
    this.inorderTraversal(this.root, threshold, result);
    return result;
  }

  // Inorder traversal to get songs above threshold
  inorderTraversal(node, threshold, result) {
    if (node === null) return;

    // Traverse right subtree first (higher ratings)
    this.inorderTraversal(node.right, threshold, result);
    
    // Check current node
    if (node.rating >= threshold) {
      result.push(node.song);
    }
    
    // Traverse left subtree (lower ratings)
    this.inorderTraversal(node.left, threshold, result);
  }

  // Build BST from array of songs
  buildFromSongs(songs) {
    this.root = null;
    songs.forEach(song => {
      this.insert(song);
    });
  }

  // Get all songs in the BST
  getAllSongs() {
    const result = [];
    this.inorderTraversalAll(this.root, result);
    return result;
  }

  // Inorder traversal to get all songs
  inorderTraversalAll(node, result) {
    if (node === null) return;

    this.inorderTraversalAll(node.left, result);
    result.push(node.song);
    this.inorderTraversalAll(node.right, result);
  }
}

export default RatingBST; 