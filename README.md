# 🧾 Automated Invoice & Receipt Capture System (Hospitality Operations)

A "zero-friction" automation designed specifically for the restaurant and hospitality industry. This project eliminates administrative bottlenecks for **the team members receiving deliveries** by processing physical receipts and invoices for any category (food, alcohol, beverages, gas, or operational supplies) using AI, natively integrated into the Google Workspace ecosystem.

## 🏗️ System Architecture
1. **Frontend (Zero Friction):** Google Forms (Mobile shortcut for the person receiving the delivery).
2. **Storage:** Google Drive (Automatic image organization).
3. **Brain (Processing):** Google Apps Script + Gemini 2.5 Flash API.
4. **Database (Audit & Control):** Google Sheets (Financial structuring, cost categorization, and validation links).

## 🚀 How It Works
1. **The person receiving the delivery** takes a photo of the invoice upon receiving the goods and uploads it via a simple Google Form.
2. An `onFormSubmit` trigger executes the script, converts the image to Base64, and sends it to the Gemini 2.5 Flash API.
3. The multimodal OCR model analyzes the image and extracts a structured JSON object containing: `Vendor`, `Total Amount`, `Taxes`, `Date`, `Category`, and `Product Details`.
4. The data is injected in real-time into Google Sheets for accounting reconciliation, attaching the direct Drive link for future auditing.

## 🔒 Security & Reliability
- Uses Google Apps Script's `PropertiesService` to store the Gemini API Key securely as an environment variable, preventing credential exposure in the source code.
- Implements `try/catch` exception handling to ensure that even if the AI fails or the rate limit is reached, the original image link is still recorded in the database for manual review.

## 🛠️ Quick Setup
1. Create a Google Form with a file upload field linked to a Google Sheet.
2. Copy the content of `main.js` (or `Codigo.gs`) into the Apps Script editor (*Extensions > Apps Script*).
3. Generate a free API Key from Google AI Studio.
4. Add your API Key in *Project Settings > Script Properties* under the variable `GEMINI_API_KEY`.
5. Set up an Apps Script Trigger to run the function `On form submit`.
## 📥 System Templates
To easily replicate this project, you can clone the data capture form by clicking the link below:

- [🔗 Make a copy of the Google Form (Frontend)](https://docs.google.com/forms/d/10XcVTz3v9tJ7VJaMJfCPXA9WQeHWodQBoRHsglBOtN0/copy)
