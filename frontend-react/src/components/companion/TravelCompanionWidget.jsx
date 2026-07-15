import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  MapPin, 
  Clock, 
  Navigation, 
  Train, 
  PhoneCall, 
  Languages, 
  ShieldAlert, 
  Briefcase, 
  Send,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info,
  X,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { syncCompanion } from '../../api/companion';
import toast from 'react-hot-toast';

export default function TravelCompanionWidget({ planId, plan }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  
  const [context, setContext] = useState({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timeOfDay: 'Afternoon',
    weather: '72°F, Partly Cloudy',
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!planId || !plan) return;
    
    // Initialize context
    const hour = new Date().getHours();
    let timeOfDay = 'Night';
    if (hour >= 6 && hour < 11) timeOfDay = 'Morning';
    else if (hour >= 11 && hour < 14) timeOfDay = 'Lunch';
    else if (hour >= 14 && hour < 17) timeOfDay = 'Afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'Evening';
    
    setContext(prev => ({ ...prev, timeOfDay }));
    
    // Send initial proactive sync when mounted (silently)
    triggerSync(plan.destination, timeOfDay, null, null);
    
    const timer = setInterval(() => {
      const now = new Date();
      setContext(prev => ({
        ...prev,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }, 60000);
    
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, plan]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const triggerSync = async (location, timeOfDay, userMessage = null, activeAction = null) => {
    setIsTyping(true);
    try {
      const req = {
        planId: planId,
        localTime: context.time,
        timeOfDay: timeOfDay,
        currentLocation: location || plan?.destination || 'Unknown Location',
        weatherContext: context.weather,
        activeAction: activeAction,
        userMessage: userMessage
      };

      const response = await syncCompanion(req);
      
      const newMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.agentMessage,
        type: response.suggestionType, // proactive, reactive, action_response
        toolData: response.toolData
      };
      
      setMessages(prev => [...prev, newMsg]);
      
    } catch (error) {
      console.error(error);
      if (userMessage || activeAction) {
        toast.error("Failed to connect to Companion Engine.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    }]);
    
    const msg = inputValue;
    setInputValue('');
    triggerSync(plan?.destination, context.timeOfDay, msg, null);
  };

  const handleQuickAction = (action) => {
    setIsDrawerOpen(false);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: `I need help with: ${action}`
    }]);
    triggerSync(plan?.destination, context.timeOfDay, null, action);
  };

  const QUICK_ACTIONS = [
    { id: 'directions', icon: Navigation, label: 'Walking Directions' },
    { id: 'transit', icon: Train, label: 'Transit Updates' },
    { id: 'emergency', icon: PhoneCall, label: 'Emergency Contacts' },
    { id: 'translation', icon: Languages, label: 'Translate' },
    { id: 'safety', icon: ShieldAlert, label: 'Safety Alerts' },
    { id: 'packing', icon: Briefcase, label: 'Packing Reminders' },
  ];

  return createPortal(
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 transition-all flex items-center justify-center"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-600 animate-pulse"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] flex flex-col bg-[#050505] border border-[#222] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden font-sans"
          >
            {/* Header HUD */}
            <div className="bg-black/80 backdrop-blur-md border-b border-white/10 p-4 shrink-0 flex justify-between items-start shadow-sm">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-green-400">Live Companion</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {plan?.destination?.split(',')[0]}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {context.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowFeaturesModal(true)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-[#A3A3A3] hover:text-white">
                  <Info className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-[#A3A3A3] hover:text-white">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#030303] relative scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-6 opacity-60">
                  <Sparkles className="w-6 h-6 text-[#555] mx-auto mb-2" />
                  <p className="text-[#A3A3A3] text-xs max-w-[200px] mx-auto">
                    I'm monitoring your context and will proactively suggest activities.
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.type === 'proactive' && (
                      <span className="text-[9px] text-purple-400 font-bold tracking-widest uppercase mb-1 flex items-center gap-1 ml-1">
                        <Sparkles className="w-2.5 h-2.5" /> Proactive Alert
                      </span>
                    )}
                    
                    <div 
                      className={`max-w-[85%] p-3 rounded-2xl text-[14px] font-light leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600/90 text-white rounded-tr-sm' 
                          : msg.type === 'proactive' 
                            ? 'bg-[#1a1025] border border-purple-500/30 text-white rounded-tl-sm shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                            : 'bg-[#1a1a1a] text-white border border-white/5 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                      
                      {msg.toolData && Object.keys(msg.toolData).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-[#A3A3A3]">
                          <pre className="whitespace-pre-wrap font-mono">
                            {JSON.stringify(msg.toolData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-[#737373] animate-spin" />
                      <span className="text-xs text-[#737373]">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="shrink-0 bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-col relative z-10">
              
              {/* Quick Actions Drawer Toggle */}
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="w-full py-1.5 flex justify-center items-center text-[#555] hover:text-white transition-colors"
              >
                <motion.div animate={{ rotate: isDrawerOpen ? 180 : 0 }}>
                  <ChevronUp className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isDrawerOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-2 overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-1.5">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                        >
                          <action.icon className="w-4 h-4 text-blue-400" />
                          <span className="text-[9px] text-center font-medium text-[#A3A3A3] leading-tight">
                            {action.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Input */}
              <div className="p-3 pt-1">
                <form 
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-full p-1 focus-within:border-[#555] transition-colors"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent border-none text-white text-[13px] px-3 py-1.5 focus:outline-none focus:ring-0"
                    disabled={isTyping}
                  />
                  <button 
                    type="submit" 
                    disabled={!inputValue.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Info Modal */}
      <AnimatePresence>
        {showFeaturesModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeaturesModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10"
            >
              <button 
                onClick={() => setShowFeaturesModal(false)}
                className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-white bg-white/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              
              <h3 className="text-xl font-medium text-white mb-2">Live Companion</h3>
              <p className="text-[#A3A3A3] text-xs font-light mb-6">
                Your AI guide adapts in real-time to your context while traveling.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5">Proactive Alerts</h4>
                    <p className="text-[11px] text-[#737373] leading-relaxed">
                      Suggests activities based on time and weather.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-3 h-3 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5">Context Syncing</h4>
                    <p className="text-[11px] text-[#737373] leading-relaxed">
                      Monitors your location and time.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Navigation className="w-3 h-3 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5">Quick Actions</h4>
                    <p className="text-[11px] text-[#737373] leading-relaxed">
                      Instantly ask for directions or translations.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
