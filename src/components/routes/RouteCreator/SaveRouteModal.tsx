// src/components/routes/RouteCreator/SaveRouteModal.tsx

import { useState } from "react";
import { SaveRouteData, RouteDetails } from "./types";

interface SaveRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routeData: SaveRouteData) => void;
  distance: number;
  estimatedTime: string;
  isLoading?: boolean;
  error?: string | null;
  routeDetails: RouteDetails | null;
}

const SaveRouteModal: React.FC<SaveRouteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  distance,
  estimatedTime,
  isLoading = false,
  error = null,
  routeDetails,
}) => {
  const [formData, setFormData] = useState<SaveRouteData>({
    name: "",
    description: "",
    type: "leisure",
    isPrivate: false,
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setSaveError("Route name is required");
      return;
    }

    if (!routeDetails?.geometry) {
      setSaveError("No route data available");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Save Route</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isLoading}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {(error || saveError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error || saveError}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Distance: {(distance / 1000).toFixed(1)} km</span>
            <span>Est. Time: {estimatedTime}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Morning Ride"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Add notes about this route..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as SaveRouteData["type"],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            >
              <option value="leisure">Leisure</option>
              <option value="training">Training</option>
              <option value="commute">Commute</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPrivate: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              Make this route private
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim()}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save Route"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveRouteModal;
