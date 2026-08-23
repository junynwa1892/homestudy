module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key is not configured.' });
  const data = req.body?.state;
  if (!data) return res.status(400).json({ error: '학습 기록이 없습니다.' });
  const prompt = `당신은 1:1 과외 학생의 학습 코치입니다. 아래 학습 기록만 바탕으로 한국어로 짧고 구체적으로 진단하세요. 반드시 다음 순서의 제목을 포함하세요: "부족한 과목", "오늘 회독 추천", "바로 할 일". 과장하거나 기록에 없는 사실을 단정하지 마세요. ✕와 △ 또는 미완료 기록은 복습 필요로 보고, 과목별 누적 시간과 최근 학교 진도를 고려하세요. 추천은 최대 3과목, 각 과목은 이유와 구체적 분량을 한 줄로 쓰세요.\n\n학습 기록:\n${JSON.stringify(data)}`;
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 700 } })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || 'Gemini 요청에 실패했습니다.');
    const text = result?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '진단 결과를 만들지 못했습니다.';
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message || 'AI 진단 중 오류가 발생했습니다.' });
  }
};
