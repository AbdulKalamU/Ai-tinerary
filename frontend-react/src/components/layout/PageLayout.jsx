import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black relative text-white font-sans selection:bg-white selection:text-black">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-16 flex flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
