# AI Development Rules and Tech Stack

This document defines the core technology stack for the Apolo project and establishes clear rules for library usage to ensure consistency, maintainability, and adherence to the design system.

## 🛠️ Core Technology Stack (5-10 points)

1.  **Frontend Framework:** React (v18) with TypeScript.
2.  **Build Tool:** Vite.
3.  **Styling:** Tailwind CSS for all utility-first styling.
4.  **UI Components:** shadcn/ui (built on Radix UI primitives).
5.  **Routing:** React Router DOM.
6.  **Server State Management:** TanStack Query (React Query).
7.  **AI Integration:** Google Gemini API (`@google/generative-ai`).
8.  **Icons:** Lucide React.
9.  **Theming:** `next-themes` for Dark/Light mode switching.
10. **Notifications:** Sonner (for modern toasts).

## 📚 Library Usage Guidelines

To maintain project cohesion, please adhere to the following guidelines when implementing new features:

| Feature | Required Library | Usage Rules |
| :--- | :--- | :--- |
| **UI Components** | shadcn/ui (and underlying Radix UI) | Use components from `src/components/ui/` exclusively. If a component is missing, create a new one following the shadcn/ui/Radix pattern. **Do not introduce other component libraries.** |
| **Styling** | Tailwind CSS | Use Tailwind utility classes for all layout and design. Custom CSS should be minimal and defined only in `src/index.css` for global base styles or variables. |
| **Routing** | `react-router-dom` | Use this library for all application navigation and routing logic. |
| **Icons** | `lucide-react` | Use icons provided exclusively by the `lucide-react` package. |
| **Notifications (Toasts)** | `sonner` | Use the `Sonner` component for displaying user feedback messages (success, error, info). The standard `Toaster` component should be avoided for new user-facing notifications. |
| **Asynchronous Data Management** | `@tanstack/react-query` | Use for managing server state (caching, fetching, mutations). |
| **AI/Chat Logic** | `@google/generative-ai` | All AI communication logic must be encapsulated within `src/services/geminiService.ts`. |