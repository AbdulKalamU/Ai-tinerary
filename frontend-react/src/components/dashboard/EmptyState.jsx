import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <div className="py-32 flex flex-col items-center justify-center text-center border-t border-b border-[#222]">
      <h3 className="text-3xl font-medium tracking-tight text-white mb-4">
        No itineraries found.
      </h3>
      <p className="text-[#A3A3A3] max-w-md mb-10 font-light tracking-tight text-lg leading-relaxed">
        Your canvas is blank. Begin by defining your next destination.
      </p>
      <Link to="/plan/new" className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform">
        Create Itinerary
      </Link>
    </div>
  );
}
