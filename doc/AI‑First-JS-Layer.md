# AI‑First JS Layer — Documentation

This meta-document consolidates the overview, architecture, API, and policies. Structure: Page 1 (Overview & Primitives), Page 2 (Runtime & Algorithms), Page 3 (Adaptive Capability Layer), Page 4 (Tooling Ecosystem), Page 5 (Policies & Specifications).

## Page 1 — Overview & Primitives

### Introduction and Goals
- **AI as a native primitive** in JS/TS: declarative decisions, on-the-fly learning, context awareness.
- **Goals:** Data-driven logic; client-first runtime (browser); compatibility with JS/TS; security and control; progressive enhancement.

### Core Primitives
- `ai.model(id, opts)` — Local (WebGPU/WASM) or external model adapter; manages inference/training.
- `ai.agent({ model, memory, tools })` — Binds model, memory, goals, and tools together.
- `ai.memory(kind, opts)` — `vector | episodic | session | long-term`.
- `ai.observe(event, handler)` — Subscribes to events, enabling learning from actions.
- `ai.learn(data, opts)` — Adaptation mechanism (RL/feedback/adapter tuning).
- `ai.select({ variants, context, goal })` — Declarative strategy selection.
- `ai.ref(semanticID)` — Semantic reference protected from direct binding (capability-proxy).
- `ai.capability(id, opts)` — Access right object (TTL, scope) instead of a direct reference.

```js
const agent = ai.agent({ model: "local-llm", memory: "session" });
const cart = ai.ref("checkout.cart"); // Semantic ID
ai.observe("scroll_speed", v => agent.learn(v));
const layout = await ai.select({ variants: { compact, detailed } });
layout.result();
```

### Layer Architecture
- **Flow:** App/Browser → AI‑first JS API → Model Adapters → Runtime (WebGPU/WASM/Node) → Hardware.
- **Progressive Enhancement:** Basic features work everywhere; extended capabilities enabled with WebGPU/WASM.
- **Fallback:** Offloads heavy computation to server/edge when needed.

### Language Capabilities
- **Decision-driven logic:** Probabilistic logic (`confidence`), context as a first-class object.
- **Self-adaptation:** Hot-swapping algorithms, runtime A/B tests, personalization.
- **Memory & Feedback:** Memory as a language primitive; feedback directly influences learning; explainability and tracing.

<div style="page-break-before: always;"></div>

## Page 2 — Runtime & Algorithms

### Runtime: Web Worker + WebGPU
- **Main Thread:** Calls `await ai.select(...)`.
- **Proxy Layer:** Proxies the call to a Worker via `postMessage`.
- **Worker:** Retrieves context (IndexedDB/Vector Store), loads quantized weights (OPFS), executes Compute (WebGPU), and periodically performs experience replay and adaptation.
- **Main Thread:** Receives the result and executes the callback.

### Fuzzy Decision Router (`ai.select`)
- **Mechanism:** Context embedding → Comparison with history in `ai.memory` → Lightweight RL.
- **Output:** Explainability via `confidence` + `reasoning`.

```ts
type Decision<T> = { result: T; confidence: number; reasoning?: string };

const strategy: Decision<() => void> = await ai.select({
  variants: { compact: renderCompact, detailed: renderDetailed },
  context: { fps: currentFPS, battery: await navigator.getBattery() },
  goal: "maximize_user_satisfaction"
});

if (validateAction(strategy.result.name, ["compact","detailed"])) {
  strategy.result();
}
console.log("Confidence:", strategy.confidence, "Reasoning:", strategy.reasoning);
```

### Learning: `ai.learn` & `ai.observe`
- **Model:** Base model is read-only (OPFS/cache) + Adaptation Layer (LoRA/Adapter).
- **Log:** IndexedDB stores `[timestamp, state_embedding, action, result, feedback]`.
- **Process:** Background Worker periodically runs replay to update adaptation weights.

### Typing & Security
- **Validation:** Whitelist actions via `validateAction(name, list)`.
- **Protection:** Prompt-injection defenses, IndexedDB encryption (`SubtleCrypto`), tab context isolation.

### Cold Start & Resource Management
- **Hydration:** Uses heuristics until the model loads, then smoothly transitions to AI logic.
- **Singleton Resource Manager:** Manages VRAM/CPU/KV-cache quotas and prioritizes tasks.

<div style="page-break-before: always;"></div>

## Page 3 — Adaptive Capability Layer (Security)

### 1. Concept: Semantics over Structure
This module removes rigid dependencies on variable names, global objects, and stable DOM keys. Instead of fragile references, it uses **Semantic IDs** and **Capability Access**.

