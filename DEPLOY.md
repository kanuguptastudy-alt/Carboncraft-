# 🚀 Deploying CarbonCraft to Vercel or Netlify

CarbonCraft is a full-stack application leveraging a compiled **React (Vite) Frontend** alongside fully compatible serverless endpoints to enable server-side AI execution on both **Vercel** and **Netlify**.

We have pre-configured native configurations:
- `vercel.json` routing matrix at the root for **Vercel** deployments.
- `netlify.toml` and recursive `netlify/functions/api.ts` serverless handler for **Netlify** deployments.

---

## 📌 Option A: Deploying to Netlify (Highly Recommended)

### 1. Connect to Netlify
1. Go to your [Netlify Dashboard](https://app.netlify.com) and click **Add new site** ➔ **Import an existing project**.
2. Connect your GitHub account and select your CarbonCraft repository.
3. The Netlify build settings will automatically read the `netlify.toml` rules:
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`

### 2. Add Environment Variables (CRITICAL for AI Coach)
To activate your AI Climate Coach and Action Blueprint:
1. Inside the Netlify dashboard for your site, go to **Site configuration** (or Site Settings) ➔ **Environment variables**.
2. Click **Add a variable** ➔ **Add single variable**.
3. Create the following key:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** *[Your Google GenAI API Key]*
4. Click **Create** or **Save**.

### 3. Trigger a Redeploy
- If you had already deployed, go to the **Deploys** tab, click **Trigger deploy** ➔ **Deploy site**.
- Once deployed, your AI coach will connect successfully to its serverless neural cores!

---

## 📌 Option B: Deploying to Vercel

## 📌 Manual Deployment Steps (Vercel CLI or Dashboard)

### 1. Download or Export Your Code
- In **Google AI Studio**, click the **Settings** menu.
- Choose **Export to GitHub** (recommended) or download the **ZIP** file of your project.

### 2. Connect to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** ➔ **Project**.
2. Select your imported GitHub repository.
3. **CRITICAL STEP (To avoid "No Next.js version detected" error):**
   - Vercel might mistakenly guess **Next.js** as your framework.
   - Under **Framework Preset**, change it from **Next.js** to **Vite** (or **Other**).
   - If your deployment already failed with a Next.js error, go to **Settings** ➔ **General** ➔ **Framework Preset**, select **Vite**, and click **Save**. Then, redeploy the latest commit!

### 3. Add Environment Variables
Before building, add your API key in Vercel to activate the **AI Climate Coach**:
- Go to **Project Settings** ➔ **Environment Variables**.
- Add the following key:
  - **Key:** `GEMINI_API_KEY`
  - **Value:** *[Your Google GenAI API Key]*

### 4. Build and Launch
- Click **Deploy**. Vercel will build the frontend assets, bundle the Express-based endpoints under its Serverless runtime, and host your completed production platform.
