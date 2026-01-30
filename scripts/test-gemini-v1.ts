import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGeminiV1() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in .env.local");
        process.exit(1);
    }

    console.log("Initializing Gemini with API Key (truncated):", apiKey.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Explicitly use v1 to verify the fix
    const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-pro" },
        { apiVersion: 'v1' }
    );

    console.log("Sending test request to Gemini v1 (gemini-2.5-pro)...");
    try {
        const result = await model.generateContent("Explain ROI in construction briefly.");
        const response = await result.response;
        const text = response.text();
        console.log("\n--- SUCCESS ---");
        console.log("Response:", text);
        console.log("----------------\n");
    } catch (error: any) {
        console.error("\n--- FAILED ---");
        console.error("Error:", error.message);
        if (error.stack) console.error(error.stack);
        console.log("----------------\n");
        process.exit(1);
    }
}

testGeminiV1();