- **Problem:** Traditional JS relies on stable references, making it vulnerable to DOM injections and structure parsing.
- **Solution:** Developers use a persistent Semantic ID (`"user.profile"`), while the Runtime resolves it to a temporary, rotating internal key.

### 2. Security Primitives
#### `ai.ref(semanticID)`
Returns a **proxy object**, not a direct reference.
```ts
const userProfile = ai.ref("user.profile"); 
// "user.profile" is the eternal Semantic ID.
// Internally: Resolves to a capability, checks context and TTL.
userProfile.get(); // Works.
// Attempting to "steal" the reference from console or XSS returns a "dead" proxy if context is invalid.
```

#### `ai.capability(permission, options)`
An access right object. It is a permission, not a reference.
```ts
const canUpdate = ai.capability("user.profile.update", { 
  ttl: "5m", 
  scope: "session" 
});
// Capability-based security: cannot be serialized or forged.
```

### 3. Rotation & Threat Model
- **Key Rotation:** Runtime periodically changes internal bindings. The proxy (`ai.ref`) updates transparently for legal code, but "stale" references saved by malicious scripts expire.
- **Threat Model:**
  - **Addresses:** DOM injections, XSS payloads, runtime inspection, structure parsing.
  - **Does Not Promise:** Protection against full browser compromise (root) or malicious extensions with full access.
- **Principles:** Capability over Reference, Temporal Instability, Local Trust.

### 4. Execution Modes (Dev vs Prod)
Clear separation to maintain DX (Developer Experience).
- **Dev / Debug Mode:** Stable keys, rotation disabled, full introspection (`ai.debug.explain(ref)`).
- **Production Mode:** Dynamic bindings, strict TTL, limited introspection.
- **Invariant:** API and TS types never change. Only internal binding changes.

<div style="page-break-before: always;"></div>

## Page 4 — Tooling Ecosystem (Static Analysis)

### `afjl-lint` (ESLint Plugin)
An early warning system for the dynamic AFJL environment. Since the runtime relies on `ai.ref` and adaptability, static analysis is critical to prevent conflicts.

### Key Checks
1.  **Context Safety:** Warning when using `ai.ref`/`ai.capability` outside of an agent context.
2.  **Internal Access:** Error when attempting direct access to internal keys (`_internal_id`) instead of `ai.ref`.
3.  **Render Loop Safety:** Warning when calling `ai.select` (heavy operation) inside a synchronous render loop (React render, Vue setup without watch).
    - *Advice:* Wrap in `useEffect` or an event handler.
4.  **Conflict Detection:** Detection of memory namespace collisions between different agents.

### Benefits
- **Painless Security:** Developers see potential issues (race conditions, UI blocking) at the coding stage.
- **Stable DX:** The linter teaches correct usage of capability patterns, lowering the entry barrier.

<div style="page-break-before: always;"></div>

## Page 5 — Policies & Specifications

### 1. Browser & Platform Support
- **Targets:** Chrome, Edge, Firefox, Safari (desktop + mobile).
- **Min Versions:** WebGPU (Chrome/Edge ≥113; Safari ≥16.4; iOS ≥17; Firefox — Nightly/flag), WASM/IndexedDB — modern versions.
- **Priorities:** Desktop GPU-first; Mobile CPU/WASM-first; aggressive power saving.
- **Progressive Enhancement:** Graceful degradation for `ai.select`/`ai.observe`/IndexedDB; Local LLM/OPFS require min versions.

### 2. Models & Adapters
- **Local LLM:** 1–3B parameters (Apache-2.0/MIT), small embeddings (e5/BGE).
- **Quantization:** 4-bit (speed) / 8-bit (balance).
- **Adaptation:** Client-side LoRA/Adapter; Server/Edge: 7–8B (Mistral/Llama-compat), vLLM/llama.cpp.

### 3. Memory & Experience Replay
- **IndexedDB Stores:** `episodes`, `embeddings`, `policies`, `meta`; Log format `[timestamp, state_embedding, action, result, feedback]`; TTL/compaction; Optional sync (opt-in).

### 4. OPFS (Origin Private File System)
- **Structure:** Directory layout, lazy/prefetch/chunked-load; Semver+checksum; Fallback to IndexedDB if space is low.

### 5. Fallback Policy
- **Triggers:** No GPU/WebGPU, SLO violation, VRAM errors.
- **SLO:** `ai.select` ≤50–100ms local; Edge ≤200–300ms; `confidence` thresholds.

