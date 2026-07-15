export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-transparent mt-auto relative z-10">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="text-sm text-[#555] font-light tracking-wide">
          © 2026 AI-Tinerary. All rights reserved.
        </span>
        <div className="flex gap-8 text-sm text-[#555] font-light">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
