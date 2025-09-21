import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const MODEL_TEXT = "gemini-2.5-flash-lite";
const MODEL_IMAGE = "gemini-2.5-flash-image-preview";

const promptA = `Your task is to design an appropriate promotional poster for the user based on the provided product details, such as its name, description, price, and category. The design should include the poster's overall style, background, and all text content. Ensure that the poster is visually appealing and effectively communicates the product's value. All of your responses must be in English, irrespective of the language used in the user's submission.`;

const promptB = `The user has provided a description for the design of their product's promotional poster. Your task is to illustrate this poster according to the user's description.Use the input image as a logo.`;

export async function POST(request: NextRequest) {
  try {
    const { form } = await request.json();

    if (
      !form ||
      !form.name ||
      !form.description ||
      !form.category ||
      !form.price
    ) {
      return NextResponse.json(
        { error: "缺少必需的表单字段" },
        { status: 400 },
      );
    }

    // 优先使用专用的Banana API Key，如果没有则使用通用的
    const apiKey = process.env.BANANA_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Step 1: 使用文本模型生成海报设计描述
    const textModel = genAI.getGenerativeModel({ model: MODEL_TEXT });

    const textPrompt = `${promptA}

Product Details:
- Name: ${form.name}
- Description: ${form.description}
- Category: ${form.category}
- Price: ${form.price}

Please provide a detailed description for creating a promotional poster for this product.`;

    const textResult = await textModel.generateContent(textPrompt);
    const posterDescription = textResult.response.text();

    // Step 2: 使用图像生成模型创建海报
    const imageModel = genAI.getGenerativeModel({ model: MODEL_IMAGE });

    const imagePrompt = `${promptB}

Poster Design Description:
${posterDescription}

Create a high-quality promotional poster based on this description.`;

    const imageResult = await imageModel.generateContent(imagePrompt);
    const imageResponse = imageResult.response;

    // 检查是否有图像数据
    if (!imageResponse.candidates || imageResponse.candidates.length === 0) {
      throw new Error("No image generated");
    }

    const candidate = imageResponse.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error("No image parts found");
    }

    // 查找图像部分
    const imagePart = candidate.content.parts.find((part) => part.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No image data found");
    }

    return NextResponse.json({
      success: true,
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
      posterDescription,
    });
  } catch (error: unknown) {
    console.error("API Error:", error);

    let errorMessage = "Failed to generate image.";
    if (error instanceof Error) {
      if (error.message?.includes("429")) {
        errorMessage = "API LIMITED: Too many requests. Please try again later.";
      } else if (error.message?.includes("API key")) {
        errorMessage = "API ERROR: Invalid API key.";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
