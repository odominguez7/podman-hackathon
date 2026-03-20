import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalendarCheck, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const BookingModal = ({ open, onClose }: BookingModalProps) => {
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      onClose();
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Book Wellness Class
          </DialogTitle>
          <DialogDescription>Take a moment for yourself</DialogDescription>
        </DialogHeader>

        {!booked ? (
          <div className="space-y-4 pt-2">
            <div className="bg-accent rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground">
                Down Under Yoga — Restorative Flow
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Today, 6:00 PM — 7:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Studio B, Level 2</span>
              </div>
              <p className="text-xs text-muted-foreground">
                A gentle, restorative session designed to release tension and promote deep relaxation.
              </p>
            </div>
            <Button variant="hero" className="w-full" onClick={handleBook}>
              Confirm Booking
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <div className="text-4xl">✅</div>
            <p className="font-semibold text-foreground">Booking Confirmed!</p>
            <p className="text-sm text-muted-foreground">See you at 6:00 PM. Namaste 🧘</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
