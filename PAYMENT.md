Final Status — সব ✅
System এভাবে কাজ করবে:

🇺🇸 US customer → Stripe Tax applies US sales tax (only if US registration active in Stripe Dashboard)
🇪🇺 EU B2C (no VAT ID) → Local VAT applied (after EU OSS registration activated in Stripe Dashboard)
🇪🇺 EU B2B (valid VAT ID) → 0% reverse charge automatically
🌏 Outside US/EU → No tax
তুমি শুধু Stripe Dashboard এ করো:

Tax → Registrations → EU OSS registration activate করো
তোমার EU VAT number সেখানে configure করো — Stripe automatically invoice এ print করবে, কোনো hardcode দরকার নেই

<!-- ========================================================================== -->

এই এররটি এখনও আসার মূল কারণ হলো আপনি সম্ভবত Stripe-এর Account Verification / Banking পেজে ডেটা সেভ করেছেন, কিন্তু Stripe Tax এর সেটিংসে "Head Office Address" অ্যাড করেননি।

দয়া করে খুব মনোযোগ দিয়ে নিচের ধাপগুলো ঠিক সেভাবেই অনুসরণ করুন:

১. আপনার ব্রাউজারে ঠিক এই লিংকটি ওপেন করুন: https://dashboard.stripe.com/test/settings/tax (আগের ভেরিফিকেশন পেজটি নয়, ঠিক এই লিংকেই যেতে হবে)

২. এই পেজটি হলো "Stripe Tax Settings"। এখানে আপনি "Head Office Address" নামে একটি অপশন দেখতে পাবেন।

৩. সেখানে একটি ঠিকানা দিন, যেমন:

Country: United States
Address Line 1: 1301 4th Ave
City: Seattle
State: Washington
ZIP: 98101
৪. ঠিকানাটি দেওয়ার পর পেজের নিচে বা ওপরে "Save" বা "Enable Tax" বাটনে ক্লিক করুন।

Stripe-এ আপনার ট্যাক্স সেটিংস সেভ হয়ে গেলে, সাইটে ফিরে গিয়ে আরেকবার ট্রাই করে দেখুন। এররটি নিশ্চিতভাবে চলে যাবে।

<!-- ------------------------ -->
১. আপনার Stripe Dashboard (dashboard.stripe.com)-এ লগইন করুন। ২. ডানপাশের উপরে গিয়ার আইকন (Settings ⚙️) এ ক্লিক করে Tax > Registrations সেকশনে যান। ৩. সেখানে "Add registration" এ ক্লিক করে Romania, Spain এবং Bangladesh যোগ করে দিন।

একবার Stripe ড্যাশবোর্ডে এই দেশগুলো অ্যাড করে দিলে, আপনি চেকআউট পেজটি রিলোড করে আবার ট্রাই করলেই দেখবেন Stripe অটোমেটিকভাবে ট্যাক্স ক্যালকুলেট করছে। কোড একদম ঠিক আছে, শুধু আপনার Stripe-এর সেটিংসে ওই দেশগুলোর ট্যাক্স অন করা বাকি আছে।


ইউরোপিয়ান ইউনিয়ন (EU Member States): Austria - 20% Belgium - 21% Bulgaria - 20% Croatia - 25% Cyprus - 19% Czech Republic - 21% Denmark - 25% Estonia - 22% Finland - 25.5% France - 20% Germany - 19% Greece - 24% Hungary - 27% Ireland - 23% Italy - 22% Latvia - 21% Lithuania - 21% Luxembourg - 17% Malta - 18% Netherlands - 21% Poland - 23% Portugal - 23% Romania - 21% Slovakia - 20% Slovenia - 22% Spain - 21% Sweden - 25%

নন-ইইউ এবং অন্যান্য দেশ (Non-EU Countries): United Kingdom - 20% Norway - 25% Switzerland - 8.1% Iceland - 24% Bangladesh - 9%