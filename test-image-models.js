// 测试不同的图像生成模型
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testImageModels() {
  const apiKey = "AIzaSyCqfEuGQ4pph0OtsZjT4sapeKxzRD3oNVA";
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = [
    "gemini-2.5-flash-image-preview",
    "imagen-3.0-generate-001", // 可能的Imagen模型
    "gemini-pro-vision", // 旧版本视觉模型
  ];

  const simplePrompt = "Create a simple poster design for a coffee maker product with the text 'Smart Coffee Maker' and price '$299'";

  for (const modelName of models) {
    try {
      console.log(`🧪 Testing model: ${modelName}`);
      
      const imageModel = genAI.getGenerativeModel({ model: modelName });
      const result = await imageModel.generateContent(simplePrompt);
      
      console.log(`✅ ${modelName}: SUCCESS`);
      console.log("Response type:", typeof result.response);
      
      if (result.response.candidates && result.response.candidates[0]) {
        const candidate = result.response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          const imagePart = candidate.content.parts.find(part => part.inlineData);
          if (imagePart) {
            console.log(`📸 Image generated successfully with ${modelName}`);
            return modelName; // 返回工作的模型
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ ${modelName}: ${error.message.substring(0, 100)}...`);
    }
  }
  
  return null;
}

testImageModels().then(workingModel => {
  if (workingModel) {
    console.log(`\n🎉 Found working model: ${workingModel}`);
  } else {
    console.log("\n😞 No working image models found");
  }
});