// 测试只有文本生成的部分
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testTextGeneration() {
  const apiKey = "AIzaSyCqfEuGQ4pph0OtsZjT4sapeKxzRD3oNVA";
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log("🧪 Testing text generation only...");
    
    // Step 1: 文本模型生成海报设计描述
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const promptA = `Your task is to design an appropriate promotional poster for the user based on the provided product details, such as its name, description, price, and category. The design should include the poster's overall style, background, and all text content. Ensure that the poster is visually appealing and effectively communicates the product's value. All of your responses must be in English, irrespective of the language used in the user's submission.`;

    const textPrompt = `${promptA}

Product Details:
- Name: Smart Coffee Maker
- Description: AI-powered coffee maker that learns your preferences
- Category: Tool
- Price: $299

Please provide a detailed description for creating a promotional poster for this product.`;

    console.log("🔄 Generating poster description...");
    const textResult = await textModel.generateContent(textPrompt);
    const posterDescription = textResult.response.text();
    
    console.log("✅ Text generation successful!");
    console.log("📄 Generated description:");
    console.log(posterDescription);
    
    return posterDescription;
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

testTextGeneration();