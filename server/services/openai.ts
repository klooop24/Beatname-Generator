import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback rephrasing function that doesn't use external API
function fallbackRephrase(title: string): string {
  const words = title.split(' ');
  
  // Simple word substitutions
  const substitutions: Record<string, string[]> = {
    "Dark": ["Deep", "Shadowy", "Midnight", "Obscure", "Murky"],
    "City": ["Urban", "Metro", "Downtown", "Metropolis", "Concrete"],
    "Night": ["Twilight", "Evening", "Dusk", "Nocturnal", "Midnight"],
    "Dreams": ["Visions", "Fantasies", "Illusions", "Reveries", "Imagination"],
    "Soul": ["Spirit", "Heart", "Essence", "Core", "Feeling"],
    "Light": ["Glow", "Shine", "Radiance", "Beam", "Glimmer"],
    "Street": ["Road", "Avenue", "Block", "Hood", "Corner"],
    "Flow": ["Wave", "Stream", "Current", "Movement", "Rhythm"],
    "Cold": ["Icy", "Frozen", "Chilled", "Frosty", "Arctic"],
    "Smooth": ["Silky", "Sleek", "Velvety", "Fluid", "Polished"],
    "Wave": ["Ripple", "Surge", "Tide", "Swell", "Undulation"],
    "Fire": ["Flame", "Blaze", "Inferno", "Heat", "Burn"],
    "Money": ["Cash", "Currency", "Paper", "Wealth", "Fortune"],
    "Beat": ["Rhythm", "Pulse", "Tempo", "Cadence", "Groove"],
    "Energy": ["Power", "Force", "Vigor", "Dynamism", "Intensity"],
    "Life": ["Existence", "Living", "Vitality", "Journey", "Experience"],
    "Love": ["Passion", "Affection", "Adoration", "Devotion", "Emotion"]
  };
  
  let rephrased = words.map(word => {
    // Check if we have a substitution for this word
    if (substitutions[word] && Math.random() > 0.5) {
      const options = substitutions[word];
      return options[Math.floor(Math.random() * options.length)];
    }
    return word;
  }).join(' ');
  
  // If no changes were made or by random chance, try a different approach
  if (rephrased === title || Math.random() > 0.7) {
    // Try reversing word order
    if (words.length > 1 && Math.random() > 0.5) {
      rephrased = words.reverse().join(' ');
    } 
    // Or add an adjective prefix
    else {
      const prefixes = ["Eternal", "Cosmic", "Golden", "Crystal", "Royal", "Epic", "Divine", "Sonic", "Electric"];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      rephrased = `${prefix} ${title}`;
    }
  }
  
  return rephrased;
}

/**
 * Rephrase a beat title using OpenAI's GPT model with fallback
 * 
 * @param title The original beat title to rephrase
 * @param genre The genre of the beat (for context)
 * @returns A rephrased version of the title
 */
export async function rephraseBeatTitle(title: string, genre: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    console.log("No OpenAI API key found, using fallback rephrasing");
    return fallbackRephrase(title);
  }
  
  try {
    // Exakt den geforderten Prompt verwenden
    const prompt = `Bitte formuliere den folgenden Beat-Titel so um, dass seine ursprüngliche Bedeutung vollständig erhalten bleibt, aber in einem frischen, kreativen Stil wiedergegeben wird. Verändere weder die grundlegende Bedeutung noch füge zusätzliche Wörter aneinander – generiere einen komplett neu formulierten, aber inhaltlich vergleichbaren Beat-Titel: '${title}'

Wichtige Regeln:
- Behalte die Bedeutung und das Feeling vollständig bei
- Verwende komplett neue Formulierungen/Synonyme
- Der Titel sollte zum ${genre}-Genre passen
- Halte den Titel knapp (ähnliche Länge wie das Original)
- Keine Zusätze wie "Type Beat", "Instrumental" usw.
- Gib NUR den umformulierten Titel zurück, ohne Erklärungen
- Jede Neuformulierung muss IMMER vom Original ausgehen`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are a creative assistant for music producers that specializes in creating catchy beat titles. Only respond with the rephrased title and nothing else. Keep titles short and marketable."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 30, // Limiting token count to ensure we only get the title
      temperature: 0.7, // Good balance between creativity and coherence
    });

    let rephrased = response.choices[0].message.content?.trim() || title;
    
    // Remove any quotes that might be included in the response
    rephrased = rephrased.replace(/["']/g, '');
    
    // If the model responds with anything else, like "Rephrased title:" or explanations, clean it
    rephrased = rephrased.replace(/^(rephrased( title)?:?\s*|new title:?\s*|title:?\s*)/i, '');
    
    // Ensure the title isn't empty after cleaning
    return rephrased || title;
  } catch (error) {
    console.log("Falling back to local rephrasing due to API error");
    console.error("Error rephrasing title with OpenAI:", error);
    // Fall back to the local rephrasing function if there's an API error
    return fallbackRephrase(title);
  }
}