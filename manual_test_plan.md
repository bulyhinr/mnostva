# Manual Test Plan: Pending Order Payment

## Objective
Verify that users can successfully re-initiate and complete payments for "Pending" orders from their profile page.

## Prerequisites
1.  **User Account**: You need a registered user account.
2.  **Pending Order**: You need an order in the 'pending' state.
    *   *Tip*: You can create one by starting the checkout process but closing the window/tab before completing payment (if the system creates the order early).
    *   *Alternative*: Manually set an order status to 'pending' in the database if possible, or use the API.

## Test Cases

### 1. View Pending Order
*   **Action**: Log in and navigate to the **Profile Page** (`/profile`).
*   **Action**: Switch to the "Order History" or Dashboard tab.
*   **Expected Result**: You should see a list of orders. Any order with status 'pending' should display a **"Pay Now 💳"** button next to it.
*   **Expected Result**: The 'pending' status badge should be visible.

### 2. Initiate Payment
*   **Action**: Click the **"Pay Now 💳"** button for a pending order.
*   **Expected Result**:
    *   Toast notification "Fetching payment..." appears.
    *   You are redirected to the **Checkout Page** (`/checkout`).
    *   The Checkout Page should immediately show **Step 3: Payment**.
    *   The **"Total to Pay"** should match the pending order's total.
    *   The **"Order Summary"** should show "Pending Order Payment" (or items if logic allows, currently shows generic pending text for existing orders).
    *   The Stripe Payment Element (card input) should load.

### 3. Complete Payment
*   **Action**: Enter valid card details (e.g., Stripe test card `4242...`).
*   **Action**: Click "Pay Now".
*   **Expected Result**:
    *   The payment processes successfully.
    *   You are advanced to **Step 4: Success** ("Magic Delivered!").
    *   A confirmation message is displayed.

### 4. Verify Status Update
*   **Action**: Click **"My Assets 📦"** to return to the Profile Page.
*   **Expected Result**:
    *   The order status should now be **'paid'**.
    *   The "Pay Now" button should **not** be visible.
    *   The items from the order should appear in the **"My Assets"** tab.

### 5. Start Payment then Cancel/Back
*   **Action**: Click **"Pay Now"** on a pending order.
*   **Action**: On the Checkout Page, click user's browser **Back** button or the provided **"Back"** button in the Stripe form (if available/implemented).
*   **Expected Result**: You should be returned to the **Profile Page** (or previous history state), not the Marketplace (if using the new back logic).

### 6. Empty Cart Handling
*   **Action**: Ensure your shopping cart is **empty**.
*   **Action**: Click **"Pay Now"** for a pending order.
*   **Expected Result**: The checkout flow works normally. You should NOT be redirected back to the shop due to an empty cart.

## Troubleshooting
*   If "Pay Now" logic triggers an error, check the browser console for logs.
*   Verify backend logs for `/orders/:id/payment` endpoint access.
*   Ensure Stripe keys are correctly loaded.
