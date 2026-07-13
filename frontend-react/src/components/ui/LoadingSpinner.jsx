export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      {/* Sleek, pulsing circle animation */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border border-[#333] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-0 rounded-full border border-[#222] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="w-16 h-16 rounded-full border-t-2 border-l-2 border-white animate-spin"></div>
        <div className="absolute w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#737373] font-medium mb-3">
          Synthesizing
        </span>
        <h2 className="text-xl font-light text-white tracking-wide">
          Architecting your journey
        </h2>
        <div className="mt-4 flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
