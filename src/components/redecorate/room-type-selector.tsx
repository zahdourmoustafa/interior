'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roomTypes = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'livingroom', label: 'Living Room' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'diningroom', label: 'Dining Room' },
];

interface RoomTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoomTypeSelector({ value, onChange }: RoomTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select room type" />
      </SelectTrigger>
      <SelectContent>
        {roomTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}