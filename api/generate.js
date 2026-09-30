export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: prompt.trim(),
          size: "1024x1024",
          quality: "auto",
          output_format: "png"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Image generation failed"
      });
    }

    const b64 = data?.data?.[0]?.b64_json;

    if (!b64) {
      return res.status(500).json({
        error: "No image was returned"
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${b64}`
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
}
