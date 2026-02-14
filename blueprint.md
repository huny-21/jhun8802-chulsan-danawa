# 우리 동네 출산 혜택

## Overview
This project is a web application designed to help users find childbirth benefits available in their local area. It features a simple interface where users can select their location and expected due date to view relevant government and local municipality benefits.

## Features
- **Location Selection:** Two-stage dropdown menu to select City/Province and District.
- **Due Date Input:** Date picker to input the expected date of birth.
- **Benefit Lookup:** "Check Benefits" button to retrieve and display information.
- **Result Display:**
  - **Tabs:** Separate views for "Government Benefits" and "Local Benefits".
  - **Cards:** detailed information for each benefit including name, amount, target, and how to apply.
- **Checklist:** D-Day counter and preparation checklist based on the due date.
- **Loading State:** Visual feedback (spinner) during data retrieval.
- **Responsive Design:** Mobile-first layout optimized for various screen sizes.

## Current Plan (4-D Methodology)
1.  **Decomposition (File Structure):**
    -   `public/index.html`: Main UI with dropdowns and disclaimer.
    -   `public/style.css`: Styles including new checklist and disclaimer sections.
    -   `public/data.js`: ES Module containing structured benefit data (Government & Local).
    -   `public/script.js`: Core logic for rendering, filtering, and formatting.
2.  **Diagnosis (Logic):**
    -   Strict separation of Government vs. Local benefits.
    -   Dependent dropdown logic (City -> District).
    -   Government benefits always accessible.
3.  **Development (Data):**
    -   [x] Scalable data structure in `data.js`.
    -   [x] Update Gangwon-do (강원특별자치도) data with 10 specific regions (Samcheok, Sokcho, Yanggu, Yangyang, Yeongwol, Wonju, Inje, Gangneung, Goseong, Donghae).
    -   [x] Add 'Contact' field to benefit data and UI.
    -   [x] Numeric amount storage with formatter function.
4.  **Delivery (UX):**
    -   "As of Feb 2026" notice.
    -   Disclaimer footer.
    -   D-Day specific checklist feature.
    -   Enhanced display for tiered local benefits.

## Project Structure
- `public/`: Contains the web assets.
- `firebase.json`: Configuration for Firebase Hosting.
- `.idx/dev.nix`: Configured to serve the `public` directory.
