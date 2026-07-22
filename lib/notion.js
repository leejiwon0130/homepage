const { Client } = require("@notionhq/client");

// 이 프로젝트 전용 노션 통합("엘제이뷰 홈페이지") — 학생 개인정보가 있는 강의 프로그램 DB와는
// 완전히 분리된 토큰. 이 토큰이 접근 가능한 DB는 아래 3개뿐(노션에서 그렇게 연결해둠).
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DB = {
  PARTNERS: process.env.NOTION_DB_PARTNERS,
  REVIEWS: process.env.NOTION_DB_REVIEWS,
  CONTACT_REQUESTS: process.env.NOTION_DB_CONTACT_REQUESTS,
};

function text(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  return "";
}

function select(prop) {
  return prop && prop.type === "select" && prop.select ? prop.select.name : null;
}

function number(prop) {
  return prop && prop.type === "number" ? prop.number : null;
}

// files 속성: 노션에 업로드된 파일이든 외부 URL이든 실제 접근 가능한 URL만 뽑아냄
// (노션 호스팅 파일 URL은 일정 시간 후 만료되므로, 매번 새로 조회해서 쓰는 용도로만 사용)
function files(prop) {
  if (!prop || prop.type !== "files") return [];
  return prop.files.map((f) => (f.type === "external" ? f.external.url : f.file.url)).filter(Boolean);
}

function mapPartnerLogo(page) {
  const p = page.properties;
  return {
    id: page.id,
    name: text(p["기관명"]),
    logo: files(p["로고"])[0] || null,
    order: number(p["순서"]),
  };
}

function mapHomepageReview(page) {
  const p = page.properties;
  return {
    id: page.id,
    text: text(p["후기내용"]),
    org: text(p["작성자·기관"]),
    category: select(p["분류"]),
    photo: files(p["사진"])[0] || null,
    order: number(p["순서"]),
  };
}

async function queryAll(database_id, filter, sorts) {
  const results = [];
  let cursor;
  do {
    const res = await notion.databases.query({ database_id, filter, sorts, start_cursor: cursor });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// "노출" 체크된 항목만, 순서 오름차순. 순서가 비어있으면 뒤로 밀림.
async function listPartnerLogos() {
  const pages = await queryAll(DB.PARTNERS, { property: "노출", checkbox: { equals: true } });
  return pages.map(mapPartnerLogo).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

async function listHomepageReviews() {
  const pages = await queryAll(DB.REVIEWS, { property: "노출", checkbox: { equals: true } });
  return pages.map(mapHomepageReview).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

// 홈페이지 문의폼 제출 -> "고객 요청 관리" DB에 새 행 생성 (관리자가 그 DB에서 상태를 직접 관리)
async function createContactRequest({ name, phone, requestType, details }) {
  const page = await notion.pages.create({
    parent: { database_id: DB.CONTACT_REQUESTS },
    properties: {
      "이름": { title: [{ text: { content: name } }] },
      "연락처": { rich_text: [{ text: { content: phone } }] },
      "요청유형": requestType ? { select: { name: requestType } } : undefined,
      "세부내용": { rich_text: [{ text: { content: details || "" } }] },
      "상태": { select: { name: "신규" } },
    },
  });
  return { id: page.id };
}

module.exports = { listPartnerLogos, listHomepageReviews, createContactRequest };
