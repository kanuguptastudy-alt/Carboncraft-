# 🚀 Deploying CarbonCraft to Vercel

CarbonCraft is a full-stack application leveraging a compiled **React (Vite) Frontend** alongside an **Express.js API Backend** for server-side AI execution.

To support seamless serverless deployment, we have pre-configured a `vercel.json` routing matrix at the root of the repository.

---

## 📌 Manual Deployment Steps (Vercel CLI or Dashboard)

### 1. Download or Export Your Code
- In **Google AI Studio**, click the **Settings** menu.
- Choose **Export to GitHub** (recommended) or download the **ZIP** file of your project.

### 2. Connect to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** ➔ **Project**.
2. Select your imported GitHub repository.
3. Keep the default framework settings (**Vite** configuration is detected).

### 3. Add Environment Variables
Before building, add your API key in Vercel to activate the **AI Climate Coach**:
- Go to **Project Settings** ➔ **Environment Variables**.
- Add the following key:
  - **Key:** `GEMINI_API_KEY`
  - **Value:** *[Your Google GenAI API Key]*

### 4. Build and Launch
- Click **Deploy**. Vercel will build the frontend assets, bundle the Express-based endpoints under its Serverless runtime, and host your completed production platform.
