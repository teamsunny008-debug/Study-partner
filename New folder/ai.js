/* Study Partner AI backend (a Netlify Function).
   The Anthropic API key stays here on the server and is never sent to the browser.

   Environment variables (set them in Netlify > Site configuration > Environment variables):
     ANTHROPIC_API_KEY   your key from console.anthropic.com   (required)
     ANTHROPIC_MODEL     model name, default below             (optional)
*/
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

const TUTOR = 'You are a patient, friendly study tutor. Solve the problem step by step and explain every step in simple words a student can follow. Give a short real-life example when it helps and finish with a 2-line summary. Use plain text only: numbered steps, no markdown symbols and no LaTeX.\n\nStudent question: ';
const FLOW = 'Return ONLY JSON in this shape: {"nodes":[{"id":"n1","text":"max 7 words","type":"start|process|decision|io|end"}],"edges":[{"from":"n1","to":"n2","label":""}]}. Draw a clear flowchart (max 12 nodes) that explains the following. Make it a classic textbook flowchart: exactly one start and one end, steps in order, use io for input or output, and decisions as yes/no questions. For each decision list the Yes edge first, then the No edge, labelled Yes and No.\n\nTopic: ';
const CARDS = 'Return ONLY JSON in this shape: {"cards":[{"q":"question","a":"answer"}]}. Make 4 to 6 short revision flashcards from the lesson below. Each question under 100 characters and each answer under 200 characters, plain text only.\n\n';

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

/* The model sometimes wraps JSON in extra words: keep only the {...} part */
function extractJson(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a === -1 || b <= a) { throw new Error('no json'); }
  return JSON.parse(text.slice(a, b + 1));
}

exports.handler = async (event) => {
  const key = process.env.ANTHROPIC_API_KEY;

  /* The app asks this once on start-up. If the key exists, the Ask AI tab appears. */
  if (event.httpMethod === 'GET') { return reply(200, { ai: !!key }); }
  if (event.httpMethod !== 'POST') { return reply(405, { error: 'Method not allowed.' }); }
  if (!key) { return reply(500, { error: 'The AI is not set up on the server yet.' }); }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return reply(400, { error: 'Bad request.' }); }

  const task = body.task;
  const input = String(body.input || '').trim().slice(0, 2000);
  const lesson = String(body.lesson || '').slice(0, 8000);
  if (!input) { return reply(400, { error: 'Please type a question first.' }); }

  let prompt, maxTokens;
  if (task === 'solve') { prompt = TUTOR + input; maxTokens = 1000; }
  else if (task === 'flow') { prompt = FLOW + input; maxTokens = 1000; }
  else if (task === 'cards') { prompt = CARDS + 'Question: ' + input + '\n\nLesson:\n' + lesson; maxTokens = 1000; }
  else { return reply(400, { error: 'Unknown task.' }); }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
    });
    if (!res.ok) {
      return reply(res.status === 429 ? 429 : 502, { error: 'The AI service returned an error.' });
    }
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    if (task === 'solve') { return reply(200, { text }); }
    return reply(200, { data: extractJson(text) });
  } catch (e) {
    return reply(502, { error: 'Could not get an answer from the AI. Please try again.' });
  }
};
