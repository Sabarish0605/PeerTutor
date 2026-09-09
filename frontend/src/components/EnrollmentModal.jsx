import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function EnrollmentModal({ course, onClose, onConfirm }) {
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const handleConfirm = () => {
        if (!selectedSlotId) {
            toast.error("Please select a time slot to enroll.");
            return;
        }
        onConfirm(selectedSlotId);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">event_available</span>
                        <h2 className="text-sm text-gray-900 font-bold uppercase tracking-wider">Select Session</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    <h3 className="text-lg text-gray-900 font-bold mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">Choose an available time slot to schedule your learning session.</p>

                    {(!course.slots || course.slots.length === 0) ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                            No upcoming sessions scheduled for this course.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {course.slots.map(slot => {
                                const isFull = slot.currentEnrolled >= slot.maxSeats;
                                const isSelected = selectedSlotId === slot.id;
                                const dateObj = new Date(slot.slotDateTime);

                                return (
                                    <button
                                        key={slot.id}
                                        disabled={isFull}
                                        onClick={() => setSelectedSlotId(slot.id)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex flex-col gap-3 group
                                            ${isFull ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : 
                                              isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' : 
                                              'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div className={`flex items-center gap-2 text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'}`}>
                                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                                {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wider ${isFull ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                {isFull ? 'Full' : `${slot.maxSeats - slot.currentEnrolled} Seats Left`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">group</span> {slot.currentEnrolled} / {slot.maxSeats} Enrolled</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedSlotId || (!course.slots || course.slots.length === 0)}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
