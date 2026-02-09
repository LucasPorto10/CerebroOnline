
// Test import of new SDK
// import { GoogleGenAI } from "https://esm.sh/@google/genai";
import { GoogleGenAI } from "https://esm.sh/@google/genai";

console.log("Import successful");

try {
    const ai = new GoogleGenAI({ apiKey: "test" });
    console.log("Client created");
} catch (e) {
    console.error("Error creating client", e);
}
