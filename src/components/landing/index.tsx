import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FeatureShowcase from "./FeatureShowcase";

const features = [
  {
    title: "Actually Accurate Route Planning",
    description:
      "Unlike Phil mistaking every French rider for Thibaut Pinot, we know exactly who and where you are",
    icon: "🎯",
  },
  {
    title: "Weather-Smart Planning",
    description:
      'Real meteorological data, not just "The riders appear to be experiencing weather today!"',
    icon: "🌤️",
  },
  {
    title: "Community Powered",
    description:
      'Share routes with cyclists who can tell their cols from their côtes without shouting "MAGNIFICENT!" every 5 minutes',
    icon: "👥",
  },
  {
    title: "Pro-Level Analytics",
    description:
      "Data so clear, even Phil could understand it (okay, maybe that's a stretch)",
    icon: "📊",
  },
];

const LandingPage = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Route Planning That Makes Sense
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              No more "Dancing on the pedals!" or "Suitcase of courage!" – just
              intelligent route planning that doesn't sound like it's been
              commentating since the invention of the penny-farthing.
            </p>

            <form
              className="max-w-md mx-auto mb-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email for beta access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Join Beta →
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Sign up now and we promise never to describe your local club
                ride as "A LEGENDARY ATTACK!"
              </p>
            </form>
          </div>

          {/* Feature Demo Section */}
          <FeatureShowcase />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Better Than Commentary Bingo
          <span className="block text-lg text-gray-600 mt-2">
            Zero mentions of "turning themselves inside out" guaranteed
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
