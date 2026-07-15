import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black relative text-white font-sans selection:bg-white selection:text-black">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <motion.main 
          className="flex-1 pt-16 flex flex-col"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </div>
  );
}
