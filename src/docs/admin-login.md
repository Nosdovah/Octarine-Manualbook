# Admin Portal Login Guide

The **Octarine Admin Portal** is the centralized management gateway for authorized administrators, store managers, and fulfillment teams. It provides full control over catalog inventory, order processing, customer analytics, and marketing promotions.

---

## Interactive Admin Login Overview

Click on any of the pulsing indicator dots below to explore the login interface and understand each input field and action.

```interactive-map
admin-login-map
```

---

## Authentication Procedure

To sign in to the Octarine backoffice, follow the standard authentication workflow:

### Step 1: Navigate to the Admin Portal
- Open a modern, secure web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
- Navigate to the administrative login endpoint: **`https://octarine.co.id/admin/login`**.
- Verify that your connection is secured with an active SSL certificate (indicated by the lock icon in your browser's address bar).

### Step 2: Input Your Administrator Credentials

1. **Email Address Field**:
   - Click into the **Email** text box.
   - Enter your registered administrator or staff email address (e.g., `admin@octarine.co.id` or `staff.name@octarine.co.id`).
   - *Note: Ensure there are no accidental spaces before or after the email address.*

2. **Password Field**:
   - Click into the **Password** text box.
   - Enter your secret account password.
   - **Show/Hide Toggle**: Click the **Eye icon** on the right side of the password box to reveal the plaintext password and verify that you haven't made a typing mistake before submitting.

### Step 3: Submit and Access the Dashboard
- Click the **Sign in** button or press **`Enter`** on your keyboard.
- Once authenticated, the system will redirect you to the **Octarine Management Dashboard** (`/admin/dashboard`).

---

## Security & Credential Best Practices

> [!IMPORTANT]
> **Strict Confidentiality Required**
> - Administrative credentials provide high-privilege access to customer personal information and store financial data.
> - **Never** share passwords across team members or over unencrypted messaging platforms.
> - Always use a distinct, high-entropy password managed by an enterprise password manager.

> [!TIP]
> **Session Security**
> - For compliance and security reasons, administrator sessions automatically expire after 60 minutes of inactivity.
> - Always log out manually when stepping away from your workstation by clicking **Logout** in the dashboard profile menu.

---

## Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Invalid credentials"** | Incorrect email or password entered. | Double-check caps lock and click the eye icon to verify password spelling. |
| **"Too many failed attempts"** | Rate limiting activated after consecutive failed attempts. | Wait 5 minutes for the security cooldown or contact the Lead DevOps engineer. |
| **"Unauthorized access"** | Account lacks administrative permissions. | Ensure you are signing in with an account granted the `Store Admin` or `Manager` role. |
| **Session Expired** | Automatic timeout due to inactivity. | Refresh the page and re-enter your login credentials. |
