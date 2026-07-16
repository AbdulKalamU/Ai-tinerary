import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Clock, Plus, ChevronDown, ChevronUp, Share2, MoreHorizontal } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getPlanById, reorderActivities } from '../api/plans';
import { formatDateRange, calculateDuration } from '../utils/formatters';
import toast from 'react-hot-toast';
import ActivityImage from '../components/ui/ActivityImage';
import LocationPickerModal from '../components/ui/LocationPickerModal';
import { DaySkeleton } from '../components/ui/Skeleton';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({ 1: true });
  const [parsedData, setParsedData] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeDayForPicker, setActiveDayForPicker] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const data = await getPlanById(id);
      setPlan(data);
      
      if (data.itineraryDays) {
        const safeParse = (str) => {
          if (!str) return null;
          try { return JSON.parse(str); } catch (e) { return null; }
        };

        const mappedData = {
          overview: data.itineraryDays.length > 0 ? data.itineraryDays[0].overview : "A tailored trip.",
          budget: safeParse(data.budgetEstimate),
          phrases: safeParse(data.localPhrases),
          packing: safeParse(data.packingTips),
          safety: safeParse(data.safetyTips),
          food: safeParse(data.foodRecommendations),
          days: data.itineraryDays.map(day => ({
            id: day.id,
            day: day.dayIndex,
            title: day.title,
            activities: day.activities.map(act => {
              let location = null;
              if (act.locationData) {
                try { location = JSON.parse(act.locationData); } catch (e) {}
              }
              let formattedTime = act.startTime;
              if (act.startTime && act.startTime.includes(':')) {
                try {
                  const [hours, minutes] = act.startTime.split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch(e) {}
              }
              return {
                id: act.id,
                time: formattedTime,
                name: act.name,
                description: act.description,
                category: act.category,
                location: location
              };
            })
          }))
        };
        setParsedData(mappedData);
      }
    } catch (err) {
      toast.error('Failed to load trip plan');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceDayIndex = parseInt(source.droppableId.split('-')[1]);
    const destDayIndex = parseInt(destination.droppableId.split('-')[1]);

    if (sourceDayIndex !== destDayIndex) {
      toast.error("Moving activities between days is not yet supported.");
      return;
    }

    const newParsedData = { ...parsedData };
    const sourceDay = newParsedData.days[sourceDayIndex];
    const [movedActivity] = sourceDay.activities.splice(source.index, 1);
    sourceDay.activities.splice(destination.index, 0, movedActivity);
    setParsedData(newParsedData);
    
    try {
      const activityIds = sourceDay.activities.map(a => a.id);
      await reorderActivities(sourceDay.id, activityIds);
    } catch (err) {
      toast.error("Failed to save reordered activities.");
    }
  };

  const handleAddLocation = (item) => {
    const newParsedData = { ...parsedData };
    const dayIndex = newParsedData.days.findIndex(d => d.day === activeDayForPicker);
    if (dayIndex !== -1) {
      const newActivity = {
        id: item.id || `custom-${Date.now()}`,
        time: 'TBD',
        name: item.name,
        description: `Added: ${item.category}`,
        category: item.category,
        location: item.location || null
      };
      newParsedData.days[dayIndex].activities.push(newActivity);
      setParsedData(newParsedData);
      toast.success(`Added ${item.name} to Day ${activeDayForPicker}`);
      // Note: This only updates the frontend state. Backend save would go here.
    }
  };

  const allLocations = [];
  if (parsedData?.days) {
    parsedData.days.forEach(day => {
      day.activities?.forEach(act => {
        if (act.location && act.location.lat && act.location.lng) {
          allLocations.push({ ...act.location, day: day.day, activityName: act.name });
        }
      });
    });
  }

  if (loading) return <div className="p-20"><DaySkeleton /></div>;
  if (!plan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#030303] h-screen text-white flex flex-col overflow-hidden"
    >
      {/* Immersive Hero Header */}
      <div className="relative h-[45vh] w-full shrink-0">
        <ActivityImage 
          name={plan.destination} 
          category="city" 
          uniqueId={plan.id}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-black/20"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 pb-16 z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tighter mb-4 text-white drop-shadow-lg">
              {plan.destination}
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="glass-pill px-4 py-2 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/70" />
                {formatDateRange(plan.startDate, plan.endDate)}
              </span>
              <span className="glass-pill px-4 py-2 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/70" />
                {calculateDuration(plan.startDate, plan.endDate)} Days
              </span>
              {plan.groupType && (
                <span className="glass-pill px-4 py-2 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/70" />
                  {plan.groupType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="glass-pill px-6 py-3 font-medium text-white hover:bg-white hover:text-black transition-colors"
            >
              Dashboard
            </button>
            <button className="glass-pill w-12 h-12 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Split Pane Workspace */}
      <div className="flex flex-1 relative -top-8 bg-[#030303] rounded-t-[2rem] z-20 overflow-hidden">
        
        {/* Left Pane: Itinerary Feed */}
        <div className="w-full lg:w-1/2 xl:w-5/12 overflow-y-auto hide-scrollbar pb-32 px-8 md:px-12 relative">
          
          {/* Navigation Tabs */}
          <div className="flex gap-6 border-b border-white/10 mb-10 pb-4 sticky top-0 bg-[#030303] z-30 pt-8 md:pt-12 -mx-8 px-8 md:-mx-12 md:px-12">
            {['itinerary', 'budget', 'culture', 'preparation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium uppercase tracking-widest transition-colors ${
                  activeTab === tab ? 'text-white' : 'text-[#555] hover:text-[#999]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'itinerary' && (
            <DragDropContext onDragEnd={onDragEnd}>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                }}
              >
              {parsedData?.days?.map((dayObj, index) => (
                <motion.div 
                  key={index} 
                  className="mb-12"
                  variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25 } } }}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-6 sticky top-[88px] bg-[#030303] py-4 z-20 -mx-8 px-8 md:-mx-12 md:px-12">
                    <div className="flex items-baseline gap-4">
                      <span className="text-sm font-medium tracking-widest text-[#A3A3A3] uppercase">Day {dayObj.day}</span>
                      <h3 className="text-2xl font-medium tracking-tight text-white">{dayObj.title}</h3>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveDayForPicker(dayObj.day);
                        setIsPickerOpen(true);
                      }}
                      className="glass-pill-hover w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/5 border border-white/10 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Day Content */}
                  <Droppable droppableId={`day-${index}`}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                        {dayObj.activities?.map((activity, actIdx) => (
                          <Draggable key={`${index}-${actIdx}`} draggableId={`${index}-${actIdx}`} index={actIdx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group relative rounded-3xl overflow-hidden bg-[#0A0A0B] border ${snapshot.isDragging ? 'border-white/40 shadow-2xl z-50' : 'border-[#1a1a1a] hover:border-[#333]'} transition-colors duration-300`}
                              >
                                <div className="flex flex-col sm:flex-row h-full">
                                  {/* Image side */}
                                  <div className="w-full sm:w-40 h-40 sm:h-auto relative">
                                    <ActivityImage 
                                      name={activity.name} 
                                      destination={plan.destination} 
                                      category={activity.category} 
                                      uniqueId={activity.id} 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 glass-pill px-2.5 py-1 text-[10px] font-medium tracking-widest uppercase">
                                      {activity.time}
                                    </div>
                                  </div>
                                  
                                  {/* Content side */}
                                  <div className="p-6 flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                      {activity.category && (
                                        <span className="text-[10px] font-medium text-[#737373] uppercase tracking-widest flex items-center gap-1">
                                          <MapPin className="w-3 h-3" /> {activity.category}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xl font-medium text-white mb-2">{activity.name}</h4>
                                    <p className="text-[#A3A3A3] text-sm font-light leading-relaxed line-clamp-2">{activity.description}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              ))}
              </motion.div>
            </DragDropContext>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-3xl font-medium mb-2">Financial Clarity</h3>
                <p className="text-[#A3A3A3] font-light mb-8">Transparent tiered projections for your journey.</p>
                {parsedData?.budget ? (
                  <div className="grid gap-6">
                    {Object.entries(parsedData.budget).map(([tier, estimate], idx) => (
                      <div key={idx} className="bg-[#0A0A0B] border border-[#1a1a1a] rounded-3xl p-8 hover:border-[#333] transition-colors">
                        <div className="text-[10px] uppercase tracking-widest text-[#737373] mb-3">{tier} Tier</div>
                        <div className="text-2xl font-light text-white">{estimate}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#555]">No budget projections generated for this trip.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'culture' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-3xl font-medium mb-2">Cultural Fluency</h3>
                <p className="text-[#A3A3A3] font-light mb-8">Essential phrases and etiquette.</p>
                
                {parsedData?.phrases && parsedData.phrases.length > 0 ? (
                  <div className="grid gap-4 mb-12">
                    <h4 className="text-sm font-medium tracking-widest text-[#737373] uppercase mb-2">Local Phrases</h4>
                    {parsedData.phrases.map((phraseObj, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0A0A0B] border border-[#1a1a1a] rounded-2xl p-6">
                        <div>
                          <div className="text-lg font-medium text-white mb-1">{phraseObj.phrase}</div>
                          <div className="text-sm text-[#A3A3A3] font-light">{phraseObj.meaning}</div>
                        </div>
                        <div className="text-xs text-[#555] font-mono mt-3 sm:mt-0 bg-white/5 px-3 py-1.5 rounded-full">
                          {phraseObj.pronunciation}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#555] mb-12">No local phrases available.</p>
                )}

                {parsedData?.food && parsedData.food.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium tracking-widest text-[#737373] uppercase mb-4">Culinary Exploration</h4>
                    <div className="grid gap-4">
                      {parsedData.food.map((dish, idx) => (
                        <div key={idx} className="bg-[#0A0A0B] border border-[#1a1a1a] rounded-2xl p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-lg font-medium text-white">{dish.name}</h5>
                            <span className="text-xs text-[#737373] border border-[#333] px-2 py-1 rounded-full">{dish.priceRange}</span>
                          </div>
                          <p className="text-sm text-[#A3A3A3] font-light">{dish.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preparation' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-3xl font-medium mb-2">Preparation</h3>
                <p className="text-[#A3A3A3] font-light mb-8">What to know before you arrive.</p>

                {parsedData?.packing && parsedData.packing.length > 0 && (
                  <div className="mb-12">
                    <h4 className="text-sm font-medium tracking-widest text-[#737373] uppercase mb-4">Packing Tips</h4>
                    <ul className="space-y-3">
                      {parsedData.packing.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-4 bg-[#0A0A0B] border border-[#1a1a1a] p-5 rounded-2xl">
                          <span className="text-[#555] mt-0.5">•</span>
                          <span className="text-[#A3A3A3] font-light leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedData?.safety && parsedData.safety.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium tracking-widest text-[#737373] uppercase mb-4">Safety & Etiquette</h4>
                    <ul className="space-y-3">
                      {parsedData.safety.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-4 bg-[#0A0A0B] border border-[#1a1a1a] p-5 rounded-2xl">
                          <span className="text-[#555] mt-0.5">•</span>
                          <span className="text-[#A3A3A3] font-light leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        
        {/* Right Pane: Sticky Map */}
        <div className="hidden lg:block w-1/2 xl:w-7/12 relative bg-[#111] border-l border-white/5">
          {allLocations.length > 0 ? (
            <MapContainer 
              center={[allLocations[0].lat, allLocations[0].lng]} 
              zoom={13} 
              scrollWheelZoom={true} 
              className="h-full w-full"
            >
              {/* Standard classic OpenStreetMap tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {allLocations.map((loc, idx) => (
                <Marker key={idx} position={[loc.lat, loc.lng]}>
                  <Popup className="custom-popup">
                    <div className="font-medium text-black">Day {loc.day}</div>
                    <div className="text-gray-600 text-xs mt-1">{loc.activityName}</div>
                  </Popup>
                </Marker>
              ))}
              <MapBounds positions={allLocations.map(l => [l.lat, l.lng])} />
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[#555]">
              No location data available.
            </div>
          )}
          
          {/* Overlay gradient to soften map edges */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_40px_0_40px_rgba(3,3,3,1)] z-[400]"></div>
        </div>
      </div>

      <LocationPickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        destination={plan.destination}
        onAdd={handleAddLocation}
      />

    </motion.div>
  );
}
