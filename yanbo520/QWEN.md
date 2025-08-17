# Qwen Code Context for `yanbo520`

## Project Overview

This is a Next.js 15 application named "yanbo-browser". It serves as a platform for browsing and creating Web3-based digital products, such as online courses, guides, and other digital assets. The application is built with modern web technologies including TypeScript, React 19, Tailwind CSS v4, and integrates with Supabase for backend services.

Key features include:
- Browsing a list of Web3 products with filtering/sorting capabilities.
- A product creation flow with AI-assisted content generation (mocked for the hackathon).
- User profiles with wallet-based identification, supporting both Supabase and localStorage as storage backends.
- Responsive design using Tailwind CSS.

The application is structured as a standard Next.js 15 App Router project.

## Technologies Used

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Frontend:** React 19, Tailwind CSS v4
- **Backend/Data:** Supabase (with localStorage fallback), `@supabase/supabase-js`
- **Styling:** Tailwind CSS, `next/font` for Geist font
- **Icons:** `lucide-react`
- **Utilities:** `clsx`, `class-variance-authority`
- **Linting:** ESLint with Next.js configuration
- **Build Tools:** TypeScript, PostCSS

## Building and Running

### Prerequisites

- Node.js (version not explicitly specified, but compatible with Next.js 15)
- npm, yarn, pnpm, or bun

### Development

1.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

1.  **Build the Application:**
    ```bash
    npm run build
    # or
    yarn build
    # or
    pnpm build
    # or
    bun build
    ```

2.  **Start the Production Server:**
    ```bash
    npm run start
    # or
    yarn start
    # or
    pnpm start
    # or
    bun start
    ```

### Linting

To check for linting errors:
```bash
npm run lint
# or
yarn lint
# or
pnpm lint
# or
bun lint
```

## Development Conventions

- **Architecture:** Follows the standard Next.js 15 App Router structure with `src/app` for pages, `src/components` for UI components, `src/services` for business logic, and `src/lib` for library integrations.
- **Data Management:** Uses a custom `apiService` for product data (currently mocked) and a `userService` for user profiles. The `userService` intelligently falls back to `localStorage` if Supabase is not configured, making it suitable for rapid development and deployment stages.
- **Styling:** Uses Tailwind CSS for styling components. Custom configurations can be found in `tailwind.config.ts` (not read here but implied by dependencies) and `postcss.config.mjs`.
- **Environment Variables:** Configuration for external services like Supabase is managed through environment variables, following the `NEXT_PUBLIC_` prefix convention for client-side access. A `.env.example` file is provided as a template.
- **Supabase Integration:** The application is designed to integrate with Supabase for user data storage. A detailed setup guide is provided in `SUPABASE_SETUP.md`. When Supabase is not configured, the app gracefully degrades to using `localStorage`.
- **AI Features:** AI content generation features (for product titles, descriptions, etc.) are planned but currently implemented with mock data in `apiService.ts`.