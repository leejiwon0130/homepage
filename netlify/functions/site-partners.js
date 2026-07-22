const { listPartnerLogos } = require("../../lib/notion");

// 홈페이지(워드프레스, 다른 도메인) "위드 엘제이뷰" 로고 마퀴 전용 공개 엔드포인트.
// CORS 전면 허용 — 로고 목록은 민감 정보가 아니고, 어느 도메인에서 홈페이지를 서빙하든 바로 붙게 하기 위함.
exports.handler = async () => {
  try {
    const partners = await listPartnerLogos();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ partners }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "파트너 목록을 불러오지 못했습니다" }),
    };
  }
};
