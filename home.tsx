import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import SearchHero from "@/components/search-hero";
import FilterSidebar from "@/components/filter-sidebar";
import PropertyCard from "@/components/property-card";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, List, Map } from "lucide-react";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";

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

export default function Home() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [filters, setFilters] = useState<PropertyFilters>({
    search: "",
    minPrice: 400,
    maxPrice: 2000,
    propertyTypes: [],
    amenities: [],
    maxDistance: 5,
    university: "State University"
  });
  
  const [sortBy, setSortBy] = useState("price_low");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append("search", filters.search);
    if (filters.minPrice > 400) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice < 2000) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.propertyTypes.length > 0) {
      filters.propertyTypes.forEach(type => params.append("propertyTypes", type));
    }
    if (filters.amenities.length > 0) {
      filters.amenities.forEach(amenity => params.append("amenities", amenity));
    }
    if (filters.maxDistance < 5) params.append("maxDistance", filters.maxDistance.toString());
    if (filters.university) params.append("university", filters.university);
    if (filters.bedrooms) params.append("bedrooms", filters.bedrooms.toString());
    if (filters.bathrooms) params.append("bathrooms", filters.bathrooms.toString());
    
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    
    return params.toString();
  };

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ["/api/properties", buildQueryParams()],
    queryFn: async () => {
      const response = await fetch(`/api/properties?${buildQueryParams()}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    }
  });

  // Save search history
  const saveSearchMutation = useMutation({
    mutationFn: async (searchData: { searchQuery?: string; filters: any }) => {
      if (!isAuthenticated) return;
      return apiRequest("POST", "/api/search-history", searchData);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    }
  });

  // Save search when filters change
  useEffect(() => {
    if (filters.search || Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== "")) {
      saveSearchMutation.mutate({
        searchQuery: filters.search,
        filters: filters
      });
    }
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<PropertyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setOffset(0); // Reset pagination
  };

  const handleSearch = (searchQuery: string, maxBudget: string) => {
    const budget = parseInt(maxBudget.replace(/[$,]/g, ""));
    handleFilterChange({
      search: searchQuery,
      maxPrice: budget
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      minPrice: 400,
      maxPrice: 2000,
      propertyTypes: [],
      amenities: [],
      maxDistance: 5,
      university: "State University"
    });
    setOffset(0);
  };

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "distance":
        return (a.distanceToCampus || 0) - (b.distanceToCampus || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return a.price - b.price;
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Error Loading Properties</h2>
            <p className="text-neutral-600 mb-4">We couldn't load the properties. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 md:pb-0">
      <Navigation />
      
      <SearchHero 
        onSearch={handleSearch}
        initialSearch={filters.search}
        initialBudget={filters.maxPrice}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filter Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>
          
          {/* Results Section */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Available Housing</h2>
                <p className="text-neutral-600">
                  {isLoading ? "Loading..." : `${properties.length} properties found`}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_low">Sort by: Price (Low to High)</SelectItem>
                    <SelectItem value="price_high">Sort by: Price (High to Low)</SelectItem>
                    <SelectItem value="distance">Sort by: Distance</SelectItem>
                    <SelectItem value="rating">Sort by: Rating</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border border-neutral-300 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: "Map view coming soon!" })}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Property Listings */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-neutral-300 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-neutral-300 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-neutral-300 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No properties found
                </h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your filters to see more results.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`${viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}`}>
                {sortedProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onViewDetails={() => setLocation(`/property/${property.id}`)}
                    compact={viewMode === "grid"}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-slide-up"
                  />
                ))}
              </div>
            )}
            
            {/* Load More Button */}
            {properties.length >= limit && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="px-8 py-3"
                >
                  Load More Properties
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
