import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star, 
  Heart, 
  ArrowLeft,
  Phone,
  Mail,
  Car,
  Wifi,
  Dumbbell,
  GraduationCap,
  Washing
} from "lucide-react";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";

const amenityIcons: Record<string, any> = {
  "WiFi Included": Wifi,
  "Parking": Car,
  "Laundry": Washing,
  "Study Room": GraduationCap,
  "Gym Access": Dumbbell,
};

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const propertyId = params?.id ? parseInt(params.id) : null;

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: async () => {
      if (!propertyId) throw new Error("Property ID is required");
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json() as Property;
    },
    enabled: !!propertyId
  });

  const { data: savedStatus, isLoading: savedStatusLoading } = useQuery({
    queryKey: ["/api/saved-properties", propertyId, "status"],
    queryFn: async () => {
      if (!propertyId || !isAuthenticated) return { isSaved: false };
      const response = await fetch(`/api/saved-properties/${propertyId}/status`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!propertyId && isAuthenticated
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!propertyId) throw new Error("Property ID is required");
      return apiRequest("POST", "/api/saved-properties", { propertyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties", propertyId, "status"] });
      toast({
        title: "Property Saved",
        description: "Added to your saved properties",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to save properties",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to save property",
          variant: "destructive",
        });
      }
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      if (!propertyId) throw new Error("Property ID is required");
      return apiRequest("DELETE", `/api/saved-properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties", propertyId, "status"] });
      toast({
        title: "Property Removed",
        description: "Removed from your saved properties",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to manage saved properties",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to remove property",
          variant: "destructive",
        });
      }
    }
  });

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save properties",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (savedStatus?.isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Property Not Found</h2>
            <Button onClick={() => setLocation("/")}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-neutral-300 rounded mb-6"></div>
            <div className="h-6 bg-neutral-300 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-neutral-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Error Loading Property</h2>
            <p className="text-neutral-600 mb-4">We couldn't load this property. Please try again.</p>
            <Button onClick={() => setLocation("/")}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls 
    : [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant={savedStatus?.isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSave}
            disabled={saveMutation.isPending || unsaveMutation.isPending || savedStatusLoading}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${savedStatus?.isSaved ? "fill-current" : ""}`} />
            {savedStatus?.isSaved ? "Saved" : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-96">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-neutral-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.address}, {property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-center text-neutral-600">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      <span>{property.distanceToCampus} miles from {property.university}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">${property.price}</div>
                    <div className="text-sm text-neutral-500">/month</div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.bedrooms && (
                    <div className="text-center">
                      <Bed className="h-6 w-6 mx-auto mb-1 text-neutral-600" />
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-neutral-500">
                        {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                      </div>
                    </div>
                  )}
                  
                  {property.bathrooms && (
                    <div className="text-center">
                      <Bath className="h-6 w-6 mx-auto mb-1 text-neutral-600" />
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-neutral-500">
                        {parseFloat(property.bathrooms) === 1 ? "Bathroom" : "Bathrooms"}
                      </div>
                    </div>
                  )}
                  
                  {property.squareFootage && (
                    <div className="text-center">
                      <Square className="h-6 w-6 mx-auto mb-1 text-neutral-600" />
                      <div className="font-semibold">{property.squareFootage.toLocaleString()}</div>
                      <div className="text-sm text-neutral-500">Sq Ft</div>
                    </div>
                  )}
                  
                  {property.rating && (
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto mb-1 text-accent fill-current" />
                      <div className="font-semibold">{property.rating}</div>
                      <div className="text-sm text-neutral-500">
                        ({property.reviewCount} reviews)
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
                      <p className="text-neutral-600 leading-relaxed">{property.description}</p>
                    </div>
                  </>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity, index) => {
                          const IconComponent = amenityIcons[amenity];
                          return (
                            <div key={index} className="flex items-center gap-2">
                              {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
                              <Badge variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Utilities */}
                {property.utilities && property.utilities.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-3">Included Utilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.utilities.map((utility, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {utility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Contact Property</h3>
                
                <div className="space-y-3 mb-4">
                  {property.contactPhone && (
                    <a 
                      href={`tel:${property.contactPhone}`}
                      className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="text-neutral-700">{property.contactPhone}</span>
                    </a>
                  )}
                  
                  {property.contactEmail && (
                    <a 
                      href={`mailto:${property.contactEmail}`}
                      className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="text-neutral-700">{property.contactEmail}</span>
                    </a>
                  )}
                </div>
                
                <Button className="w-full bg-accent text-white hover:bg-yellow-600">
                  Schedule Tour
                </Button>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Availability</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <Badge 
                      variant={property.available ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {property.available ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  
                  {property.availableDate && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Available from:</span>
                      <span className="font-medium">
                        {new Date(property.availableDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Quick Facts</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Property Type:</span>
                    <span className="font-medium capitalize">
                      {property.propertyType.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Distance to Campus:</span>
                    <span className="font-medium">{property.distanceToCampus} miles</span>
                  </div>
                  
                  {property.rating && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-accent fill-current" />
                        <span className="font-medium">{property.rating}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
