import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck, MapPin, Clock, Dumbbell, Brain, Wind, Footprints,
  Flame, Heart, Music, Leaf, Sun, Coffee, Crown
} from "lucide-react";

interface BookingInlineProps {
  recommended?: string;
  onBook: (activityId: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: Crown, color: "text-primary bg-primary/10" },
  { id: "calm", label: "Calm", icon: Leaf, color: "text-green-600 bg-green-500/10" },
  { id: "energize", label: "Energize", icon: Flame, color: "text-orange-600 bg-orange-500/10" },
  { id: "focus", label: "Focus", icon: Brain, color: "text-purple-600 bg-purple-500/10" },
  { id: "recover", label: "Recovery", icon: Heart, color: "text-rose-600 bg-rose-500/10" },
];

const ACTIVITIES = [
  { id: "yoga-restorative", name: "Restorative Yoga", category: "calm", duration: "45 min", provider: "Down Under Yoga", location: "Studio B, Level 2", time: "6:00 PM", description: "Gentle poses and deep breathing to release tension and promote relaxation.", icon: Leaf, intensity: "Low" },
  { id: "meditation-guided", name: "Guided Meditation", category: "calm", duration: "20 min", provider: "YU Wellness Room", location: "Quiet Room, Floor 3", time: "12:30 PM", description: "Mindfulness session with body scan and visualization. Perfect for midday reset.", icon: Brain, intensity: "Low" },
  { id: "breathwork", name: "Box Breathing Session", category: "calm", duration: "10 min", provider: "YU Shield", location: "Anywhere (guided audio)", time: "On demand", description: "4-4-4-4 breathing technique to activate parasympathetic nervous system.", icon: Wind, intensity: "Low" },
  { id: "nature-walk", name: "Mindful Nature Walk", category: "calm", duration: "30 min", provider: "Charles River Path", location: "Meet at lobby", time: "5:30 PM", description: "Guided walking meditation along the river. Fresh air + movement + mindfulness.", icon: Footprints, intensity: "Low" },
  { id: "sound-bath", name: "Sound Bath", category: "calm", duration: "40 min", provider: "Harmony Studio", location: "Studio A, Level 1", time: "7:00 PM", description: "Tibetan singing bowls and ambient sound for deep nervous system reset.", icon: Music, intensity: "Low" },
  { id: "hiit", name: "HIIT Express", category: "energize", duration: "25 min", provider: "FitHub Boston", location: "Gym, Level B1", time: "7:00 AM", description: "High-intensity intervals to boost endorphins and energy for the day.", icon: Flame, intensity: "High" },
  { id: "power-yoga", name: "Power Vinyasa", category: "energize", duration: "50 min", provider: "Down Under Yoga", location: "Studio A, Level 2", time: "6:30 AM", description: "Dynamic flow sequence building heat and strength. Leave feeling unstoppable.", icon: Sun, intensity: "High" },
  { id: "running-club", name: "Morning Run Club", category: "energize", duration: "35 min", provider: "YU Running Crew", location: "Meet at lobby", time: "6:45 AM", description: "Group 5K run along the Esplanade. All paces welcome.", icon: Footprints, intensity: "High" },
  { id: "cycling", name: "Spin Class", category: "energize", duration: "40 min", provider: "FitHub Boston", location: "Cycling Studio, Level B1", time: "12:00 PM", description: "Rhythm-based cycling with motivating playlists. Great lunchtime energy boost.", icon: Dumbbell, intensity: "High" },
  { id: "yoga-focus", name: "Focus Flow Yoga", category: "focus", duration: "30 min", provider: "Down Under Yoga", location: "Studio B, Level 2", time: "8:00 AM", description: "Targeted sequence for mental clarity. Balance poses + breathwork = laser focus.", icon: Brain, intensity: "Medium" },
  { id: "cold-plunge", name: "Cold Plunge + Sauna", category: "focus", duration: "20 min", provider: "FitHub Boston", location: "Wellness Center, Level B1", time: "Available all day", description: "Contrast therapy for dopamine spike and mental sharpness.", icon: Wind, intensity: "Medium" },
  { id: "journaling", name: "Guided Journaling", category: "focus", duration: "15 min", provider: "YU Shield", location: "Anywhere (guided prompts)", time: "On demand", description: "Structured prompts to organize thoughts before a big meeting or decision.", icon: Coffee, intensity: "Low" },
  { id: "stretch", name: "Deep Stretch Class", category: "recover", duration: "40 min", provider: "FitHub Boston", location: "Studio C, Level B1", time: "5:00 PM", description: "Full-body stretch focusing on hips, shoulders, and back. Perfect after desk work.", icon: Heart, intensity: "Low" },
  { id: "massage", name: "Chair Massage", category: "recover", duration: "15 min", provider: "Restore Wellness", location: "Floor 2 Lounge", time: "2:00 PM - 4:00 PM", description: "Quick upper body massage to release tension from screen time.", icon: Heart, intensity: "Low" },
  { id: "yin-yoga", name: "Yin Yoga", category: "recover", duration: "60 min", provider: "Down Under Yoga", location: "Studio B, Level 2", time: "7:30 PM", description: "Long-held poses targeting deep connective tissue. Best for chronic tension.", icon: Leaf, intensity: "Low" },
  { id: "foam-rolling", name: "Self-Massage & Foam Rolling", category: "recover", duration: "20 min", provider: "YU Shield", location: "Anywhere (video guide)", time: "On demand", description: "Guided foam rolling routine for full-body recovery. Great post-workout.", icon: Dumbbell, intensity: "Low" },
];

