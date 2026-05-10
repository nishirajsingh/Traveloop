"use client";

import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

const TRAVEL_STYLES = ["Adventure", "Luxury", "Budget", "Cultural", "Relaxation", "Family", "Solo", "Backpacking"];
const INTERESTS = ["Food", "Culture", "Nature", "Beach", "History", "Shopping", "Nightlife", "Photography", "Sports", "Wellness"];
const CLIMATES = ["Tropical", "Temperate", "Cold", "Desert", "Mediterranean"];

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    travelStyle: [] as string[],
    interests: [] as string[],
    budgetRange: "medium",
    preferredClimate: [] as string[],
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data) setPreferences(data);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        toast.success("Preferences saved successfully!");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (key: keyof typeof preferences, value: string) => {
    const current = preferences[key] as string[];
    setPreferences({
      ...preferences,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Travel Preferences</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Travel Style</h2>
          <p className="text-sm text-gray-600 mb-4">Select your preferred travel styles</p>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => toggleItem("travelStyle", style)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  preferences.travelStyle.includes(style)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Interests</h2>
          <p className="text-sm text-gray-600 mb-4">What activities do you enjoy?</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleItem("interests", interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  preferences.interests.includes(interest)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Budget Range</h2>
          <p className="text-sm text-gray-600 mb-4">Your typical travel budget</p>
          <div className="flex gap-3">
            {["low", "medium", "high"].map((range) => (
              <button
                key={range}
                onClick={() => setPreferences({ ...preferences, budgetRange: range })}
                className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                  preferences.budgetRange === range
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Preferred Climate</h2>
          <p className="text-sm text-gray-600 mb-4">What weather do you prefer?</p>
          <div className="flex flex-wrap gap-2">
            {CLIMATES.map((climate) => (
              <button
                key={climate}
                onClick={() => toggleItem("preferredClimate", climate)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  preferences.preferredClimate.includes(climate)
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {climate}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Your preferences help us provide better travel recommendations tailored to your interests!
        </p>
      </div>
    </div>
  );
}
