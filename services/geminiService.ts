
import { GoogleGenAI, Type } from "@google/genai";
import { DesignConfig, DesignType } from "../types";

export const generateTrafficProposal = async (config: DesignConfig) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze a 6-lane urban arterial (3+3) focused on ZERO OBSTRUCTION to through-traffic:
    - Problem Statement: U-turning vehicles often encroach into outer lanes (L2, L3), causing traffic bottlenecks.
    - Solution: A dedicated 7m wide U-turn canal in Lane 1 with a solid high-visibility divider (Yellow/Red) separating it from Lane 2.
    - Lane 2 and 3 are designated as "EXPRESS THROUGH LANES" and are physically/visually protected from turning encroachment.
    - Ellipse Dimensions: 64m Major Axis and 28m Minor Axis transition strictly contained in the 7m canal.
    - Traffic Dynamics: Through traffic in L2 and L3 maintains high velocity (60km/h+) while L1 turns occur independently.
    
    The proposal MUST address:
    1. Through-Lane Protection: The specific engineering design that ensures L2 and L3 traffic is never forced to brake or swerve for U-turners.
    2. Segregation Mechanism: How the 7m wide L1 zone and solid dividers eliminate lane overlap during the 28m minor axis sweep.
    3. Bus Turn Radius: Verification that a light-blue heavy bus can complete the turn within the 7m width without entering L2.
    4. IRC Protocol: Compliance with IRC:SP:41 guidelines for segregated median turn-arounds.
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
  
  const prompt = `A 4K professional traffic simulation. A highway with 3 lanes per side. Lane 1 is a dedicated U-turn canal with a bold yellow barrier separating it from Lane 2. Large LIGHT BLUE buses are making U-turns within Lane 1. Fast cars are zooming uninterrupted through Lanes 2 and 3 (Express Through Lanes). There is zero braking in the outer lanes. High-contrast road markings and architectural flyover-style lighting.`;

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
