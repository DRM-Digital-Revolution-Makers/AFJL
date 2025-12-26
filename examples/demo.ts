import { ai } from '../src';

async function main() {
  console.log("=== AI-First JS Layer Demo ===");

  // 1. Semantic Selection
  console.log("\n1. Testing ai.select()...");
  const decision = await ai.select({
    variants: {
      "opt1": "Use local cache",
      "opt2": "Fetch from network",
      "opt3": "Ask user"
    },
    goal: "minimize latency", // Should favor "Use local cache" if heuristic works well (but random is random)
    context: { networkSpeed: "slow" }
  });
  console.log("Decision:", decision);

  // 2. Memory
  console.log("\n2. Testing ai.memory()...");
  const sessionMem = ai.memory("session");
  await sessionMem.add({ userAction: "clicked_button", timestamp: Date.now() });
  const items = await sessionMem.query({});
  console.log("Memory items:", items);

  // 3. Security / References
  console.log("\n3. Testing ai.ref()...");
  const secretRef = ai.ref<string>("user_api_key");
  secretRef.set("sk-123456789");
  console.log("Ref set. Trying to read:", secretRef.get());

  // 4. Capabilities
  console.log("\n4. Testing ai.capabilities()...");
  console.log("System Capabilities:", ai.capabilities());

  console.log("\n=== Demo Completed ===");
}

main().catch(console.error);
