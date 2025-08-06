import { Component } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import FooterMenuContext from "./FooterMenuContext";
import LikedSongsContext from "./LikedSongsContext";
import { PlaylistProvider } from "./PlaylistContext";
import "./utils/testDoublyLinkedList.js";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import FooterMenu from "./components/FooterMenu";
import './App.css';
import AudioPlayer from "./pages/Temo";
import MusicPage from "./pages/MusicPage";
import PlaylistPage from "./pages/PlaylistPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";

function AppWrapper() {
  const location = useLocation();
  return <App location={location} />;
}

class App extends Component {
  state = {
    footerMenuTab: "home",
    isMusicPlayerActive: false,
    likedSongs: [],
  };

  setFooterMenuTab = (tab) => {
    this.setState({ footerMenuTab: tab });
  };

  setIsMusicPlayerActive = (isActive) => {
    this.setState({ isMusicPlayerActive: isActive });
  };

  addLikedSong = (song) => {
    this.setState(prevState => ({
      likedSongs: [...prevState.likedSongs, song]
    }));
  };

  removeLikedSong = (songId) => {
    this.setState(prevState => ({
      likedSongs: prevState.likedSongs.filter(song => song.id !== songId)
    }));
  };

  isSongLiked = (songId) => {
    return this.state.likedSongs.some(song => song.id === songId);
  };

  reverseLikedSongs = () => {
    this.setState(prevState => ({
      likedSongs: [...prevState.likedSongs].reverse()
    }));
  };

  render() {
    const { pathname } = this.props.location;
    const contextValue = {
      footerMenuTab: this.state.footerMenuTab,
      setFooterMenuTab: this.setFooterMenuTab,
      isMusicPlayerActive: this.state.isMusicPlayerActive,
      setIsMusicPlayerActive: this.setIsMusicPlayerActive,
    };

    const likedSongsContextValue = {
      likedSongs: this.state.likedSongs,
      addLikedSong: this.addLikedSong,
      removeLikedSong: this.removeLikedSong,
      isSongLiked: this.isSongLiked,
      reverseLikedSongs: this.reverseLikedSongs,
    };

    return (
      <PlaylistProvider>
        <FooterMenuContext.Provider value={contextValue}>
          <LikedSongsContext.Provider value={likedSongsContextValue}>
            {/* {pathname !== "/music" && <FooterMenu />}
            {pathname !== "/login" && <FooterMenu />}
             */}
             {(pathname !== "/music" && pathname !== "/temp" && !pathname.includes("/playlist-detail/") && !this.state.isMusicPlayerActive) && <FooterMenu />}
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/temp" element={<AudioPlayer />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/playlist/:type" element={<PlaylistPage />} />
              <Route path="/playlist-detail/:playlistName" element={<PlaylistDetailPage />} />
            </Routes>
          </LikedSongsContext.Provider>
        </FooterMenuContext.Provider>
      </PlaylistProvider>
    );
  }
}

export default AppWrapper;
