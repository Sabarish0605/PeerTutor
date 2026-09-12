import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Users, X, CalendarCheck } from 'lucide-react';
import { formatSafeDate, formatSafeTime, isSlotExpired } from '../utils/dateUtils';

export default function EnrollmentModal({ course, onClose, onConfirm }) {
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const upcomingSlots = (course?.slots || []).filter(slot => !isSlotExpired(slot));

    const handleConfirm = () => {
        if (!selectedSlotId) {
            toast.error("Please select a time slot to enroll.");
            return;
        }
        onConfirm(selectedSlotId);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
            <div
                className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                style={{
                    background: '#1c1c1c',
                    border: '1px solid #333333',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
                }}
            >
                {/* Header */}
                <div
                    className="px-6 py-4 flex justify-between items-center"
                    style={{
                        background: '#151515',
                        borderBottom: '1px solid #2a2a2a',
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <CalendarCheck size={18} color="#00C2CB" />
                        <h2 className="text-xs text-[#f1f1f1] font-bold uppercase tracking-wider">
                            Select Session
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#aaaaaa] hover:text-[#f1f1f1] hover:bg-[#272727] transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
                    <h3 className="text-lg font-bold text-[#f1f1f1] mb-1 leading-snug">
                        {course.title}
                    </h3>
                    <p className="text-xs text-[#aaaaaa] mb-5 leading-relaxed">
                        Choose an available time slot to schedule your learning session.
                    </p>

                    {upcomingSlots.length === 0 ? (
                        <div
                            className="text-center py-10 rounded-xl border border-dashed text-xs font-medium"
                            style={{
                                background: '#141414',
                                borderColor: '#2e2e2e',
                                color: '#777777',
                            }}
                        >
                            No upcoming sessions scheduled for this course.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingSlots.map(slot => {
                                const isFull = slot.currentEnrolled >= slot.maxSeats;
                                const isSelected = selectedSlotId === slot.id;
                                const seatsLeft = Math.max(0, slot.maxSeats - slot.currentEnrolled);

                                return (
                                    <button
                                        key={slot.id}
                                        disabled={isFull}
                                        onClick={() => setSelectedSlotId(slot.id)}
                                        className="w-full text-left p-4 rounded-xl transition-all duration-150 flex flex-col gap-3 group cursor-pointer focus:outline-none"
                                        style={{
                                            background: isFull
                                                ? '#141414'
                                                : isSelected
                                                ? '#122527'
                                                : '#171717',
                                            border: isSelected
                                                ? '1.5px solid #00C2CB'
                                                : '1px solid #2a2a2a',
                                            boxShadow: isSelected
                                                ? '0 0 16px rgba(0, 194, 203, 0.18)'
                                                : 'none',
                                            opacity: isFull ? 0.45 : 1,
                                            cursor: isFull ? 'not-allowed' : 'pointer',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected && !isFull) {
                                                e.currentTarget.style.background = '#202020';
                                                e.currentTarget.style.borderColor = '#3a3a3a';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected && !isFull) {
                                                e.currentTarget.style.background = '#171717';
                                                e.currentTarget.style.borderColor = '#2a2a2a';
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <Calendar size={16} color={isSelected ? '#00C2CB' : '#aaaaaa'} />
                                                <span style={{ color: isSelected ? '#00C2CB' : '#f1f1f1' }}>
                                                    {formatSafeDate(slot.startTime || slot.slotDateTime)}
                                                </span>
                                            </div>
                                            <span
                                                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                style={{
                                                    background: isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 194, 203, 0.15)',
                                                    color: isFull ? '#ef4444' : '#00C2CB',
                                                    border: isFull ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(0, 194, 203, 0.3)',
                                                }}
                                            >
                                                {isFull ? 'Full' : `${seatsLeft} Seats Left`}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 text-xs text-[#888888]">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} color="#666" />
                                                {formatSafeTime(slot.startTime || slot.slotDateTime)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Users size={14} color="#666" />
                                                {slot.currentEnrolled} / {slot.maxSeats} Enrolled
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="p-5 flex gap-3"
                    style={{
                        background: '#151515',
                        borderTop: '1px solid #2a2a2a',
                    }}
                >
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                        style={{
                            background: '#242424',
                            border: '1px solid #383838',
                            color: '#aaaaaa',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#2c2c2c';
                            e.currentTarget.style.color = '#f1f1f1';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#242424';
                            e.currentTarget.style.color = '#aaaaaa';
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedSlotId || upcomingSlots.length === 0}
                        className="flex-1 py-2.5 px-4 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                        style={{
                            background: '#00C2CB',
                            color: '#0f0f0f',
                            border: 'none',
                            opacity: (!selectedSlotId || upcomingSlots.length === 0) ? 0.35 : 1,
                            cursor: (!selectedSlotId || upcomingSlots.length === 0) ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={e => {
                            if (selectedSlotId) e.currentTarget.style.background = '#00d6e0';
                        }}
                        onMouseLeave={e => {
                            if (selectedSlotId) e.currentTarget.style.background = '#00C2CB';
                        }}
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