### 6. Security & Isolation
- **Adaptive Capability Layer:** Uses `ai.ref` to protect against direct references; internal key rotation in Production.
- **Encryption:** AES-GCM 256 for IndexedDB, per-origin/per-store keys; storage wrapped-key.
- **Sandbox:** `ai.agent` and `tools` run in Worker; strict interfaces.
- **Protection:** Prompt-injection normalization, XSS capability proxies, `tabId` isolation.

### 7. Explainability
- **JSON Format:** `{confidence, justification, context_snapshot, selected_variant, features}`.
- **Storage:** Keep N=10k decisions, TTL 14 days; Deterministic replay.

### 8. Tools
- **Interface:** `{name, version, capabilities, call}`; Built-in `search/filesystem/browser`; Register 3rd party via `ai.tools.register`.

### 9. Resource Manager
- **Policy:** Fair scheduling; VRAM/CPU quotas; Preemptive/Cooperative multitasking; Monitoring & limits.

### 10. Performance
- **Budgets:** `ai.select` ≤50–100ms; Inference ≤30–60ms; Training ≤10–20ms; Read ≤5–10ms; Metrics & throttling/batching.

### 11. Types (.d.ts)
- **Namespace:** Global + ESM import; Bundler compatibility; Separate `@ai-first/js-types` package; Generics for `select/memory/learn`.

### 12. Testing
- **Strategy:** Unit mocks; Integration (Worker/WebGPU/OPFS/IndexedDB); Load testing; Determinism/Replay.

### 13. `ai.observe` Events
- **Standard:** `click`, `scroll`, `input`, `visibilitychange`, `fps`, `battery`, `custom:*`; Payload schema; `unsubscribe` API.

### 14. Constraints
- **Format:** JSON/Config & Code-level validators; Enforcement before execution.

### 15. Telemetry & Privacy
- **Policy:** Anonymous embeddings/metrics; Opt-out by default; Anonymization/Hashing.

### 16. Errors & Degradation
- **Strategy:** Retry/Fallback/Degrade gracefully; Logging levels; UI status indication.

<div style="page-break-before: always;"></div>

## Distribution & Ecosystem

AFJL is distributed through standard JavaScript ecosystems to ensure maximum accessibility and easy integration into existing projects.

### 1. npm (Primary Channel)
AFJL is published on npm as the primary distribution method.

**Recommended Structure:**
*   npm package: `afjl`
*   core runtime: `afjl`
*   Additional modules:
    *   `@afjl/runtime`
    *   `@afjl/agent`
    *   `@afjl/memory`
    *   `@afjl/lint`
    *   `@afjl/react` (optional)
    *   `@afjl/node` (optional)

**Reasons:**
*   npm is the de facto standard for JS/TS.
*   Easy integration with bundlers (Vite, Webpack, esbuild).
*   Tree-shaking support.
*   Semantic versioning (semver) support.

### 2. CDN (unpkg / jsDelivr / esm.sh)
AFJL should be available via CDN for:
*   Rapid prototyping.
*   Build-less experiments.
*   Demos and playgrounds.

**Examples:**
*   `unpkg.com/afjl`
*   `cdn.jsdelivr.net/npm/afjl`
*   `esm.sh/afjl`

**CDN Version:**
*   ESM only.
*   No heavy models included.
*   Runtime loads models dynamically.

### 3. GitHub (Source & Documentation)
GitHub serves as:
*   Primary source code repository.
*   Hub for RFCs, issues, and roadmap.
*   Entry point for contributors.

**Recommended Repository Structure:**
*   `packages/`
    *   `core`
    *   `runtime`
    *   `memory`
    *   `agent`
    *   `lint`
*   `docs/`
    *   `architecture.md`
    *   `security.md`
    *   `faq.md`
*   `examples/`
*   `playground/`

### 4. Node.js Ecosystem
Additional package: `@afjl/node`

**Purpose:**
*   SSR (Server-Side Rendering).
*   Testing.
*   Simulating `ai.select` in CI.
*   Edge/runtime adapters.

**Node Version:**
*   No WebGPU by default.
*   WASM / CPU fallback.
*   Deterministic mode.

### 5. Bun / Deno
AFJL must be compatible with:
*   Bun (via npm).
*   Deno (via npm: true or separate entry).

**Recommendations:**
*   Pure ESM.
*   No Node-specific API in core.
*   Adapters extracted separately.

### 6. Versioning & Releases
*   **semver**.
*   **v0.x**: Active development.
*   **v1.0**: Stabilization of API primitives.
*   **Changelog**: Mandatory.
*   **Breaking changes**: Documented separately.

### 7. License
**Recommended:** MIT or Apache-2.0

**Reasons:**
*   Open-source compatibility.
*   Commercial usage allowed.
*   Ecosystem trust.
