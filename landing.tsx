import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, DollarSign, Shield, Users, Wifi } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="text-primary text-2xl" />
              <span className="text-xl font-bold text-neutral-900">CampusNest</span>
            </div>
            
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary text-white hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Find Your Perfect
            <span className="text-primary block">Student Housing</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Discover affordable, convenient housing options near your campus. 
            Save favorites, filter by amenities, and sync across all your devices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary text-white hover:bg-blue-700 px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose CampusNest?
            </h2>
            <p className="text-lg text-neutral-600">
              Built specifically for college students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Campus Proximity
                  </h3>
                </div>
                <p className="text-neutral-600">
                  Filter properties by distance to your university. Find housing within walking distance or on bus routes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-8 w-8 text-secondary mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Budget-Friendly
                  </h3>
                </div>
                <p className="text-neutral-600">
                  Set your budget and find affordable options. We focus on housing that won't break the bank.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Wifi className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Student Amenities
                  </h3>
                </div>
                <p className="text-neutral-600">
                  Filter by amenities that matter to students: WiFi, study spaces, laundry, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Cross-Device Sync
                  </h3>
                </div>
                <p className="text-neutral-600">
                  Save your favorites and preferences. Access them from any device, anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-secondary mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Roommate Ready
                  </h3>
                </div>
                <p className="text-neutral-600">
                  Find shared houses and apartments perfect for roommate living. Split costs and make friends.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Home className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Quality Verified
                  </h3>
                </div>
                <p className="text-neutral-600">
                  All listings include photos, reviews, and detailed information to help you make informed decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have found their ideal housing with CampusNest
          </p>
          
          <Button 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-white text-primary hover:bg-neutral-100 px-8 py-3 font-semibold"
          >
            Start Your Search Today
          </Button>
        </div>
      </section>
    </div>
  );
}
