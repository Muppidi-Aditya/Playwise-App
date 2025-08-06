import React, { useState, useEffect, useRef } from "react";

export default function YouTubeAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef(null);
  
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'bzSTpdcs-EI', // Video ID from URL
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
          rel: 0
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    };
  }, []);

  const togglePlayPause = () => {
    if (!playerRef.current || !isReady) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">YouTube Audio Player</h2>
      
      <button 
        onClick={togglePlayPause}
        disabled={!isReady}
        className={`px-6 py-2 rounded font-medium transition-colors ${
          isReady 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
      </button>

      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ opacity: 0, position: 'absolute', left: '-9999px' }}></div>
    </div>
  );
}