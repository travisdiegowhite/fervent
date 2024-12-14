import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DemoMap from "./DemoMap";
import DemoAIRouteSuggester from "./DemoAIRouteSuggester";

const FeatureShowcase = () => {
  const [activeDemo, setActiveDemo] = useState<null | "map" | "ai">(null);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex gap-4 mb-4">
        <Button
          onClick={() => setActiveDemo("map")}
          variant={activeDemo === "map" ? "default" : "outline"}
        >
          Try Route Planning
        </Button>
        <Button
          onClick={() => setActiveDemo("ai")}
          variant={activeDemo === "ai" ? "default" : "outline"}
        >
          AI Route Suggestions
        </Button>
      </div>

      <div className="h-[500px] relative">
        {activeDemo === "map" && (
          <div className="h-full">
            <DemoMap onRouteChange={() => {}} />
            <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-2">
                Click on the map to add points
              </p>
              <Button size="sm" variant="outline">
                Clear Route
              </Button>
            </div>
          </div>
        )}

        {activeDemo === "ai" && <DemoAIRouteSuggester onSuggest={() => {}} />}
      </div>
    </div>
  );
};

export default FeatureShowcase;
