import { NextResponse } from "next/server";
import { fetchNewsByKeyword } from "@/lib/fetchNews";
import { sendNewsEmail } from "@/lib/sendEmail";
import keywordsConfig from "@/keywords.json";

// Vercel Cron이 호출하는 엔드포인트
export async function GET(request: Request) {
  // 무단 접근 차단: cron 요청인지 또는 수동 트리거인지 확인
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keywords, recipientEmail } = keywordsConfig;

  if (!recipientEmail || recipientEmail === "your@email.com") {
    return NextResponse.json(
      { error: "keywords.json에서 recipientEmail을 설정해주세요." },
      { status: 400 }
    );
  }

  // 모든 키워드 뉴스 병렬 수집
  const newsData = await Promise.all(
    keywords.map(async (keyword) => ({
      keyword,
      items: await fetchNewsByKeyword(keyword),
    }))
  );

  await sendNewsEmail(recipientEmail, newsData);

  const totalArticles = newsData.reduce((sum, d) => sum + d.items.length, 0);

  return NextResponse.json({
    success: true,
    message: `${keywords.length}개 키워드, ${totalArticles}개 기사를 ${recipientEmail}로 발송했습니다.`,
    sentAt: new Date().toISOString(),
  });
}
