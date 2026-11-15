export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "GET 요청만 지원합니다." });
  }

  const day = String(req.query.day || "");
  const validDays = new Set(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  if (!validDays.has(day)) {
    return res.status(400).json({ error: "요일 값이 올바르지 않습니다." });
  }

  try {
    const upstream = await fetch(
      `https://comic.naver.com/api/webtoon/titlelist/weekday?week=${day}&order=user`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ToonChart/1.0)",
          Referer: "https://comic.naver.com/",
          "Accept-Language": "ko-KR,ko;q=0.9",
        },
        cache: "no-store",
      },
    );
    if (!upstream.ok) {
      throw new Error(`네이버 응답 오류 (${upstream.status})`);
    }
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({
      day,
      source: "Naver Webtoon",
      updatedAt: new Date().toISOString(),
      titles: data.titleList || [],
    });
  } catch (error) {
    console.error("Naver Webtoon API error:", error);
    return res.status(502).json({ error: "네이버웹툰 데이터를 불러오지 못했습니다." });
  }
}

