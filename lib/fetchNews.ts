import Parser from "rss-parser";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

const parser = new Parser({
  customFields: {
    item: [["source", "source"]],
  },
});

export async function fetchNewsByKeyword(keyword: string): Promise<NewsItem[]> {
  const encodedKeyword = encodeURIComponent(keyword);
  const url = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=ko&gl=KR&ceid=KR:ko`;

  const feed = await parser.parseURL(url);

  return (feed.items || []).slice(0, 5).map((item) => ({
    title: item.title || "제목 없음",
    link: item.link || "",
    pubDate: item.pubDate ? formatDate(item.pubDate) : "",
    source: extractSource(item.title || ""),
  }));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Google News RSS 제목 형식: "기사 제목 - 언론사명"
function extractSource(title: string): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}
