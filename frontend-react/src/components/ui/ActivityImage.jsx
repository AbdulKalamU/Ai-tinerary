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
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        
        try {
          const res = await fetch(`${backendUrl}/api/v1/places/photo?query=${query}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.url) {
              setImageUrl(data.url);
              setLoading(false);
              return;
            }
          }
        } catch (networkErr) {
          console.warn('Backend fetch failed, falling back to Pexels', networkErr);
        }
        
        // --- SMART FALLBACK (Pexels) ---
        // If Google Places returned 404 or the backend fetch threw a network error
        try {
          const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;
          if (pexelsKey) {
            const pexelsQuery = encodeURIComponent(category === 'city' ? name : `${name} travel`);
            const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${pexelsQuery}&per_page=1`, {
              headers: { Authorization: pexelsKey }
            });
            
            if (pexelsRes.ok) {
              const pexelsData = await pexelsRes.json();
              if (pexelsData.photos && pexelsData.photos.length > 0) {
                setImageUrl(pexelsData.photos[0].src.large2x || pexelsData.photos[0].src.large);
                setLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Pexels fallback failed', e);
        }
        
        // If everything fails, leave imageUrl as null for the gradient fallback
      } catch (err) {
        // Leave as null on unexpected error
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
