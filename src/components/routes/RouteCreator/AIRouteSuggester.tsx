// AIRouteSuggester.tsx
import React, { useState } from "react";
import { RoutePoint } from "./types";

interface AIRouteSuggesterProps {
  onSuggestedRouteSelect: (points: RoutePoint[]) => void;
  onRouteRequest: (prompt: string) => Promise<void>; // Added this prop
  routeType: "cycling" | "walking";
  currentLocation?: [number, number];
  isAnalyzing: boolean; // Added this prop
  metadata: RouteMetadata | null; // Added this prop
}

const AIRouteSuggester: React.FC<AIRouteSuggesterProps> = ({
  onSuggestedRouteSelect,
  onRouteRequest,
  routeType,
  currentLocation,
  isAnalyzing,
  metadata,
}) => {
  const [prompt, setPrompt] = useState("");

  // Handle the prompt submission
  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    await onRouteRequest(prompt);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <div className="mb-4">
        <label
          htmlFor="routePrompt"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Describe your ideal route
        </label>
        <div className="flex gap-2">
          <input
            id="routePrompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2"
            placeholder="e.g., A scenic 5-mile cycling route with coffee shops"
            disabled={isAnalyzing}
          />
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              isAnalyzing || !prompt.trim()
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isAnalyzing ? "Analyzing..." : "Suggest Routes"}
          </button>
        </div>
      </div>

      {metadata && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Route Analysis
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Scenic Rating:</span>{" "}
              <span className="font-medium">{metadata.scenicScore}/10</span>
            </div>
            <div>
              <span className="text-gray-600">Difficulty:</span>{" "}
              <span className="font-medium">{metadata.difficultyScore}/10</span>
            </div>
            {metadata.safetyNotes && metadata.safetyNotes.length > 0 && (
              <div className="col-span-2">
                <span className="text-gray-600">Safety Note:</span>{" "}
                <span className="font-medium">{metadata.safetyNotes[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRouteSuggester;
