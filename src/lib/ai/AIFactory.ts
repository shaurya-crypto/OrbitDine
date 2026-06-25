import { AIProvider } from "./AIProvider";
import { LocalAIProvider } from "@/lib/ai/LocalAIProvider";

// This factory pattern allows OrbitDine to easily swap in OpenAI, Gemini, 
// or Local Ollama models in the future without changing business logic.
export class AIFactory {
  static getProvider(): AIProvider {
    // In the future, this could read from process.env.AI_PROVIDER
    // return new OpenAIProvider();
    return new LocalAIProvider();
  }
}
