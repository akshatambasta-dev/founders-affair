export type Experience = {
  slug: string;
  num: string;
  title: string;
  category: string;
  description: string;
  long: string;
};

export const experiences: Experience[] = [
  {
    slug: "acquisition-floor",
    num: "01",
    title: "Acquisition Floor",
    category: "Day 1 / Acquire",
    description:
      "Bid for a product with limited information and decide how much starting capital to commit.",
    long: "Each team begins with $100,000 in simulated capital and competes with other teams to acquire a product. The first strategic challenge is deciding what to bid while keeping enough cash to operate afterward.",
  },
  {
    slug: "boardroom-crisis",
    num: "02",
    title: "Boardroom Crisis",
    category: "Day 1 / Manage",
    description: "Work through business disruptions and make decisions under pressure as a team.",
    long: "Rival-company actions, supplier price increases, regulatory changes, and operational outages can put a company under pressure. The team must communicate, assess the risk, and decide how to respond. Specific scenarios depend on the event.",
  },
  {
    slug: "stock-market",
    num: "03",
    title: "The Stock Market",
    category: "Day 1 / Move the market",
    description:
      "See company decisions feed into simulated market performance and respond together.",
    long: "The simulated stock market runs alongside company management. Business decisions affect market performance; the CFO and designated market participant handle buying, selling, and cash management under the event rules. The market is part of the company simulation, not a separate game.",
  },
  {
    slug: "brand-war",
    num: "04",
    title: "The Brand War",
    category: "Day 2 / Pitch",
    description: "Turn your product and strategy into a company people believe in.",
    long: "Teams present their product, brand identity, advertising, and marketing strategy, then compete to persuade people of the business they have built. The focus is on communicating value and making the case for the company, with challenges or curveballs where applicable.",
  },
  {
    slug: "investor-marketplace",
    num: "05",
    title: "Investor Marketplace",
    category: "Day 2 / Get funded",
    description: "Showcase your company at a stall and compete for simulated investor cheques.",
    long: "At company stalls, teams showcase their product, brand, business model, campaign, market journey, and future potential. Investors use limited simulated capital to write cheques to the businesses they choose to support. The team with the highest total cheque value wins. These cheques are not real-world investments or cash prizes.",
  },
];
