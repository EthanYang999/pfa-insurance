import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn/UI Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Custom Design Colors - 商务专业科技风
        'coach-blue': {
          primary: '#1E3A8A',   // Primary Blue
          secondary: '#3B82F6', // Secondary Blue
          gradient: '#1E40AF',  // For gradients
        },
        'coach-gold': {
          accent: '#F59E0B',    // Accent Gold
          light: '#FDE68A',     // Light Gold
          hover: '#D97706',     // Hover state
          active: '#B45309',    // Active state
        },
        // PFA Professional Brand Colors
        'pfa': {
          'royal-blue': '#0A1C3F',    // 主色 - 深海蓝/皇家蓝
          'navy-blue': '#1A2B4D',     // 主色变体
          'champagne-gold': '#C0A06C', // 辅色 - 哑光金/香槟金
          'accent-gold': '#D4AF37',   // 辅色变体 - 更亮的金色
          'light-gray': '#F8F8F8',    // 浅灰背景
          'dark-gray': '#333333',     // 深灰文字
          'white': '#FFFFFF',         // 纯白
        },
        'coach-gray': {
          dark: '#374151',      // Dark Gray - main text
          medium: '#6B7280',    // Medium Gray - secondary text
          light: '#F3F4F6',     // Light Gray - background
          disabled: '#D1D5DB',  // Disabled elements
          placeholder: '#9CA3AF', // Placeholder text
        },
        'coach-status': {
          success: '#10B981',   // Success state
          warning: '#F59E0B',   // Warning state
          error: '#EF4444',     // Error state
          info: '#3B82F6',      // Info state
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
