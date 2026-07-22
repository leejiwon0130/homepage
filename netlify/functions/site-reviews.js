const { listHomepageReviews } = require("../../lib/notion");

// 홈페이지(워드프레스, 다른 도메인) Reviews 마소니 섹션 전용 공개 엔드포인트. CORS 전면 허용.
exports.handler = async () => {
  try {
    const reviews = await listHomepageReviews();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ reviews }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "후기 목록을 불러오지 못했습니다" }),
    };
  }
};
