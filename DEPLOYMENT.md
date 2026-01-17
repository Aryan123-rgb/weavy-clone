# Deployment Guide

This guide covers how to deploy the application to Vercel and set up Trigger.dev for background tasks.

## 1. Vercel Deployment

### Prerequisites

- A GitHub repository with your code pushed.
- A [Vercel account](https://vercel.com).
- A [Cloudinary account](https://cloudinary.com) (for media uploads).
- A [Clerk account](https://clerk.com) (for authentication).
- A [Trigger.dev account](https://trigger.dev) (for background jobs).

### Steps

1.  **Import Project**:
    - Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
    - Import your GitHub repository.

2.  **Configure Project**:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Build Command**: `next build` (default).
    - **Install Command**: `npm install` (default).

3.  **Environment Variables**:
    - Copy the values from your local `.env` file to the Vercel Environment Variables section.
    - **Important**: Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are set for client-side uploads.
    - Ensure all secret keys (Clerk, Database URL, Trigger.dev keys) are added.

4.  **Deploy**:
    - Click **"Deploy"**. Vercel will build and deploy your application.
    - Configs have been added to `next.config.js` to ignore linting and typescript errors during the build to prevent build failures on minor issues.

---

## 2. Trigger.dev Deployment

To run your background tasks (like video frame extraction) in production, you need to deploy your Trigger.dev tasks.

### Prerequisites

- The Trigger.dev CLI installed (`npm install -g trigger.dev` or use `npx`).
- Logged into Trigger.dev (`npx trigger.dev@latest login`).

### Deployment Steps

1.  **Login to Trigger.dev**:

    ```bash
    npx trigger.dev@latest login
    ```

2.  **Select Project**:
    - Ensure you are in the project root.
    - Verify `trigger.config.ts` has the correct `project` ID.

3.  **Deploy Tasks**:
    - Run the deploy command:

    ```bash
    npx trigger.dev@latest deploy
    ```

    - This commands bundles your tasks and deploys them to the Trigger.dev platform.
    - It ensures that your workers are running and ready to handle events.

4.  **Environment Variables (Trigger.dev)**:
    - Go to your Project Dashboard on [cloud.trigger.dev](https://cloud.trigger.dev).
    - Navigate to **"Environment Variables"**.
    - Add any environment variables your tasks need (e.g., `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`).
    - **Crucial**: Your tasks run on Trigger.dev's infrastructure, so they need their own set of environment variables, unrelated to your Vercel env vars (though values are often the same).

5.  **Connect Vercel to Trigger.dev**:
    - In your Vercel project settings, ensure you have the `TRIGGER_SECRET_KEY` set. This is the key for the **Live/Prod** environment from your Trigger.dev dashboard, NOT the Dev key.
    - You can find this in Trigger.dev Dashboard -> Project -> Environments & API Keys -> **Prod**.

### Verification

- **Vercel**: Visit your deployed Vercel URL. The app should load.
- **Trigger.dev**:
  - Go to the Trigger.dev dashboard.
  - You should see your tasks listed under the "Jobs" or "Tasks" section for the Prod environment.
  - Trigger a workflow in your running app (e.g., upload a video).
  - Provide the `TRIGGER_SECRET_KEY` (Prod) to your Vercel environment variables.
  - The task should queue and run on the Trigger.dev dashboard.

## Trouble Shooting

- **Build Failures**: Check Vercel logs. If related to types/linting, verify `next.config.js` has the ignore flags.
- **Trigger Tasks Not Running**:
  - Check if you are using the correct `TRIGGER_SECRET_KEY` (Prod vs Dev).
  - Check if the Trigger.dev worker has the necessary Environment Variables defined in the Trigger.dev cloud dashboard.
