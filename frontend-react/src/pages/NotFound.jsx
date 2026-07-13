import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 bg-black">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-[12rem] font-medium tracking-tighter text-white leading-none mb-4">404.</h1>
        <h2 className="text-2xl font-medium tracking-tight text-[#A3A3A3] mb-12">Trajectory undefined.</h2>
        <Link to="/" className="inline-flex items-center gap-2 border border-[#333] text-white px-8 py-4 text-sm font-medium hover:border-white transition-colors rounded-none">
          Return to base
        </Link>
      </div>
    </div>
  );
}
