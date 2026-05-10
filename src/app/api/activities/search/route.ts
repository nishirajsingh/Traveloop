import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) return NextResponse.json([]);

  try {
    const apiKey = process.env.GEODB_API_KEY;
    if (apiKey) {
      const res = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=10&sort=-population`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(
          data.data?.map((c: { id: number; city: string; country: string; countryCode: string; population: number; latitude: number; longitude: number }) => ({
            id: String(c.id),
            name: c.city,
            country: c.country,
            countryCode: c.countryCode,
            population: c.population,
            latitude: c.latitude,
            longitude: c.longitude,
          })) || []
        );
      }
    }

    // Fallback: Teleport API (free, no key needed)
    const res = await fetch(
      `https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}&limit=10`
    );
    if (res.ok) {
      const data = await res.json();
      const results = await Promise.all(
        (data._embedded?.["city:search-results"] || []).slice(0, 8).map(
          async (item: { matching_full_name: string; _links: { "city:item": { href: string } } }) => {
            const parts = item.matching_full_name.split(", ");
            return {
              id: item._links["city:item"].href,
              name: parts[0],
              country: parts[parts.length - 1],
              countryCode: "",
            };
          }
        )
      );
      return NextResponse.json(results);
    }
  } catch {
    // fallback to empty
  }

  return NextResponse.json([]);
}
