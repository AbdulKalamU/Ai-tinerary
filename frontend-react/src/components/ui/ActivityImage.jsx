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
        
        // Fallback if backend fails
        setImageUrl(`https://picsum.photos/seed/${uniqueId}/600/400`);
      } catch (err) {
        // Ultimate fallback
        setImageUrl(`https://picsum.photos/seed/${uniqueId}/600/400`);
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
             e.target.onerror = null;
             e.target.src = `https://picsum.photos/seed/${uniqueId}/600/400`;
          }}
        />
      )}

      {/* Fallback if no image URL and not loading */}
      {!loading && !imageUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <MapPin className="w-8 h-8 text-[#333] mb-2" />
          <span className="text-xs text-[#555] font-medium px-4 text-center line-clamp-2">{name}</span>
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
