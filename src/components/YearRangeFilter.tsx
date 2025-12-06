import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface YearRangeFilterProps {
  minYear: number;
  maxYear: number;
  selectedRange: [number, number];
  onRangeChange: (range: [number, number]) => void;
}

export function YearRangeFilter({ 
  minYear, 
  maxYear, 
  selectedRange, 
  onRangeChange 
}: YearRangeFilterProps) {
  const handleSliderChange = (values: number[]) => {
    onRangeChange([values[0], values[1]]);
  };

  if (minYear === maxYear) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Year Range
        </label>
        <p className="text-sm text-muted-foreground">Only {minYear} available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Year Range
        </label>
        <span className="text-sm font-medium text-primary">
          {selectedRange[0]} — {selectedRange[1]}
        </span>
      </div>
      <Slider
        min={minYear}
        max={maxYear}
        step={1}
        value={selectedRange}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}
