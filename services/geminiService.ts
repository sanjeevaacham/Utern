
import { GoogleGenAI, Type } from "@google/genai";
import { DesignConfig, DesignType } from "../types";

export const generateTrafficProposal = async (config: DesignConfig) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze an 8-lane urban arterial (4+4 or equivalent) with focus on ZERO OBSTRUCTION to through-traffic using these specific user-defined parameters:
    - L1 Width (U-Turn Canal): ${config.l1Width}m
    - L2 Width (Express): ${config.l2Width}m
    - L3 Width (Express): ${config.l3Width}m
    - Median Width: ${config.medianWidth}m
    - Target Flow Speed: ${config.trafficSpeed} km/h
    
    Problem Statement: U-turning vehicles often encroach into outer lanes (L2, L3), causing bottlenecks.
    Solution: A dedicated L1 canal with a solid high-visibility divider separating it from L2.
    
    The proposal MUST address:
    1. Width Sufficiency: Given the L1 width of ${config.l1Width}m, evaluate if heavy vehicles (buses) can complete a 64m/28m elliptical turn without hitting L2 buffers.
    2. Speed-Lane Relationship: How the through-lanes (L2=${config.l2Width}m, L3=${config.l3Width}m) support the target speed of ${config.trafficSpeed}km/h.
    3. Segregation Effectiveness: Evaluate the median (${config.medianWidth}m) and divider impact on safety score.
    4. IRC Protocol: Compliance with IRC guidelines for segregated median turn-arounds.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "Failed to generate proposal.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI response.";
  }
};

export const generateUturnVideo = async (config: DesignConfig) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `A 4K professional traffic simulation. A highway with multiple lanes. Lane 1 is a dedicated ${config.l1Width}m wide U-turn canal with a bold yellow barrier. Large LIGHT BLUE buses are making U-turns within Lane 1 at ${config.trafficSpeed/2}km/h. Fast cars are zooming uninterrupted through outer lanes (each ${config.l2Width}m wide). Architectural flyover-style lighting, high-contrast road markings.`;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed.");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo Error:", error);
    throw error;
  }
};
