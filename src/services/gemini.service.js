const axios = require('axios');

module.exports = async (job) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback default if key is not configured yet
    return { score: 75, apply: true };
  }

  const title = job.title || 'Untitled';
  const snippet = job.snippet || job.description || '';

  const prompt = `
You are an AI assistant evaluating job postings for a Node.js Backend Developer.
Here is the job title: "${title}"
Here is the job description snippet: "${snippet}"

Based on this information, evaluate:
1. A score from 0 to 100 on how relevant this job is to a Node.js Backend Developer (skills: Node.js, Express, NestJS, TypeScript, PostgreSQL, MongoDB, Redis, APIs).
2. A boolean decision "apply" (true if the score is 70 or higher, false otherwise).

Return your response ONLY as a JSON object in the following format (do not wrap in markdown or code blocks):
{
  "score": number,
  "apply": boolean
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const text = response.data.candidates[0].content.parts[0].text.trim();
    
    // Extract JSON block in case Gemini wraps it
    let cleanText = text;
    if (cleanText.includes('{')) {
      cleanText = cleanText.substring(cleanText.indexOf('{'), cleanText.lastIndexOf('}') + 1);
    }

    const result = JSON.parse(cleanText);
    return {
      score: Number(result.score) || 0,
      apply: typeof result.apply === 'boolean' ? result.apply : (Number(result.score) >= 70)
    };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return { score: 50, apply: false };
  }
};