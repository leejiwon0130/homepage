const { createContactRequest } = require("../../lib/notion");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 홈페이지(워드프레스) 문의폼 -> "고객 요청 관리" Notion DB. 폼의 문의구분 값을 그 DB의 요청유형 옵션명으로 매핑.
const REQUEST_TYPE_MAP = {
  "강의": "강의문의",
  "홍보대행": "홍보대행문의",
  "컨설팅": "컨설팅문의",
  "디자인": "디자인문의",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "method not allowed" }) };
  }

  const { name, phone, requestType, details } = JSON.parse(event.body || "{}");
  if (!name || !phone) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "이름과 연락처를 입력해주세요" }) };
  }

  try {
    await createContactRequest({
      name,
      phone,
      requestType: REQUEST_TYPE_MAP[requestType] || null,
      details,
    });
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "문의 접수 중 오류가 발생했습니다" }),
    };
  }
};
