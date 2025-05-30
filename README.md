### 1. Create a New Next.js Project

npx create-next-app@latest weather-dashboard --typescript --tailwind --eslint --app --src-dir --import-alias
cd weather-dashboard

### 2. Install Required Dependencies

npm install date-fns react-day-picker recharts lucide-react class-variance-authority clsx tailwind-merge

### 3. Install and Configure shadcn/ui

npx shadcn@latest init

Select the following options:

- Style: Default
- Base color: Slate
- CSS variables: Yes


### 4. Add shadcn/ui Components

npx shadcn@latest add button card input label popover select tabs alert table calendar badge
npm install next-themes

### 5. Update package.json and reinstall

"dependencies": {
  "date-fns": "^3.6.0",
  "react-day-picker": "^8.10.1",
  "next-themes": "latest"
}

Then run: 

npm install

### 6. Project Structure

Create the following files in your project:

weather-dashboard/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (auto-generated by shadcn)
│   ├── weather-chart.tsx
│   ├── weather-table.tsx
│   ├── weather-stats.tsx
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts
└── README.md

### 7. Run the Development Server

npm run dev
