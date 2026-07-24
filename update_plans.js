require('dotenv').config({ path: '/home/tayebur/project/tyes-website/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const plansToUpdate = [
  {
    id: 18,
    name: "Free Image",
    badge: "Free",
    features: [
      { text: "1 AI image", icon: "check" },
      { text: "From 3H delivery", icon: "clock" },
      { text: "+ Add strategy $25", icon: "check" }
    ]
  },
  {
    id: 19,
    name: "Brand Strategy",
    badge: "Strategy-First",
    features: [
      { text: "LLM visibility audit", icon: "check" },
      { text: "Viral product angles", icon: "check" },
      { text: "Retail buyer shortlist", icon: "check" }
    ]
  },
  {
    id: 20,
    name: "Campaign 5",
    badge: "Popular",
    features: [
      { text: "5 AI images", icon: "check" },
      { text: "1 revision / image", icon: "check" },
      { text: "From 24H delivery", icon: "clock" },
      { text: "+ FREE Brand Strategy Snapshot", icon: "check" }
    ]
  },
  {
    id: 21,
    name: "Campaign 10",
    badge: "Go Big",
    features: [
      { text: "10 AI images", icon: "check" },
      { text: "1 revision / image", icon: "check" },
      { text: "From 24H delivery", icon: "clock" },
      { text: "+ FREE Brand Strategy Snapshot", icon: "check" }
    ]
  },
  {
    id: 22,
    name: "Deep Dive Brand Strategy",
    badge: "Retail-Ready",
    description: "Priced per scope",
    features: [
      { text: "Full LLM audit + 90-day roadmap", icon: "check" },
      { text: "Viral product concepts for your niche", icon: "check" },
      { text: "Warm intros to retail buyers", icon: "check" },
      { text: "Packaging & positioning direction", icon: "check" },
      { text: "3-day delivery", icon: "clock" },
      { text: "1-hour strategy call", icon: "check" }
    ]
  }
];

async function run() {
  for (const plan of plansToUpdate) {
    const { error } = await supabase
      .from('pricing_plans')
      .update({
        name: plan.name,
        badge: plan.badge,
        features: plan.features,
        description: plan.description || ""
      })
      .eq('id', plan.id);
    if (error) console.error(`Error updating plan ${plan.id}:`, error);
    else console.log(`Successfully updated ${plan.name}`);
  }
}

run();
