const { createContactRequest } = require("../lib/notion");

// 홈페이지(워드프레스) 문의폼 -> "고객 요청 관리" Notion DB. 폼의 문의구분 값을 그 DB의 요청유형 옵션명으로 매핑.
const REQUEST_TYPE_MAP = {
  "강의": "강의문의",
  "홍보대행": "홍보대행문의",
  "컨설팅": "컨설팅문의",
  "디자인": "디자인문의",
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { name, phone, requestType, details } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: "이름과 연락처를 입력해주세요" });
  }

  try {
    await createContactRequest({
      name,
      phone,
      requestType: REQUEST_TYPE_MAP[requestType] || null,
      details,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "문의 접수 중 오류가 발생했습니다" });
  }
};
