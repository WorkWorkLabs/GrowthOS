import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { form } = await request.json();

    if (!form || !form.name || !form.description || !form.category || !form.price) {
      return NextResponse.json(
        { error: "缺少必需的表单字段" },
        { status: 400 },
      );
    }

    const apiKey = process.env.BANANA_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 直接用简化的prompt生成图像，跳过文本生成步骤
    const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    const simplePrompt = `Create a professional promotional poster for a product with these details:
- Product Name: ${form.name}
- Description: ${form.description}
- Category: ${form.category}
- Price: ${form.price}

Create a clean, modern poster design with the product name prominently displayed, a brief description, and the price clearly visible. Use professional colors and typography.`;

    console.log("🎨 Generating image with simplified prompt...");
    const imageResult = await imageModel.generateContent(simplePrompt);
    const imageResponse = imageResult.response;

    // 检查是否有图像数据
    if (!imageResponse.candidates || imageResponse.candidates.length === 0) {
      throw new Error("No image generated");
    }

    const candidate = imageResponse.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
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
      method: "simplified-generation"
    });
    
  } catch (error: unknown) {
    console.error("Simple API Error:", error);

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