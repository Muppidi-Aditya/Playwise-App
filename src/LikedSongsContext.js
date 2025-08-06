import { createContext } from "react";

const LikedSongsContext = createContext({
  likedSongs: [],
  addLikedSong: () => {},
  removeLikedSong: () => {},
  isSongLiked: () => false,
  reverseLikedSongs: () => {},
});

export default LikedSongsContext; 