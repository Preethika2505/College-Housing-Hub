import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import PropertyCard from "@/components/property-card";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Saved() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view saved properties",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: savedProperties = [], isLoading, error } = useQuery({
    queryKey: ["/api/saved-properties"],
    enabled: isAuthenticated,
    retry: false
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-neutral-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (error) {
    if (isUnauthorizedError(error)) {
      return null; // Will redirect via useEffect
    }

    return (
      <div className="min-h-screen bg-neutral-50 pb-20 md:pb-0">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Error Loading Saved Properties</h2>
            <p className="text-neutral-600 mb-4">We couldn't load your saved properties. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Saved Properties</h1>
            <p className="text-neutral-600">
              Properties you've saved for later
            </p>
          </div>
        </div>

        {/* Content */}
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
        ) : savedProperties.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No Saved Properties Yet
            </h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Start browsing properties and save the ones you like. 
              They'll appear here for easy access later.
            </p>
            <Button 
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {savedProperties.map((saved, index) => (
              <PropertyCard
                key={saved.property.id}
                property={saved.property}
                onViewDetails={() => setLocation(`/property/${saved.property.id}`)}
                compact={false}
                showSavedDate={true}
                savedDate={saved.createdAt}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-slide-up"
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
