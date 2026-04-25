import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Youtube, Play, Sparkles, Loader2, X, Heart, Brain, Wind, Activity, Music } from 'lucide-react';

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://inv.thepixora.com',
  'https://yt.chocolatemoo53.com',
  'https://invidious.projectsegfau.lt',
  'https://yewtu.be'
];

// Fallback high-quality wellness videos in case search fails
const FALLBACK_VIDEOS = [
  { id: 'v7AYKMP6rOE', title: '20 Min Morning Yoga', author: 'Yoga With Adriene', thumbnail: 'https://img.youtube.com/vi/v7AYKMP6rOE/mqdefault.jpg', duration: 1200, published: 'Suggested', viewCount: 45000000 },
  { id: 'inpok4MKVLM', title: '10 Minute Daily Meditation', author: 'Goodful', thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/mqdefault.jpg', duration: 600, published: 'Suggested', viewCount: 22000000 },
  { id: '8VwufJrUgcM', title: 'Box Breathing Technique', author: 'The Art of Living', thumbnail: 'https://img.youtube.com/vi/8VwufJrUgcM/mqdefault.jpg', duration: 300, published: 'Suggested', viewCount: 5000000 },
  { id: '4pKly2JojMw', title: '15 Min Full Body Stretch', author: 'MadFit', thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/mqdefault.jpg', duration: 900, published: 'Suggested', viewCount: 15000000 },
  { id: 'ZToicY62f1U', title: 'Guided Mindfulness Meditation', author: 'Headspace', thumbnail: 'https://img.youtube.com/vi/ZToicY62f1U/mqdefault.jpg', duration: 600, published: 'Suggested', viewCount: 12000000 },
  { id: 'tybOi4hjZFQ', title: 'Wim Hof Method Guide', author: 'Wim Hof', thumbnail: 'https://img.youtube.com/vi/tybOi4hjZFQ/mqdefault.jpg', duration: 600, published: 'Suggested', viewCount: 30000000 }
];

const SUGGESTIONS = [
  { name: 'Yoga', icon: <Activity size={14} />, query: 'yoga flow' },
  { name: 'Meditation', icon: <Brain size={14} />, query: 'guided meditation' },
  { name: 'Exercise', icon: <Heart size={14} />, query: 'home workout' },
  { name: 'Breathing', icon: <Wind size={14} />, query: 'breathing exercise' },
  { name: 'Nature', icon: <Sparkles size={14} />, query: 'nature sounds 4k' },
  { name: 'Music', icon: <Music size={14} />, query: 'lofi study music' }
];

const Wellness = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [instanceIndex, setInstanceIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchVideos = useCallback(async (searchQuery = 'wellness relaxation', retryCount = 0) => {
    // If we've tried too many times, use fallback
    if (retryCount >= INVIDIOUS_INSTANCES.length) {
      if (videos.length === 0) {
        setVideos(FALLBACK_VIDEOS);
        setIsUsingFallback(true);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const instance = INVIDIOUS_INSTANCES[(instanceIndex + retryCount) % INVIDIOUS_INSTANCES.length];

    try {
      const response = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`, {
        signal: AbortSignal.timeout(5000) // 5s timeout per instance
      });

      if (!response.ok) throw new Error('Source failed');

      const data = await response.json();

      if (!data || data.length === 0) {
        if (searchQuery !== 'wellness relaxation') {
          setVideos([]);
          setLoading(false);
          return;
        }
        throw new Error('No results');
      }

      setVideos(data.slice(0, 12).map(v => ({
        id: v.videoId,
        title: v.title,
        thumbnail: v.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
        author: v.author,
        duration: v.lengthSeconds,
        published: v.publishedText,
        viewCount: v.viewCount
      })));
      setIsUsingFallback(false);
      setLoading(false);
      // Update global instance index to the one that worked
      setInstanceIndex((instanceIndex + retryCount) % INVIDIOUS_INSTANCES.length);
    } catch (err) {
      console.warn(`Instance ${instance} failed, trying next...`);
      fetchVideos(searchQuery, retryCount + 1);
    }
  }, [instanceIndex, videos.length]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchVideos(query); // Just search what the user typed
  };

  const handleSuggestion = (suggestionQuery) => {
    setQuery(suggestionQuery);
    fetchVideos(suggestionQuery);
  };

  const formatViews = (views) => {
    if (!views) return 'Featured';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 relative z-10 px-4">
      <div className="text-center space-y-6 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-2"
        >
          <Youtube size={16} />
          <span>Real-time YouTube Search</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent leading-none"
        >
          Wellness Hub
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Discover tranquility through movement, mindfulness, and music.
        </motion.p>
      </div>

      {/* Search & Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex items-center bg-[#0d0d12]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 pl-6">
            <Search className="text-gray-500 mr-4" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for yoga, meditation, exercise..."
              className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500 text-lg h-12"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              onClick={() => handleSuggestion(s.query)}
              className="px-4 py-2 rounded-full glass border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              {s.icon}
              {s.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="relative w-full min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading && videos.length === 0 ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium animate-pulse">Searching YouTube...</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              {isUsingFallback && !loading && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-amber-200/80 text-sm">
                  <Sparkles size={18} className="text-amber-500 shrink-0" />
                  <p>Global video servers are busy. Showing hand-picked suggestions for you.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video, idx) => (
                  <motion.div
                    key={`${video.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedVideo(video)}
                    className="group relative bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all cursor-pointer shadow-xl hover:shadow-indigo-500/5"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Play fill="white" size={24} className="ml-1" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-white">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-1">
                      <h3 className="font-bold text-gray-200 text-sm line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] text-gray-500 truncate max-w-[120px]">
                          {video.author}
                        </p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                          {formatViews(video.viewCount)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {videos.length === 0 && !loading && (
                <div className="text-center py-20 space-y-4">
                  <Youtube size={48} className="mx-auto text-gray-700" />
                  <p className="text-gray-400 text-lg">No results found for "{query}"</p>
                  <button onClick={() => fetchVideos()} className="glass-btn">Back to Suggestions</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-[#050508]/98 backdrop-blur-3xl"
              onClick={() => setSelectedVideo(null)}
            ></div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all z-20"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wellness;
