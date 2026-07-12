# ProjectPilot

## Project Structure

```
.
├── index.html
├── README.md
├── images/
│   ├── logo.png
│   ├── favicon.ico
│   └── og-image.jpg
└── server/
	├── package.json
	└── server.js
```

## Image Folder Structure

- `images/logo.png`
- `images/favicon.ico`
- `images/og-image.jpg`

## Replacing the Placeholder Logo

The current `images/logo.png` file is a placeholder. Replace it with your final logo artwork, keeping the same filename so the HTML continues to work without changes.

## Telegram Bot Relay Setup

1. Install dependencies inside the `server` folder with `npm install`.
2. Set `BOT_TOKEN` in your environment.
3. Set `BOT_CHAT_ID` to the Telegram chat ID where the bot should relay messages.
4. Run the backend with `npm start` from the `server` folder.

The front end posts messages to `/send-message` and polls `/get-updates` every 2 seconds.

## Customizing Colors and Text

- Update the CSS variables in `index.html` inside the `:root` block to change the color palette.
- Edit the headline, section text, and footer copy directly in `index.html` to customize the messaging.
- Keep the existing layout classes if you want to preserve the responsive structure.

## Asset Notes

- `images/favicon.ico` is a placeholder favicon for browser tabs.
- `images/og-image.jpg` is a placeholder social sharing image.
- You can replace both files with finalized artwork without changing any code.

---

## 🚀 Quick Start Commands (To Include in README)

```bash
# 1. Navigate to server folder
cd server

# 2. Install dependencies
npm install express node-telegram-bot-api cors dotenv

# 3. Create .env file with your bot token
echo "BOT_TOKEN=your_actual_token_here" > .env

# 4. Start the server
node server.js

# 5. Open index.html in browser
# The demo will connect to your real bot!
```

## 🌐 Hosting on GitHub Pages

Since GitHub Pages is a static hosting platform, the Node.js Express server cannot run on GitHub Pages directly. However, the ProjectPilot frontend has been built to support this gracefully:
- **Demo Mode**: If the backend server is unreachable (which is the case out of the box when opening the page on GitHub Pages), the chat widget will automatically fall back to **Demo Mode (Local simulation)**. The chat will run fully interactively client-side!
- **Custom Backend URL**: If you deploy your backend server (e.g. on Render, Fly.io, or use an n8n webhook directly), you can click on the connection status label (e.g. "Demo Mode") inside the chat header. This will prompt you to enter your deployed server URL. The setting will be saved in your browser's local storage.

### Deployment Instructions

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare ProjectPilot for GitHub Pages deployment"
   git remote add origin https://github.com/<your-username>/ProjectPilot.git
   git branch -M main
   git push -u origin main
   ```
2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** > **Pages** (in the sidebar).
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or `master`) and `/ (root)` folder.
   - Click **Save**.
   - After a minute, your page will be live at `https://<your-username>.github.io/ProjectPilot/`!
