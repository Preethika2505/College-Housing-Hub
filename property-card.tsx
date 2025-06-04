import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star, 
  Heart,
  Phone,
  Mail
} from "lucide-react";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface PropertyCardProps {
  property: Property;
  onViewDetails: () => void;
  compact?: boolean;
  showSavedDate?: boolean;
  savedDate?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PropertyCard({ 
  property, 
  onViewDetails, 
  compact = false,
  showSavedDate = false,
  savedDate,
  className = "",
  style
}: PropertyCardProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved-properties", { propertyId: property.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties"] });
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

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

    saveMutation.mutate();
  };

  const handleContact = (e: React.MouseEvent, type: 'phone' | 'email') => {
    e.stopPropagation();
    
    if (type === 'phone' && property.contactPhone) {
      window.location.href = `tel:${property.contactPhone}`;
    } else if (type === 'email' && property.contactEmail) {
      window.location.href = `mailto:${property.contactEmail}`;
    }
  };

  // Use primary image or fallback to sample image
  const imageUrl = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls[0] 
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";

  const formatPropertyType = (type: string) => {
    return type.replace("_", " ").split(" ").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (compact) {
    return (
      <Card 
        className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={onViewDetails}
        style={style}
      >
        <div className="relative h-48">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50"
          >
            <Heart className="h-4 w-4 text-neutral-600" />
          </Button>
          {property.available && (
            <Badge className="absolute bottom-3 left-3 bg-secondary text-white">
              Available
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-neutral-900 truncate">
              {property.title}
            </h3>
            <div className="text-right ml-2">
              <div className="text-xl font-bold text-primary">${property.price}</div>
              <div className="text-xs text-neutral-500">/month</div>
            </div>
          </div>
          
          <div className="flex items-center text-neutral-600 mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-sm truncate">
              {property.distanceToCampus} miles from {property.university}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-neutral-600 mb-3">
            {property.bedrooms && (
              <span><Bed className="h-3 w-3 inline mr-1" />{property.bedrooms} bed</span>
            )}
            {property.bathrooms && (
              <span><Bath className="h-3 w-3 inline mr-1" />{property.bathrooms} bath</span>
            )}
            {property.squareFootage && (
              <span><Square className="h-3 w-3 inline mr-1" />{property.squareFootage} sq ft</span>
            )}
          </div>
          
          {property.rating && (
            <div className="flex items-center mb-3">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.floor(property.rating!) ? "fill-current" : ""}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-600 ml-1">
                {property.rating} ({property.reviewCount} reviews)
              </span>
            </div>
          )}
          
          <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onViewDetails}
      style={style}
    >
      <div className="md:flex">
        <div className="md:w-80 h-64 md:h-auto relative">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50"
          >
            <Heart className="h-4 w-4 text-neutral-600" />
          </Button>
          {property.available && (
            <Badge className="absolute bottom-3 left-3 bg-secondary text-white">
              Available
            </Badge>
          )}
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-neutral-900">{property.title}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">${property.price}</div>
                  <div className="text-sm text-neutral-500">/month</div>
                </div>
              </div>
              
              <div className="flex items-center text-neutral-600 mb-3">
                <MapPin className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm">
                  {property.distanceToCampus} miles from {property.university}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
                {property.propertyType && (
                  <span className="capitalize">{formatPropertyType(property.propertyType)}</span>
                )}
                {property.bedrooms && (
                  <span><Bed className="h-4 w-4 inline mr-1" />{property.bedrooms} bed</span>
                )}
                {property.bathrooms && (
                  <span><Bath className="h-4 w-4 inline mr-1" />{property.bathrooms} bath</span>
                )}
                {property.squareFootage && (
                  <span><Square className="h-4 w-4 inline mr-1" />{property.squareFootage.toLocaleString()} sq ft</span>
                )}
              </div>
              
              {property.amenities && property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
              
              {property.description && (
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>
              )}

              {showSavedDate && savedDate && (
                <p className="text-xs text-neutral-500 mb-4">
                  Saved on {new Date(savedDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {property.rating ? (
                <div className="flex items-center">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(property.rating!) ? "fill-current" : ""}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600 ml-2">
                    {property.rating} ({property.reviewCount} reviews)
                  </span>
                </div>
              ) : (
                <div></div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                >
                  View Details
                </Button>
                
                {property.contactPhone && (
                  <Button
                    size="sm"
                    onClick={(e) => handleContact(e, 'phone')}
                    className="bg-accent text-white hover:bg-yellow-600"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
                
                {property.contactEmail && !property.contactPhone && (
                  <Button
                    size="sm"
                    onClick={(e) => handleContact(e, 'email')}
                    className="bg-accent text-white hover:bg-yellow-600"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
