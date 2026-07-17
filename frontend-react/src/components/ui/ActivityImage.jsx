import { useState, useEffect } from 'react';
import { MapPin, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityImage({ name, destination, category, uniqueId, className = "h-full w-full relative overflow-hidden bg-[#0A0A0B]", children }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = encodeURIComponent(`${name} ${destination || ''}`.trim());
        
        // Fetch from our secure backend endpoint. 
        // The API key is safely stored on the backend, not exposed to the browser!
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${backendUrl}/api/v1/places/photo?query=${query}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setImageUrl(data.url);
            setLoading(false);
            return;
          }
        }
        
        // --- SMART FALLBACK ---
        // If Google Places fails (e.g., generic activity), extract keywords for a smart stock photo
        const isLandmark = category === 'sightseeing' || category === 'cultural' || category === 'city' || category === 'Attraction';
        
        if (isLandmark) {
          try {
            const wikiQuery = encodeURIComponent(`${name}`);
            const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${wikiQuery}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`);
            const wikiData = await wikiRes.json();
            
            if (wikiData && wikiData.query && wikiData.query.pages) {
              const pages = wikiData.query.pages;
              const pageId = Object.keys(pages)[0];
              if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
                setImageUrl(pages[pageId].thumbnail.source);
                setLoading(false);
                return;
              }
            }
          } catch (e) {}
        }
        
        // If Wikipedia fails (or it wasn't a landmark), we just leave imageUrl as null.
        // This will trigger the beautiful gradient fallback UI below!
        
      } catch (err) {
        // Leave as null on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchImage();
  }, [name, destination, category, uniqueId]);

  return (
    <div className={`${className} bg-[#111] flex flex-col items-center justify-center`}>
      
      {/* Loading Skeleton underneath */}
      {(!imageLoaded || loading) && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-[#111] z-0">
          <ImageIcon className="w-8 h-8 text-[#333]" />
        </div>
      )}

      {/* The actual image */}
      {imageUrl && (
        <motion.img 
          src={imageUrl} 
          alt={name}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onLoad={() => setImageLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover z-10"
          loading="lazy"
          onError={(e) => {
             // If image fails to load, hide it
             setImageUrl(null);
          }}
        />
      )}

      {/* Fallback if no image URL and not loading */}
      {!loading && !imageUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f]">
          <MapPin className="w-8 h-8 text-primary-500/50 mb-2" />
          <span className="text-xs text-white/40 font-medium px-4 text-center line-clamp-2 uppercase tracking-widest">{name}</span>
        </div>
      )}

      {/* Render children on top (overlays, text, buttons) */}
      {children && (
        <div className="relative z-20 w-full h-full flex flex-col justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
