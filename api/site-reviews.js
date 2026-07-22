const { listHomepageReviews } = require("../lib/notion");

// 홈페이지(워드프레스, 다른 도메인) Reviews 마소니 섹션 전용 공개 엔드포인트. CORS 전면 허용.
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const reviews = await listHomepageReviews();
    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "후기 목록을 불러오지 못했습니다" });
  }
};