const BookingInline = ({ recommended = "all", onBook }: BookingInlineProps) => {
  const [activeCategory, setActiveCategory] = useState(recommended);
  const [booked, setBooked] = useState<string | null>(null);

  const filtered = activeCategory === "all" ? ACTIVITIES : ACTIVITIES.filter(a => a.category === activeCategory);
  const bookedActivity = ACTIVITIES.find(a => a.id === booked);

  const handleBook = (id: string) => {
    setBooked(id);
    onBook(id);
    setTimeout(() => setBooked(null), 3000);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">YU Shield Membership</h3>
        </div>
        <p className="text-xs text-muted-foreground">Book wellbeing activities included in your membership</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? `${cat.color} ring-1 ring-current/20`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-3 w-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Booked confirmation */}
      {booked && bookedActivity && (
        <div className="rounded-2xl border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20 p-5 text-center space-y-2 animate-in fade-in">
          <CalendarCheck className="h-8 w-8 text-green-600 mx-auto" />
          <p className="font-bold text-foreground">Booked!</p>
          <p className="text-sm text-foreground">{bookedActivity.name}</p>
          <p className="text-xs text-muted-foreground">{bookedActivity.time} · {bookedActivity.location}</p>
          <p className="text-[10px] text-green-600">Calendar invite sent. See you there!</p>
        </div>
      )}

      {/* Activity cards */}
      <div className="space-y-2">
        {filtered.map((activity) => {
          const Icon = activity.icon;
          const catColor = CATEGORIES.find(c => c.id === activity.category)?.color || "bg-muted";
          return (
            <div
              key={activity.id}
              className="rounded-xl border border-border bg-card hover:bg-accent/30 transition-all p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{activity.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{activity.provider}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  activity.intensity === "High" ? "bg-orange-500/10 text-orange-600" :
                  activity.intensity === "Medium" ? "bg-amber-500/10 text-amber-600" :
                  "bg-green-500/10 text-green-600"
                }`}>
                  {activity.intensity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{activity.description}</p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{activity.duration}</span>
                  <span className="flex items-center gap-0.5"><CalendarCheck className="h-3 w-3" />{activity.time}</span>
                  <span className="flex items-center gap-0.5 hidden sm:flex"><MapPin className="h-3 w-3" />{activity.location}</span>
                </div>
                <Button
                  size="sm"
                  variant="hero"
                  className="h-7 text-xs px-4"
                  onClick={() => handleBook(activity.id)}
                  disabled={booked === activity.id}
                >
                  {booked === activity.id ? "Booked!" : "Book"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-muted-foreground py-2">
        All activities included in your YU Shield membership. No extra fees.
      </p>
    </div>
  );
};

export default BookingInline;
