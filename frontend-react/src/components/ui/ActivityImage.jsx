import { useState, useEffect } from 'react';
import { MapPin, Image as ImageIcon } from 'lucide-react';

export default function ActivityImage({ name, destination, category, uniqueId, className = "h-full w-full relative overflow-hidden bg-[#0A0A0B]", children }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const isLandmark = category === 'sightseeing' || category === 'cultural' || category === 'city' || category === 'Attraction';
        
        // 1. For specific landmarks, always try to get the real photo from Wikipedia first
        if (isLandmark) {
          const query = encodeURIComponent(`${name}`);
          const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`);
          const data = await res.json();
          
          if (data && data.query && data.query.pages) {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
              setImageUrl(pages[pageId].thumbnail.source);
              setLoading(false);
              return;
            }
          }
        }
        
        // 2. If it's a generic activity or Wikipedia didn't have a photo
        const searchTag = isLandmark ? 'landmark,travel' : `${category},travel`;
        setImageUrl(`https://loremflickr.com/600/400/${searchTag}/all?lock=${uniqueId}`);
      } catch (err) {
        // Ultimate fallback
        setImageUrl(`https://picsum.photos/seed/${uniqueId}/600/400`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchImage();
  }, [name, destination, category, uniqueId]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center animate-pulse bg-[#111]`}>
        <ImageIcon className="w-8 h-8 text-[#333] relative z-0" />
        <div className="relative z-10 w-full h-full flex items-end">{children}</div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className={className}>
        <img 
          src={imageUrl} 
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
             e.target.onerror = null;
             e.target.src = `https://picsum.photos/seed/${uniqueId}/600/400`;
          }}
        />
        {/* Render children (overlays, pills, text) passed by the parent component */}
        {children && (
          <div className="relative z-10 w-full h-full flex flex-col justify-end">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Fallback if everything fails
  return (
    <div className={`${className} bg-[#111] flex flex-col items-center justify-center`}>
       {!children && <MapPin className="w-8 h-8 text-[#333] mb-2 relative z-0" />}
       {!children && <span className="text-xs text-[#555] font-medium px-4 text-center line-clamp-2 relative z-0">{name}</span>}
       {children && (
         <div className="relative z-10 w-full h-full flex flex-col justify-end">
           {children}
         </div>
       )}
    </div>
  );
}
