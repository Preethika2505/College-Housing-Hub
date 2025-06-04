import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyFilters {
  search: string;
  minPrice: number;
  maxPrice: number;
  propertyTypes: string[];
  amenities: string[];
  maxDistance: number;
  university: string;
  bedrooms?: number;
  bathrooms?: number;
}

interface FilterSidebarProps {
  filters: PropertyFilters;
  onFilterChange: (filters: Partial<PropertyFilters>) => void;
  onClearFilters: () => void;
}

const propertyTypeOptions = [
  { id: "apartment", label: "Apartment" },
  { id: "shared_house", label: "Shared House" },
  { id: "studio", label: "Studio" },
  { id: "dorm", label: "Dorm Style" },
];

const amenityOptions = [
  { id: "WiFi Included", label: "WiFi Included" },
  { id: "Laundry", label: "Laundry" },
  { id: "Parking", label: "Parking" },
  { id: "Study Room", label: "Study Space" },
  { id: "Gym Access", label: "Gym Access" },
  { id: "Pet Friendly", label: "Pet Friendly" },
];

const distanceOptions = [
  { value: "1", label: "Within 1 mile" },
  { value: "3", label: "1-3 miles" },
  { value: "5", label: "3-5 miles" },
  { value: "999", label: "Any distance" },
];

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const handlePriceChange = (value: number[]) => {
    onFilterChange({ 
      minPrice: value[0], 
      maxPrice: value[1] 
    });
  };

  const handlePropertyTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.propertyTypes, typeId]
      : filters.propertyTypes.filter(t => t !== typeId);
    
    onFilterChange({ propertyTypes: newTypes });
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenityId]
      : filters.amenities.filter(a => a !== amenityId);
    
    onFilterChange({ amenities: newAmenities });
  };

  const handleDistanceChange = (distance: string) => {
    onFilterChange({ maxDistance: parseFloat(distance) });
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearFilters}
            className="text-primary hover:text-blue-700 text-sm font-medium"
          >
            Clear all
          </Button>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Price Range
          </Label>
          <div className="px-3 mb-4">
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={handlePriceChange}
              max={2000}
              min={400}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-neutral-500 mt-2">
              <span>$400</span>
              <span className="font-medium text-primary">
                ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}
              </span>
              <span>$2,000</span>
            </div>
          </div>
        </div>
        
        {/* Property Type */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Property Type
          </Label>
          <div className="space-y-3">
            {propertyTypeOptions.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.propertyTypes.includes(type.id)}
                  onCheckedChange={(checked) => 
                    handlePropertyTypeChange(type.id, checked as boolean)
                  }
                />
                <Label htmlFor={type.id} className="text-sm text-neutral-700 cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Amenities */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Amenities
          </Label>
          <div className="space-y-3">
            {amenityOptions.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={filters.amenities.includes(amenity.id)}
                  onCheckedChange={(checked) => 
                    handleAmenityChange(amenity.id, checked as boolean)
                  }
                />
                <Label htmlFor={amenity.id} className="text-sm text-neutral-700 cursor-pointer">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Distance to Campus */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Distance to Campus
          </Label>
          <RadioGroup 
            value={filters.maxDistance.toString()} 
            onValueChange={handleDistanceChange}
            className="space-y-2"
          >
            {distanceOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="text-sm text-neutral-700 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
