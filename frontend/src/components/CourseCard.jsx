import React from 'react';
import { Eye, Edit2, Trash2, Clock, PlayCircle } from 'lucide-react';
import { parseSafeDate, formatSafeDate, formatSafeTimeRange, getNextUpcomingSlot, formatTimeRemaining } from '../utils/dateUtils';

/**
 * Reusable CourseCard component for Studio and Dashboard views.
 * Supports active and past course display, with prominent status badges
 * and escrow refund indicators for abandoned slots.
 */
export default function CourseCard({
    course,
    isPast = false,
    onStartSession,
    onCloseSession,
    onViewRoster,
    onEditCourse,
    onDeleteCourse,
}) {
    // Check if any slot is abandoned or completed
    const hasAbandoned = (course.slots || []).some(
        s => (s.sessionStatus || s.status) === 'ABANDONED'
    );
    const isCompleted = (course.slots || []).some(s => {
        const st = s.sessionStatus || s.status;
        return st === 'COMPLETED' || st === 'CLOSED' || (s.currentEnrolled && s.currentEnrolled > 0);
    });

    const now = new Date();
    const nextUpcomingSlot = !isPast ? getNextUpcomingSlot(course) : null;
    const timeRemaining = nextUpcomingSlot ? formatTimeRemaining(nextUpcomingSlot.startTime || nextUpcomingSlot.slotDateTime) : null;

    return (
        <div
            className={`bg-[#1b1b1b] border border-[#2d2d2d] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-[#444] hover:-translate-y-0.5 ${
                isPast ? 'opacity-90' : ''
            }`}
        >
            <div>
                {/* 16:9 Thumbnail Block */}
                <div className="relative w-full pt-[56.25%] bg-[#111] overflow-hidden">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#666] text-xs font-semibold uppercase tracking-wider">
                            No Preview
                        </div>
                    )}

                    {/* Prominent Condition Badge for Past Courses */}
                    {isPast && (
                        <div className="absolute top-2 left-2 z-10">
                            {hasAbandoned ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500 backdrop-blur-sm shadow-md">
                                    <Clock size={12} />
                                    ABANDONED - REFUNDED
                                </span>
                            ) : isCompleted ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/30 backdrop-blur-sm shadow-md">
                                    <Clock size={12} />
                                    COMPLETED
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white/5 text-[#888] border border-[#444] backdrop-blur-sm shadow-md">
                                    <Clock size={12} />
                                    EXPIRED
                                </span>
                            )}
                        </div>
                    )}

                    {/* Time left for upcoming slot pill (for active courses) */}
                    {!isPast && timeRemaining && (
                        <div className="absolute top-2 left-2 z-10">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#0f0f0f]/85 text-[#00C2CB] border border-[#00C2CB]/40 backdrop-blur-sm shadow-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00C2CB] animate-pulse" />
                                {timeRemaining}
                            </span>
                        </div>
                    )}

                    {/* Category Name (bottom-left) */}
                    {course.categoryName && (
                        <span className="absolute bottom-2 left-2 bg-black/80 text-[#f1f1f1] text-[10px] font-semibold px-2 py-0.5 rounded">
                            {course.categoryName}
                        </span>
                    )}

                    {/* Price (top-right) */}
                    <span className="absolute top-2 right-2 bg-[#00C2CB]/90 text-[#0f0f0f] text-xs font-bold px-2.5 py-1 rounded-md">
                        ₹{course.price}
                    </span>
                </div>

                {/* Course Details */}
                <div className="p-4">
                    <h3 className="text-[15px] font-semibold text-[#f1f1f1] m-0 mb-2 leading-snug line-clamp-2">
                        {course.title}
                    </h3>

                    {/* Slots List */}
                    <div className="bg-[#141414] rounded-lg p-2.5 border border-[#252525]">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] text-[#888] font-semibold uppercase tracking-wider">
                                Sessions ({course.slots?.length || 0})
                            </span>
                            {!isPast && timeRemaining && (
                                <span className="text-[10px] font-bold text-[#00C2CB]">
                                    {timeRemaining}
                                </span>
                            )}
                        </div>

                        {course.slots && course.slots.length > 0 ? (
                            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                                {course.slots.map(slot => {
                                    const start = parseSafeDate(slot.startTime);
                                    const end = parseSafeDate(slot.endTime);
                                    const status = slot.sessionStatus || slot.status || 'SCHEDULED';
                                    const slotTimeLeft = (status === 'SCHEDULED' && start && start > now)
                                        ? formatTimeRemaining(start)
                                        : null;
                                    const canStart =
                                        status === 'SCHEDULED' &&
                                        start &&
                                        start - now <= 15 * 60 * 1000 &&
                                        end &&
                                        end > now;

                                    return (
                                        <div
                                            key={slot.id}
                                            className="bg-[#1a1a1a] rounded-md p-2 border border-[#2a2a2a]"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs text-[#ccc]">
                                                        {start
                                                            ? formatSafeDate(start, {
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              })
                                                            : '?'}{' '}
                                                        {formatSafeTimeRange(slot.startTime, slot.endTime)}
                                                    </span>
                                                    {slotTimeLeft && (
                                                        <span className="text-[9px] font-bold text-[#00C2CB] bg-[#00C2CB]/10 border border-[#00C2CB]/30 px-1.5 py-0.2 rounded">
                                                            {slotTimeLeft}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Slot status pill */}
                                                {status === 'ABANDONED' ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500">
                                                        ABANDONED - REFUNDED
                                                    </span>
                                                ) : status === 'COMPLETED' ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                                                        COMPLETED
                                                    </span>
                                                ) : status === 'LIVE' ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/15 text-green-400">
                                                        LIVE
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">
                                                        {status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                {/* Enrolled Students Counter */}
                                                {status === 'ABANDONED' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className="text-xs text-[#888] line-through cursor-help"
                                                            title="Tutor missed session. All payments were refunded from escrow to student wallets."
                                                        >
                                                            {slot.currentEnrolled}/{slot.maxSeats} enrolled
                                                        </span>
                                                        <span className="text-[10px] text-red-400 font-bold bg-red-500/15 border border-red-500/30 px-1.5 py-0.2 rounded">
                                                            Refunded
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            slot.currentEnrolled >= slot.maxSeats
                                                                ? 'text-[#ff5555]'
                                                                : 'text-[#4ade80]'
                                                        }`}
                                                    >
                                                        {slot.currentEnrolled}/{slot.maxSeats} enrolled
                                                    </span>
                                                )}

                                                {/* Session action buttons */}
                                                <div className="flex gap-1.5">
                                                    {status === 'SCHEDULED' && onStartSession && (
                                                        <button
                                                            onClick={() => onStartSession(slot.id)}
                                                            disabled={!canStart}
                                                            title={
                                                                canStart
                                                                    ? 'Start session now'
                                                                    : 'Available 15 min before start'
                                                            }
                                                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded border-none transition-all ${
                                                                canStart
                                                                    ? 'cursor-pointer bg-green-400/20 text-green-400 hover:bg-green-400/30'
                                                                    : 'cursor-not-allowed bg-[#1c1c1c] text-[#555]'
                                                            }`}
                                                        >
                                                            ▶ Start
                                                        </button>
                                                    )}
                                                    {status === 'LIVE' && onCloseSession && (
                                                        <button
                                                            onClick={() => onCloseSession(slot.id)}
                                                            className="text-[10px] font-bold px-2.5 py-0.5 rounded border-none cursor-pointer bg-red-500/20 text-red-400 animate-pulse"
                                                        >
                                                            ■ Close
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-xs text-[#666] italic">No scheduled slots</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 flex gap-2">
                {onViewRoster && (
                    <button
                        onClick={() => onViewRoster(course)}
                        className="flex-1 py-2 rounded-lg bg-[#282828] border border-[#383838] text-[#f1f1f1] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#333] transition cursor-pointer"
                    >
                        <Eye size={14} className="text-[#00C2CB]" />
                        <span>Students</span>
                    </button>
                )}

                {onEditCourse && (
                    <button
                        onClick={() => onEditCourse(course)}
                        className="flex-1 py-2 rounded-lg bg-[#282828] border border-[#383838] text-[#f1f1f1] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#333] transition cursor-pointer"
                        title="Edit Course"
                    >
                        <Edit2 size={14} className="text-[#3ea6ff]" />
                        <span>Edit</span>
                    </button>
                )}

                {onDeleteCourse && (
                    <button
                        onClick={() => onDeleteCourse(course.id, course.title)}
                        className="px-3.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-500/20 transition cursor-pointer"
                        title="Delete Course"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
