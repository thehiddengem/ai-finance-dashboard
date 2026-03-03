# AI-Powered Split Finance Dashboard

A modern personal finance dashboard that tracks income, expenses, and savings for two people — with real-time aggregation and AI-generated insights.

Built as a product-style application to demonstrate data modeling, state management, visualization, and UX-focused front-end engineering.

---

## 🚀 Live Demo
(Deploy link goes here after Vercel)

---

## ✨ Features

### Split Budgeting Logic
- Track **Income, Expenses, and Savings**
- View totals for:
  - Person 1
  - Person 2
  - Combined household
- Automatic net calculation:
Net = Income - Expenses - Savings


### Interactive Visualizations
- Donut chart spending breakdown
- Toggle between:
- Together
- Person 1
- Person 2
- Real-time recalculation when editing values

### AI Insights Panel
- Generates a plain-English summary of spending patterns
- Identifies largest expense categories
- Flags high expense-to-income ratio

### Excel-Style Budget Table
- Editable numeric inputs
- Automatic section totals
- Income / Expense / Savings grouping
- Real-time net calculation
- LocalStorage persistence

---

## 🛠 Tech Stack

- **Next.js (App Router)**
- **React + TypeScript**
- **TailwindCSS**
- **Recharts**
- LocalStorage for persistence

---

## 📸 Screenshots

(Add screenshots here)

---

## 🧠 Engineering Highlights

- Modeled a normalized budget structure with per-person + household aggregation
- Implemented derived financial metrics (totals, ratios, net values)
- Built dynamic chart filtering logic based on view selection
- Structured UI to separate data input, analytics, and AI interpretation layers
- Designed for extensibility (monthly tracking, export, etc.)

---

## 🏃 Running Locally

```bash
npm install
npm run dev