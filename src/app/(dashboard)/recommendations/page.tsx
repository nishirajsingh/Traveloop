"use client";

import { useEffect, useState } from "react";
import { Sparkles, MapPin, Activity, Lightbulb, AlertCircle } from "lucide-react";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }
      const data = await res.json();
      setRecommendations(data);
    } catch (error: any) {
      console.error("Failed to fetch recommendations:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Error Loading Recommendations</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchRecommendations();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="font-bold text-yellow-900 mb-2">No Recommendations Yet</h3>
          <p className="text-yellow-700 text-sm">Create some trips to get personalized recommendations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">AI Travel Recommendations</h1>
      </div>

      {recommendations?.insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{recommendations.insights.totalTrips}</div>
            <div className="text-sm opacity-90">Total Trips</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{recommendations.insights.citiesVisited}</div>
            <div className="text-sm opacity-90">Cities Visited</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{recommendations.insights.countriesVisited}</div>
            <div className="text-sm opacity-90">Countries Explored</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">${recommendations.insights.avgBudget}</div>
            <div className="text-sm opacity-90">Avg Budget</div>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Recommended Destinations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations?.destinations?.map((dest: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <img src={dest.image} alt={dest.city} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg">{dest.city}</h3>
                <p className="text-sm text-gray-600 mb-2">{dest.country}</p>
                <p className="text-sm text-gray-700 mb-3">{dest.reason}</p>
                <div className="flex flex-wrap gap-1">
                  {dest.tags.map((tag: string, i: number) => (
                    <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-semibold">Suggested Activities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations?.activities?.map((activity: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{activity.title}</h3>
                <span className="text-sm font-semibold text-green-600">${activity.estimatedCost}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
              <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {activity.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-semibold">Travel Tips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations?.tips?.map((tip: any, idx: number) => (
            <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 border border-yellow-200">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <h3 className="font-bold text-lg mb-1">{tip.title}</h3>
              <p className="text-sm text-gray-700">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
