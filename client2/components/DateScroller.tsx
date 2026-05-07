'use client';

import React, { useRef, useEffect } from "react";
import { format, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateScrollerProps {
  matchDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const DateScroller = ({ matchDates = [], selectedDate, onSelectDate }: DateScrollerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () =>
    containerRef.current?.scrollBy({ left: -140, behavior: "smooth" });

  const scrollRight = () =>
    containerRef.current?.scrollBy({ left: 140, behavior: "smooth" });

  const parsedDates = matchDates.map((d) => {
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const index = matchDates.findIndex((d) => d === selectedDate);
    if (index !== -1) {
      const el = containerRef.current.children[index] as HTMLElement;
      el?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [selectedDate, matchDates]);

  return (
    <div className="flex items-center fixed top-[50px] left-0 right-0 z-[9] bg-[#0f0f0f] p-2 text-white overflow-hidden">
      <button
        onClick={scrollLeft}
        className="p-2 opacity-70 hover:opacity-100 transition"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20}/>
      </button>

      <div
        ref={containerRef}
        className="flex overflow-x-auto overflow-y-hidden gap-3 scrollbar-hide snap-x scroll-smooth"
      >
        {parsedDates.map((date, i) => {
          const dateKey = matchDates[i];
          const active = selectedDate === dateKey;
          const today = isToday(date);

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`
                relative snap-start px-4 py-1.5 rounded-full text-[14px] whitespace-nowrap
                border border-dashed transition-all duration-300
                ${
                  active
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500 shadow-lg shadow-pink-500/20"
                    : today
                    ? "bg-red-500/10 text-red-400 border-red-400/40"
                    : "bg-[#0b0b0b] text-gray-300 border-white/10 hover:border-pink-400"
                }
              `}
            >
              {today ? "Today" : format(date, "dd MMM")}
            </button>
          );
        })}
      </div>

      <button
        onClick={scrollRight}
        className="p-2 opacity-70 hover:opacity-100 transition"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateScroller;
