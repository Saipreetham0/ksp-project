# 📦 All-in-One Project & Order Management Platform – PRD

## 🔧 Overview

This platform serves as a unified solution for managing project workflows, order processing, payments, and invoicing. Built using **Next.js** (frontend) and **Supabase** (backend/database), it integrates **Zoho Invoice API** for billing functionalities and replaces third-party tools like Asana or Zoho Books with custom modules.

---

## 🎯 Goals

- Centralize project and order lifecycle management
- Replace external tools like Zoho Invoice, Zoho Payments, and Asana
- Enable multi-role access (admin, team, finance, client)
- Integrate payment, invoice generation, and task tracking
- Improve visibility and accountability within the team

---

## 👥 User Roles

- **Admin**: Manage users, invoices, payments, orders, settings
- **Team Member**: View/Update project tasks, order status
- **Finance**: Access invoice/payment modules
- **Client**: View project status, order, and invoice history

---

## 🧩 Key Features

### 1. 🛍️ Orders Module
- Create & manage orders (internal and client-based)
- Assign team members
- Order status: Draft, Processing, Shipped, Delivered, Completed
- Document & media attachments (e.g., photos, PDFs)

### 2. 🧾 Invoice Module (via Zoho Invoice API)
- Auto-generate invoice for each order
- Allow manual or recurring invoice generation
- PDF download & email option
- Link payment status

### 3. 💳 Payment Module
- Connects with Zoho Payment APIs
- Record payment received (online/offline)
- Due date reminders & payment history tracking

### 4. 📋 Task/Project Management
- Assign tasks with due dates & priorities
- Task status: To-Do, In Progress, Done
- Integrated with orders/projects
- Team-wise dashboard view

### 5. 👤 User Management
- Role-based permissions
- Invite users via email
- Activity logging

### 6. 📊 Dashboard & Reports
- Orders summary
- Revenue/invoice analytics
- Task completion and progress
- Notifications center

---

## 🧱 Tech Stack

| Layer      | Tech                     |
|------------|--------------------------|
| Frontend   | Next.js                  |
| Backend    | Supabase (PostgreSQL, Auth, Realtime) |
| Payments   | Zoho Payment APIs        |
| Invoices   | Zoho Invoice APIs        |
| Deployment | Vercel / Railway / Render |

---

## 🔐 Security & Access Control

- Supabase Auth with role-based access
- Secure Zoho API token storage
- Audit logs and access history

---

## 🔄 API Integrations

- **Zoho Invoice**
  - Create, update, fetch invoices
  - Get invoice status and send reminders
- **Zoho Payments**
  - Record transactions
  - Fetch payment status
  - Refunds and receipts

---

## 🗓️ Milestones

| Week | Deliverable                                  |
|------|----------------------------------------------|
| 1    | Project setup, database schema, auth system  |
| 2    | Orders & Tasks module                        |
| 3    | Invoicing & Payments integrations            |
| 4    | Dashboard, reports, user roles               |
| 5    | Testing & Production Deployment              |

---

## 📌 Notes

- Supabase triggers will be used for real-time updates
- All modules are connected to support seamless operation flow
- Zoho API credentials will be managed using environment variables

---

## 📁 Folder Structure (Next.js)

```
/pages
  /orders
  /invoices
  /projects
  /auth
/components
/lib
/utils
/supabase
.env
```

---

## 🧪 Future Scope

- WhatsApp/email integration for status updates
- Role-based dashboard customization
- Expense & profit tracking module
- CRM integration

---

*Version 1.0 – Prepared for Baletix Innovation Pvt Ltd by Saipreetham*