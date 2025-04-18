/**
 * Frame Recommendation Service
 * 
 * This service uses OpenAI to provide personalized frame recommendations
 * based on artwork details and customer preferences.
 */

import OpenAI from "openai";
import { Frame } from "@shared/schema";
import { db } from "../db";
import { log } from "../vite";
import { sql } from "drizzle-orm";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface RecommendationParams {
  artworkType: string;
  artworkDescription: string;
  artworkWidth: number;
  artworkHeight: number;
  colorPreference?: string;
  stylePreference?: string;
  budgetLevel?: 'economy' | 'standard' | 'premium';
  roomDecor?: string;
  customerPreference?: string;
}

interface RecommendationResponse {
  recommendations: Frame[];
  matRecommendations: string[];
  reasonings: Record<string, string>;
  suggestedPairings: Record<string, string[]>;
}

/**
 * Get personalized frame recommendations
 */
export async function getRecommendations(params: RecommendationParams): Promise<RecommendationResponse> {
  try {
    log("Getting frame recommendations with OpenAI", "recommendationService");
    
    // Get all frames from database to use as context
    const allFrames = await db.query.frames.findMany();
    
    if (!allFrames.length) {
      throw new Error("No frames found in database");
    }
    
    log(`Found ${allFrames.length} frames for recommendation context`, "recommendationService");
    
    // Create a prompt for OpenAI that includes the available frames
    const prompt = createPrompt(params, allFrames);
    
    // Call OpenAI to get recommendations
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system", 
          content: "You are an expert custom framing consultant with extensive knowledge of frame styles, materials, and design principles. Your recommendations should be based on the available frames in the database and should match the artwork specifications and customer preferences."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }
    
    // Parse the response
    const aiResponse = JSON.parse(responseContent);
    
    // Map AI recommendations to actual frame objects
    const recommendedFrames = await mapRecommendationsToFrames(aiResponse.recommendedFrameIds, allFrames);
    
    return {
      recommendations: recommendedFrames,
      matRecommendations: aiResponse.matRecommendations || [],
      reasonings: aiResponse.reasonings || {},
      suggestedPairings: aiResponse.suggestedPairings || {}
    };
  } catch (error) {
    log(`Error getting frame recommendations: ${error}`, "recommendationService");
    throw error;
  }
}

/**
 * Create a prompt for the OpenAI model
 */
function createPrompt(params: RecommendationParams, availableFrames: Frame[]): string {
  // Create a concise representation of available frames
  const framesList = availableFrames.map(frame => {
    return {
      id: frame.id,
      name: frame.name,
      manufacturer: frame.manufacturer,
      material: frame.material,
      width: frame.width,
      price: frame.price,
      color: frame.color,
      style: frame.style || "standard",
      finish: frame.finish || "standard"
    };
  });
  
  // Create the prompt
  return `
I need personalized frame recommendations for custom framing. 

ARTWORK DETAILS:
- Type: ${params.artworkType}
- Description: ${params.artworkDescription}
- Dimensions: ${params.artworkWidth}" × ${params.artworkHeight}"

${params.colorPreference ? `- Color preference: ${params.colorPreference}` : ''}
${params.stylePreference ? `- Style preference: ${params.stylePreference}` : ''}
${params.budgetLevel ? `- Budget level: ${params.budgetLevel}` : ''}
${params.roomDecor ? `- Room decor: ${params.roomDecor}` : ''}
${params.customerPreference ? `- Customer preference: ${params.customerPreference}` : ''}

AVAILABLE FRAMES:
${JSON.stringify(framesList, null, 2)}

Please recommend 3-5 frames that would best suit this artwork based on the details provided. Consider the style, color, and material of the frame in relation to the artwork. Also suggest appropriate mat colors that would pair well with the recommended frames.

Response must be in the following JSON format:
{
  "recommendedFrameIds": ["frame-id-1", "frame-id-2", "frame-id-3"],
  "matRecommendations": ["White", "Black", "Gold", "etc"],
  "reasonings": {
    "frame-id-1": "Explanation for why this frame was recommended",
    "frame-id-2": "Explanation for why this frame was recommended"
  },
  "suggestedPairings": {
    "frame-id-1": ["White mat", "Black mat"],
    "frame-id-2": ["Cream mat", "Tan mat"]
  }
}

Make sure the recommendedFrameIds field only contains IDs that are actually in the available frames list.
`;
}

/**
 * Map AI recommendation IDs to actual frame objects
 */
