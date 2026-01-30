
import React from 'react';
import { CheckSquare } from 'lucide-react';

interface Requirement {
    id: string;
    text: string;
    status: 'pending' | 'completed' | 'waived';
}

interface RequirementsChecklistProps {
    requirements: Requirement[];
}

export const RequirementsChecklist: React.FC<RequirementsChecklistProps> = ({ requirements }) => {
    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-lg">
             <div className="p-4 border-b border-white/10">
                <h4 className="flex items-center text-sm font-bold italic text-white">
                    <CheckSquare size={16} className="mr-2 text-amber-400" />
                    Extracted Requirements
                </h4>
            </div>
            <div className="p-4 space-y-3">
                {requirements.map(req => (
                    <div key={req.id} className="flex items-center bg-zinc-800 p-3 rounded-md">
                        <input type="checkbox" className="w-4 h-4 rounded bg-zinc-700 border-zinc-600 text-amber-500" />
                        <label className="ml-3 text-sm text-zinc-300">{req.text}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};
