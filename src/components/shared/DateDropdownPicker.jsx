import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const generateMonths = () => [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 31 }, (_, i) => currentYear - 15 + i);
};

export default function DateDropdownPicker({ value, onChange, disabled }) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  
  // Effect 1: Sync from parent prop `value` to internal state.
  // This runs when the component loads with an existing date (e.g., editing a release).
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    } else if (!value) {
      setYear('');
      setMonth('');
      setDay('');
    }
  }, [value]);

  // Effect 2: Sync from internal state to parent via `onChange`.
  useEffect(() => {
    const daysInSelectedMonth = (year && month) ? new Date(parseInt(year), parseInt(month), 0).getDate() : 31;
    if (parseInt(day) > daysInSelectedMonth) {
      // If the selected day is invalid for the new month/year (e.g., changing from March 31 to Feb),
      // reset the day. This prevents an invalid date.
      setDay('');
      return; // Stop here, the date is now incomplete.
    }

    if (day && month && year) {
      const newDate = `${year}-${month}-${day}`;
      // Only call onChange if the generated date is different from the parent's value
      // to prevent re-render loops.
      if (newDate !== value) {
        onChange(newDate);
      }
    }
  }, [day, month, year, value, onChange]);

  const daysInMonth = (year && month) ? new Date(parseInt(year), parseInt(month), 0).getDate() : 31;
  const generateDays = () => Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const months = generateMonths();
  const years = generateYears();
  const days = generateDays();

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Label htmlFor="day" className="text-gray-400 text-sm">Day</Label>
        <Select value={day} onValueChange={setDay} disabled={disabled}>
          <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
            <SelectValue placeholder="DD" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
            {days.map(d => (
              <SelectItem key={d} value={d} className="text-white hover:bg-neutral-700">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="month" className="text-gray-400 text-sm">Month</Label>
        <Select value={month} onValueChange={setMonth} disabled={disabled}>
          <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
            {months.map(m => (
              <SelectItem key={m.value} value={m.value} className="text-white hover:bg-neutral-700">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="year" className="text-gray-400 text-sm">Year</Label>
        <Select value={year} onValueChange={setYear} disabled={disabled}>
          <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
            <SelectValue placeholder="YYYY" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
            {years.map(y => (
              <SelectItem key={y} value={String(y)} className="text-white hover:bg-neutral-700">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}