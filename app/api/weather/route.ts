import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const key = process.env.WEATHER_API_KEY;

  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  if (!lat || !lon) return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(
    key
  )}&units=metric&lang=kr`;

  const ow = await fetch(url, { cache: "no-store" });

  // 에러 디버그용: JSON이 아닌 경우도 안전하게 처리
  const ct = ow.headers.get("content-type") || "";
  const raw = await ow.text();

  if (!ow.ok) {
    return NextResponse.json(
      { error: "OpenWeather error", status: ow.status, contentType: ct, body: raw.slice(0, 300) },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(
      { error: "Non-JSON from OpenWeather", contentType: ct, body: raw.slice(0, 300) },
      { status: 502 }
    );
  }
}
