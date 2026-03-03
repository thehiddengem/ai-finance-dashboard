# AI-Powered Split Finance Dashboard

A modern personal finance dashboard that tracks income, expenses, and savings for two people — with real-time aggregation and AI-generated insights.

Built as a product-style application to demonstrate scalable data modeling, derived-state computation, interactive visualization, and UX-focused front-end engineering. 

---

## 🚀 Live Demo
👉 https://ai-finance-dashboard-bvcze4nae-thehiddengems-projects.vercel.app

---

## ✨ Features

### Split Budgeting Logic
- Track **Income, Expenses, and Savings**
- View totals for:
  - Person 1
  - Person 2
  - Combined household
- Automatic net calculation:
  - Net = Income - Expenses - Savings


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
- **Serverless API Route**
- **LocalStorage for persistence**

---

## 📸 Screenshots

<img width="2895" height="1534" alt="image" src="https://github.com/user-attachments/assets/cef4361c-b06a-42eb-bbb5-c5d810d0ffb1" />
<img width="2878" height="1633" alt="image" src="https://github.com/user-attachments/assets/e5713b92-67c7-48f6-8c89-b728226f1a39" />
<img width="2903" height="728" alt="image" src="https://github.com/user-attachments/assets/2a3cd372-9858-4a01-8020-e0d22c4bc2e8" />




---

## 🧠 Engineering Highlights

- Designed a normalized budget data model supporting per-person and shared categories
- Implemented derived financial metrics (totals, ratios, net values)
- Built dynamic chart filtering logic driven by state
- Separated concerns between:
    - Data layer
    - Analytics layer
    - AI interpretation layer
- Structured for extensibility (monthly tracking, export, scenario simulation)



---

## 🏃 Running Locally

```bash
npm install
npm run dev
