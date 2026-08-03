Hi!

The automatic tax calculation system has been fully integrated and is ready on the website. The only remaining step is to activate your tax registrations in your Stripe Dashboard.

How the system works:

///

- US customers → Stripe Tax automatically applies US sales tax (only if a US tax registration is active).
- EU B2C customers (without a VAT ID)→ The customer's local VAT is applied automatically.
- EU B2B customers (with a valid VAT ID)→ A 0% reverse charge is applied automatically. 

Please complete the following steps:

Step 1: Add Head Office Address :
Add your Head Office Address in the Stripe Tax Settings by following these steps:

- Open: https://dashboard.stripe.com/settings/tax
- On the Stripe Tax Settings page, find the Head Office Address section.
- Enter your business address. 
Click Save (or Enable Tax, if that option appears).

Step 2: Set up Tax Registrations:

1. Go to:   https://dashboard.stripe.com/tax/locations
2. Open the Collect and file" tab.
3. Click "Start collecting tax" (or + Add registration) and add the countries where you are registered to collect tax.

For example, you may add the United States, the United Kingdom, and any applicable EU Member States.

Important for EU registrations:
When adding EU countries, please select your EU OSS registration or Standard VAT registration, as appropriate. Since your business sells digital services/software, do not select "Inbound Goods."

Once your EU VAT number is added in Stripe, Stripe will automatically include it on customer invoices, so no additional changes to the website are required.

After these tax registrations have been added, the checkout page will begin calculating taxes automatically.

Please let me know once you've completed this step, and I'll verify that everything is working correctly.
