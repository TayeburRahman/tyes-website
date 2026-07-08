@AGENTS.md
এই এররটি আপনার কোডের কোনো সমস্যার জন্য নয়, বরং এটি আপনার Stripe Account Configuration-এর একটি সমস্যা।

Stripe Tax বা স্বয়ংক্রিয় ট্যাক্স ক্যালকুলেশন (automatic tax calculation) ব্যবহার করার জন্য, Stripe-এর টেস্ট মোডে (Test Mode) আপনার কোম্পানির একটি Head Office Address সেট করা থাকা বাধ্যতামূলক।

এটি সমাধান করার জন্য: ১. আপনার Stripe অ্যাকাউন্টে লগ ইন করুন। ২. সরাসরি এই লিংকে যান: https://dashboard.stripe.com/test/settings/tax ৩. সেখানে Head Office Address সেকশনে গিয়ে আপনার বা কোম্পানির একটি ঠিকানা (যেমন: Wyoming, US এর ঠিকানা) দিয়ে সেভ করুন।

ঠিকানা সেভ করার পর আবার ট্রাই করুন, তাহলে আর এই এররটি আসবে না এবং চেকআউট সেশনটি সফলভাবে তৈরি হবে।

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

1:13 AM
