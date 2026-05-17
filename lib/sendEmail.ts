import { Resend } from "resend";
import { NewsItem } from "./fetchNews";

const resend = new Resend(process.env.RESEND_API_KEY);

interface KeywordNews {
  keyword: string;
  items: NewsItem[];
}

export async function sendNewsEmail(
  recipientEmail: string,
  newsData: KeywordNews[]
) {
  const today = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const html = buildEmailHtml(today, newsData);

  await resend.emails.send({
    from: "뉴스레터 <newsletter@resend.dev>",
    to: recipientEmail,
    subject: `📰 ${today} 시장 동향 뉴스`,
    html,
  });
}

function buildEmailHtml(date: string, newsData: KeywordNews[]): string {
  const keywordSections = newsData
    .map(({ keyword, items }) => {
      if (items.length === 0) {
        return `
          <div style="margin-bottom:32px;">
            <h2 style="font-size:18px;color:#1a1a1a;border-left:4px solid #0070f3;padding-left:12px;margin:0 0 12px;">
              ${keyword}
            </h2>
            <p style="color:#888;font-size:14px;">관련 뉴스를 찾을 수 없습니다.</p>
          </div>`;
      }

      const articleRows = items
        .map(
          (item) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
              <a href="${item.link}" style="font-size:15px;color:#0070f3;text-decoration:none;line-height:1.5;display:block;margin-bottom:4px;">
                ${item.title.replace(/ - [^-]+$/, "")}
              </a>
              <span style="font-size:12px;color:#999;">
                ${item.source ? `${item.source} &nbsp;·&nbsp; ` : ""}${item.pubDate}
              </span>
            </td>
          </tr>`
        )
        .join("");

      return `
        <div style="margin-bottom:36px;">
          <h2 style="font-size:18px;color:#1a1a1a;border-left:4px solid #0070f3;padding-left:12px;margin:0 0 16px;">
            ${keyword}
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            ${articleRows}
          </table>
        </div>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <div style="background:#0070f3;padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">📰 오늘의 시장 동향 뉴스</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${date}</p>
        </div>

        <div style="padding:32px;">
          ${keywordSections}
        </div>

        <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">
            키워드 변경: <code>keywords.json</code> 파일을 수정하세요
          </p>
        </div>
      </div>
    </body>
    </html>`;
}