async function mapRecommendationsToFrames(recommendedIds: string[], allFrames: Frame[]): Promise<Frame[]> {
  // Create a mapping of frame IDs to frame objects
  const frameMap: Record<string, Frame> = {};
  allFrames.forEach(frame => {
    frameMap[frame.id] = frame;
  });
  
  // Map recommended IDs to frame objects
  const recommendedFrames: Frame[] = [];
  for (const id of recommendedIds) {
    if (frameMap[id]) {
      recommendedFrames.push(frameMap[id]);
    }
  }
  
  // If we couldn't find exact matches, try to find close matches
  if (recommendedFrames.length === 0 && recommendedIds.length > 0) {
    log("No exact matches found for recommendations, trying fuzzy matching", "recommendationService");
    
    // This might happen if the AI returns frame IDs that don't exactly match
    // Try to find frames with similar IDs or names
    for (const id of recommendedIds) {
      // Try to find a frame with a similar ID
      const similarIdFrames = allFrames.filter(frame => frame.id.includes(id) || id.includes(frame.id));
      if (similarIdFrames.length > 0) {
        recommendedFrames.push(similarIdFrames[0]);
        continue;
      }
      
      // Try to find a frame with a similar name
      const words = id.split(/[-_\s]+/);
      for (const word of words) {
        if (word.length < 3) continue; // Skip short words
        
        const similarNameFrames = allFrames.filter(frame => frame.name.toLowerCase().includes(word.toLowerCase()));
        if (similarNameFrames.length > 0) {
          recommendedFrames.push(similarNameFrames[0]);
          break;
        }
      }
    }
  }
  
  return recommendedFrames;
}

/**
 * Get frame recommendations based on artwork image analysis
 */
export async function getRecommendationsFromImage(imageBase64: string, params: Partial<RecommendationParams>): Promise<RecommendationResponse> {
  try {
    log("Getting frame recommendations from image analysis", "recommendationService");
    
    // Get all frames from database to use as context
    const allFrames = await db.query.frames.findMany();
    
    if (!allFrames.length) {
      throw new Error("No frames found in database");
    }
    
    // Create a concise representation of available frames
    const framesList = allFrames.map(frame => {
      return {
        id: frame.id,
        name: frame.name,
        manufacturer: frame.manufacturer,
        material: frame.material,
        width: frame.width,
        price: frame.price,
        color: frame.color,
        style: frame.style || "standard",
        finish: frame.finish || "standard"
      };
    });
    
    // Call OpenAI vision model to analyze the image
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert custom framing consultant with extensive knowledge of frame styles, materials, and design principles. Analyze the artwork in the image and recommend appropriate frames from the available options."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
I need personalized frame recommendations for this artwork. 
Please analyze the image and recommend frames that would complement it.

${params.artworkType ? `- Type: ${params.artworkType}` : ''}
${params.artworkDescription ? `- Description: ${params.artworkDescription}` : ''}
${params.artworkWidth && params.artworkHeight ? `- Dimensions: ${params.artworkWidth}" × ${params.artworkHeight}"` : ''}
${params.colorPreference ? `- Color preference: ${params.colorPreference}` : ''}
${params.stylePreference ? `- Style preference: ${params.stylePreference}` : ''}
${params.budgetLevel ? `- Budget level: ${params.budgetLevel}` : ''}

AVAILABLE FRAMES:
${JSON.stringify(framesList, null, 2)}

First, describe the artwork's colors, style, and subject matter.
Then recommend 3-5 frames that would best suit this artwork.
Consider the style, color, and material of the frame in relation to the artwork.
Also suggest appropriate mat colors that would pair well with the recommended frames.

Response must be in the following JSON format:
{
  "artworkAnalysis": "Description of the artwork colors, style, and subject matter",
  "recommendedFrameIds": ["frame-id-1", "frame-id-2", "frame-id-3"],
  "matRecommendations": ["White", "Black", "Gold", "etc"],
  "reasonings": {
    "frame-id-1": "Explanation for why this frame was recommended",
    "frame-id-2": "Explanation for why this frame was recommended"
  },
  "suggestedPairings": {
    "frame-id-1": ["White mat", "Black mat"],
    "frame-id-2": ["Cream mat", "Tan mat"]
  }
}

Make sure the recommendedFrameIds field only contains IDs that are actually in the available frames list.
`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200,
    });
    
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }
    
    // Parse the response
    const aiResponse = JSON.parse(responseContent);
    
    // Map AI recommendations to actual frame objects
    const recommendedFrames = await mapRecommendationsToFrames(aiResponse.recommendedFrameIds, allFrames);
    
    return {
      recommendations: recommendedFrames,
      matRecommendations: aiResponse.matRecommendations || [],
      reasonings: {
        ...aiResponse.reasonings || {},
        artworkAnalysis: aiResponse.artworkAnalysis || "No analysis provided"
      },
      suggestedPairings: aiResponse.suggestedPairings || {}
    };
  } catch (error) {
    log(`Error getting frame recommendations from image: ${error}`, "recommendationService");
    throw error;
  }
}