# D-ID Agents SDK Demo - Vite & Vanilla JavaScript

This demo showcases the core features of the [@d-id/client-sdk](https://www.npmjs.com/package/@d-id/client-sdk) with Vite and vanilla JavaScript. It’s meant as a starting point for your own customizations, demonstrating the SDK’s basic functionality in a simple, approachable way — not as a production-ready application.

## Features
- Real-time video and audio streaming with D-ID Agents
- Chat and Speak modes (Chat: D-ID’s LLM responses, Speak: repeats textbox input for custom implementations)
- **New:** Fluent streaming + response interruption (Premium+ Agents only)
- Speech-to-text example using the open-source WebSpeech API
- Modern UI with responsive design

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/de-id/agents-sdk-demo.git
cd agents-sdk-demo-main
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Project Structure
- `index.html` — Main HTML file
- `main.js` — Application logic and D-ID SDK integration
- `webSpeechAPI.js` — WebSpeech API Speech-to-text support
- `style.css` — Styling
- `package.json` — Project configuration

### 4. Scripts
The `package.json` includes the following scripts:
```json
"scripts": {
  "dev": "vite --port 3000",
  "build": "vite build",
  "preview": "vite preview"
}
```

- `npm run dev` — Start the development server on [http://localhost:3000](http://localhost:3000)
- `npm run build` — Build for production
- `npm run preview` — Preview the production build

### 5. Configure Your Agent
1. **Fetch your `data-client-key` and `data-agent-id`** from the D-ID Studio or API (see the [Agents SDK Overview](https://docs.d-id.com/reference/agents-sdk-overview)).

2. **Paste them at the top of `main.js`:**
   ```js
   let auth = { type: 'key', clientKey: "<your-client-key>" };
   let agentId = "<your-agent-id>";
   ```

### 6. Run the App
```sh
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes
- Requires Node.js v20.19.0 or v22+
- For more information, see the [D-ID Agents SDK documentation](https://docs.d-id.com/reference/agents-sdk-overview).

---

© D-ID. MIT License.
