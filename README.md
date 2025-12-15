# FIBO Creative Studio

A structured prompt-based image generation playground built with React, TypeScript, and Supabase. This application provides an intuitive interface for creating professional images using Fal.ai's FIBO API through a structured prompt system.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Supabase account** - [Sign up for free](https://supabase.com)
- **Fal.ai account** - [Get your API key](https://fal.ai)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd fibo-creative-studio-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # Frontend environment variables (required)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_public_key
   ```
   
4. **Set up Supabase**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the database migrations located in `supabase/migrations/`:
     ```bash
     # Using Supabase CLI (recommended)
     supabase db push
     
     # Or manually run each migration file in order through the Supabase dashboard SQL editor
     ```
   
   - Set up the edge function environment variable:
     - In your Supabase dashboard, go to **Project Settings** → **Edge Functions** → **Secrets**
     - Add a secret named `FAL_KEY` with your Fal.ai API key

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:8080`

## 📋 Environment Variables

### Frontend (`.env` file)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anonymous/public key | Supabase Dashboard → Project Settings → API → `anon` `public` key |

### Backend (Supabase Edge Function Secrets)

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `FAL_KEY` | Your Fal.ai API key for image generation | [Fal.ai Dashboard](https://fal.ai/dashboard) → API Keys |

**Security Note:** The `FAL_KEY` is stored as a Supabase secret and never exposed to the frontend. The edge function reads it server-side only.

## 🏗️ Project Structure

```
fibo-creative-studio-main/
├── src/
│   ├── components/
│   │   ├── editor/          # Main editor components
│   │   │   ├── ControlPanel.tsx      # Prompt input controls
│   │   │   ├── PreviewPanel.tsx       # Image preview and generation
│   │   │   └── HistorySidebar.tsx     # Generated images history
│   │   └── ui/               # shadcn-ui components
│   ├── pages/
│   │   ├── Index.tsx        # Main playground page
│   │   └── ImageDetail.tsx  # Image detail view
│   ├── integrations/
│   │   └── supabase/        # Supabase client configuration
│   └── types/
│       └── prompt.ts        # TypeScript types for prompts
├── supabase/
│   ├── functions/
│   │   └── generate-image/  # Edge function for image generation
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## 🎨 What This Application Does

### Core Functionality

**FIBO Creative Studio** is a structured image generation tool that allows users to create professional images through a guided, form-based interface rather than free-form text prompts.

### Key Features

1. **Structured Prompt Builder**
   - **Short Description**: Main subject/scene description
   - **Objects**: List of objects to include in the image
   - **Camera Settings**: Angle (eye level, bird's eye, etc.) and view (close-up, medium shot, etc.)
   - **Lighting**: Type (natural, studio, etc.) and direction (front, side, etc.)
   - **Style Medium**: Photograph, illustration, etc.

2. **Image Generation**
   - Generate images from scratch using structured prompts
   - Refine existing images with additional text refinements
   - Control generation parameters:
     - **Guidance Scale** (3-10): Controls how closely the model follows the prompt
     - **Negative Prompt**: What to avoid in the image
     - **Seed**: For reproducible results

3. **Image History**
   - Automatically saves all generated images to Supabase
   - Browse and view previous generations
   - View detailed prompt JSON for each image
   - Copy prompt data for reuse

4. **Security & Rate Limiting**
   - JWT authentication required for image generation
   - Rate limiting (10 requests per hour per IP)
   - Input validation using Zod schemas
   - Secure API key handling (never exposed to frontend)

### How It Works

1. **User Input**: User fills out the structured prompt form with description, objects, camera, lighting, and style settings.

2. **Prompt Processing**: The frontend sends the structured prompt to a Supabase Edge Function (`generate-image`).

3. **Edge Function**: 
   - Validates input using Zod schemas
   - Checks rate limits
   - Transforms the structured prompt into FIBO API format
   - Calls Fal.ai's FIBO API with the formatted prompt
   - Returns the generated image URL

4. **Image Storage**: Generated images are saved to Supabase database with full prompt metadata for history and reproducibility.

5. **Display**: The generated image is shown in the preview panel, and users can refine it or generate new variations.

## 🛠️ Available Scripts

- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## 🔧 Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Image Generation**: Fal.ai FIBO API
- **Validation**: Zod
- **Routing**: React Router
- **State Management**: React Query (TanStack Query)

## 🔒 Security Features

- ✅ No API keys exposed in codebase
- ✅ Environment variables for all sensitive data
- ✅ JWT authentication required for edge functions
- ✅ Rate limiting on image generation
- ✅ Input validation and sanitization
- ✅ CORS properly configured
- ✅ Error messages don't leak internal details

## 📝 Database Schema

The application uses Supabase PostgreSQL with the following main table:

- **`generated_images`**: Stores generated images with prompt metadata, refinement text, negative prompts, guidance scale, seed, and timestamps

A public view (`generated_images_public`) is used for displaying images without exposing sensitive fields like client IP addresses.

## 🚢 Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:
- **Vercel**: Connect your GitHub repo and set environment variables
- **Netlify**: Connect your GitHub repo and set environment variables
- **Supabase Hosting**: Use Supabase's built-in hosting

### Backend Deployment

The Supabase edge function is automatically deployed when you push to your Supabase project:

```bash
supabase functions deploy generate-image
```

Make sure to set the `FAL_KEY` secret in your Supabase project settings before deploying.

## 🆘 Troubleshooting

### "Image generation service unavailable"
- Check that `FAL_KEY` is set in Supabase Edge Function secrets
- Verify your Fal.ai API key is valid and has credits

### "Failed to load image" or Supabase connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set correctly
- Check that your Supabase project is active
- Ensure database migrations have been run

### Port 8080 already in use
- Change the port in `vite.config.ts` or stop the process using port 8080

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Fal.ai Documentation](https://fal.ai/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
