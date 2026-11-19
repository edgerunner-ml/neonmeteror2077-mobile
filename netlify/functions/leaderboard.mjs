import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("pinball-leaderboard");
  const headers = { "Content-Type": "application/json" };

  // Busca o ranking atual ou inicia vazio
  let scores = (await store.get("top10", { type: "json" })) || [];

  // POST: Salva uma nova pontuação
  if (req.method === "POST") {
    try {
      const { name, score } = await req.json();
      const cleanName = String(name || "AAA")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 3) || "AAA";
      const cleanScore = Math.max(0, Math.floor(Number(score) || 0));

      if (cleanScore > 0) {
        scores.push({ name: cleanName, score: cleanScore, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10); // Mantém apenas o Top 10
        await store.setJSON("top10", scores);
      }

      return new Response(JSON.stringify(scores), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), { status: 400, headers });
    }
  }

  // GET: Retorna o Top 10
  return new Response(JSON.stringify(scores), { status: 200, headers });
};
