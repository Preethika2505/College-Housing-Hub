import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Search } from "lucide-react";

interface SearchHeroProps {
  onSearch: (searchQuery: string, maxBudget: string) => void;
  initialSearch?: string;
  initialBudget?: number;
}

export default function SearchHero({ onSearch, initialSearch = "", initialBudget = 1200 }: SearchHeroProps) {
  const [searchLocation, setSearchLocation] = useState(initialSearch);
  const [maxBudget, setMaxBudget] = useState(initialBudget.toString());

  const budgetOptions = [
    { value: "800", label: "$800/month" },
    { value: "1000", label: "$1,000/month" },
    { value: "1200", label: "$1,200/month" },
    { value: "1500", label: "$1,500/month" },
    { value: "2000", label: "$2,000/month" },
  ];

  const handleSearch = () => {
    onSearch(searchLocation, maxBudget);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-white py-8 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Find Your Perfect Student Housing
          </h1>
          <p className="text-lg text-neutral-600">
            Affordable, convenient housing options near your campus
          </p>
        </div>
        
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MapPin className="inline h-4 w-4 text-primary mr-1" />
                Location
              </label>
              <Input
                type="text"
                placeholder="Enter college or city"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <DollarSign className="inline h-4 w-4 text-secondary mr-1" />
                Max Budget
              </label>
              <Select value={maxBudget} onValueChange={setMaxBudget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                className="w-full bg-primary text-white hover:bg-blue-700 font-medium"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
