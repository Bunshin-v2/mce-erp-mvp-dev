
import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

// This would typically come from your types file
interface CommsEvent {
    id: string;
    event_type: string;
    direction: string;
    with_party: string;
    outcome: string;
    notes: string;
    event_at: string;
    logged_by_user_id: string;
}

interface CommsLogProps {
    tenderId: string;
    commsEvents: CommsEvent[];
    onAddComms: (newEvent: Omit<CommsEvent, 'id' | 'tender_id' | 'created_at' | 'logged_by_user_id' | 'event_at'>) => Promise<void>;
}

export const CommsLog: React.FC<CommsLogProps> = ({ tenderId, commsEvents, onAddComms }) => {
    const [notes, setNotes] = useState('');
    const [eventType, setEventType] = useState('call');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;

        const newEvent = {
            event_type: eventType,
            direction: 'outbound', // Assuming a simple default
            with_party: 'Client', // Placeholder
            outcome: 'Follow-up', // Placeholder
            notes,
        };

        await onAddComms(newEvent);
        setNotes('');
    };

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-lg">
            <div className="p-4 border-b border-white/10">
                <h4 className="flex items-center text-sm font-bold italic text-white">
                    <MessageSquare size={16} className="mr-2 text-sky-400" />
                    Communication Log
                </h4>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {commsEvents.map(event => (
                    <div key={event.id} className="text-xs">
                        <div className="flex justify-between items-center">
                            <span className="font-bold italic text-sky-300 capitalize">{event.event_type}</span>
                            <span className="text-zinc-500">{new Date(event.event_at).toLocaleString()}</span>
                        </div>
                        <p className="text-zinc-300 mt-1">{event.notes}</p>
                    </div>
                ))}
                 {commsEvents.length === 0 && (
                    <p className="text-center text-zinc-500 text-xs py-8">No communication events logged.</p>
                )}
            </div>

            <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Log a new call, email, or meeting..."
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-sky-500 outline-none"
                        rows={3}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="bg-black/30 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                        </select>
                        <button type="submit" className="flex items-center bg-sky-600 hover:bg-sky-500 text-white font-bold italic text-xs px-4 py-2 rounded-lg transition-colors">
                            <Send size={14} className="mr-2" />
                            Log Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
