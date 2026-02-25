import React, { useState, useMemo, useEffect } from 'react';

export interface AvailabilityCalendarProps {
  /** YYYY-MM-DD dates that are booked (unavailable) */
  bookedDates: string[];
  isDarkMode?: boolean;
  /** If set, calendar acts as range picker; booked days are not clickable */
  onSelectRange?: (checkIn: string, checkOut: string) => void;
  /** Initial month for display (default: current) */
  initialMonth?: Date;
  /** Show two months side by side */
  monthsCount?: 1 | 2;
  /** For picker: pre-selected check-in (YYYY-MM-DD) */
  selectedCheckIn?: string;
  /** For picker: pre-selected check-out (YYYY-MM-DD) */
  selectedCheckOut?: string;
  /** Called when user selects a range that includes booked dates (so parent can show a message) */
  onInvalidRange?: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Format date as YYYY-MM-DD in local time (matches DB and avoids timezone bugs). */
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isInRange(date: string, start: string, end: string): boolean {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

export function AvailabilityCalendar({
  bookedDates,
  isDarkMode = false,
  onSelectRange,
  initialMonth = new Date(),
  monthsCount = 2,
  selectedCheckIn = '',
  selectedCheckOut = '',
  onInvalidRange,
}: AvailabilityCalendarProps) {
  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1);
    return d;
  });
  const [rangeStart, setRangeStart] = useState<string | null>(selectedCheckIn || null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(selectedCheckOut || null);

  useEffect(() => {
    setRangeStart(selectedCheckIn || null);
    setRangeEnd(selectedCheckOut || null);
  }, [selectedCheckIn, selectedCheckOut]);

  const today = toYMD(new Date());

  const isPicker = !!onSelectRange;

  const buildMonthDays = (year: number, month: number) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevLast = new Date(prevYear, prevMonth + 1, 0).getDate();
    const days: { date: Date; ymd: string; isCurrentMonth: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(prevYear, prevMonth, prevLast - i);
      days.push({ date: d, ymd: toYMD(d), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, ymd: toYMD(d), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month, daysInMonth + i);
      days.push({ date: d, ymd: toYMD(d), isCurrentMonth: false });
    }
    return days;
  };

  /** Return true if any day in [start, end] (inclusive) is booked. */
  const rangeHasBookedDay = (start: string, end: string): boolean => {
    const [sy, sm, sd] = start.split('-').map(Number);
    const [ey, em, ed] = end.split('-').map(Number);
    const cur = new Date(sy, sm - 1, sd);
    const last = new Date(ey, em - 1, ed);
    for (; cur <= last; cur.setDate(cur.getDate() + 1)) {
      if (bookedSet.has(toYMD(cur))) return true;
    }
    return false;
  };

  const handleDayClick = (ymd: string) => {
    if (!isPicker || bookedSet.has(ymd)) return;
    if (ymd < today) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(ymd);
      setRangeEnd(null);
      return;
    }
    if (rangeStart) {
      const start = ymd < rangeStart ? ymd : rangeStart;
      const end = ymd < rangeStart ? rangeStart : ymd;
      if (rangeHasBookedDay(start, end)) {
        setRangeStart(ymd);
        setRangeEnd(null);
        onInvalidRange?.();
        return;
      }
      setRangeStart(start);
      setRangeEnd(end);
      onSelectRange(start, end);
    }
  };

  const prevMonth = () => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const monthBlocks = useMemo(() => {
    const blocks: { year: number; month: number }[] = [];
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + i, 1);
      blocks.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return blocks;
  }, [viewMonth, monthsCount]);

  const border = isDarkMode ? 'border-white/10' : 'border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-white/60' : 'text-gray-500';
  const bg = isDarkMode ? 'bg-[#0E0E10]' : 'bg-white';
  const bookedBg = isDarkMode ? 'bg-amber-900/60 text-amber-200' : 'bg-amber-800/40 text-amber-900';
  const freeBg = isDarkMode ? 'bg-emerald-900/20 text-emerald-200' : 'bg-emerald-500/15 text-emerald-800';
  const selectedBg = 'bg-[#C7A667] text-black';
  const inRangeBg = isDarkMode ? 'bg-[#C7A667]/30' : 'bg-[#C7A667]/20';
  const pastBg = isDarkMode ? 'text-white/30' : 'text-gray-400';

  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className={`p-2 rounded-lg ${textMuted} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          aria-label="Previous month"
        >
          ←
        </button>
        <span className={`text-sm font-medium ${text}`}>
          {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          {monthsCount === 2 && (
            <> – {new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</>
          )}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={`p-2 rounded-lg ${textMuted} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {!isPicker && (
        <div className="flex gap-3 mb-3 text-xs">
          <span className={`flex items-center gap-1.5 ${textMuted}`}>
            <span className={`w-4 h-4 rounded ${freeBg}`} /> Available
          </span>
          <span className={`flex items-center gap-1.5 ${textMuted}`}>
            <span className={`w-4 h-4 rounded ${bookedBg}`} /> Booked
          </span>
        </div>
      )}

      <div className={`grid gap-4 ${monthsCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : ''}`}>
        {monthBlocks.map(({ year, month }) => {
          const days = buildMonthDays(year, month);
          const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return (
            <div key={`${year}-${month}`}>
              {monthsCount === 2 && <p className={`text-xs font-medium ${textMuted} mb-2`}>{monthLabel}</p>}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className={`text-[10px] font-medium py-1 ${textMuted}`}>
                    {wd}
                  </div>
                ))}
                {days.map(({ date, ymd, isCurrentMonth }) => {
                  const isBooked = bookedSet.has(ymd);
                  const isPast = ymd < today;
                  const isStart = rangeStart === ymd;
                  const isEnd = rangeEnd === ymd;
                  const inRange = rangeStart && rangeEnd && isInRange(ymd, rangeStart, rangeEnd);
                  const clickable = isPicker && !isBooked && !isPast && isCurrentMonth;
                  let cellClass = `py-2 rounded text-sm ${!isCurrentMonth ? pastBg : text}`;
                  if (isBooked) cellClass += ` ${bookedBg}`;
                  else if (isStart || isEnd) cellClass += ` ${selectedBg} font-semibold`;
                  else if (inRange) cellClass += ` ${inRangeBg}`;
                  else if (!isPast && isCurrentMonth) cellClass += ` ${freeBg}`;
                  if (isPast && !isBooked) cellClass += ` opacity-60`;
                  if (clickable) cellClass += ' cursor-pointer hover:ring-2 hover:ring-[#C7A667]';
                  if (!clickable && isPicker && isCurrentMonth && !isBooked && !isPast) cellClass += ' cursor-default';

                  return (
                    <button
                      key={ymd}
                      type="button"
                      disabled={!clickable}
                      onClick={() => handleDayClick(ymd)}
                      className={cellClass}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
