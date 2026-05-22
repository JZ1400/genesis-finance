// Mock financial data (NIO — Nicaraguan Córdoba, symbol C$)
// Persona: established professional, six-figure portfolio in NIO.

export const DATA = (function () {
  const accounts = [
    {
      id: "acc-savings",
      name: "Savings · BAC Premium",
      kind: "savings",
      number: "•• 4421",
      balance: 1284500.40,
      delta30: 0.024,
      apr: 0.054,
    },
    {
      id: "acc-checking",
      name: "Checking · BAC",
      kind: "checking",
      number: "•• 8870",
      balance: 142380.10,
      delta30: -0.061,
    },
    {
      id: "acc-card-1",
      name: "Credit · Visa Signature",
      kind: "credit",
      number: "•• 3309",
      balance: -42180.50,
      limit: 250000,
      delta30: 0.18,
      due: "2026-06-04",
      style: "signature",
      network: "VISA",
      brand: "BAC Premium",
      tier: "Signature",
      fullNumber: "4920 ▪▪▪▪ ▪▪▪▪ 3309",
      holder: "ANDREA MARTÍNEZ",
      expiry: "08/29",
      cvv: "•••",
      apr: 0.265,
      cycleStart: "2026-05-04",
      cycleEnd: "2026-06-03",
      statementBalance: 36420.00,
      minPayment: 4380.00,
      rewards: { kind: "miles", balance: 84210, monthly: 3420, partner: "LATAM Pass" },
      frozen: false,
    },
    {
      id: "acc-card-2",
      name: "Credit · Mastercard Black",
      kind: "credit",
      number: "•• 1027",
      balance: -18910.00,
      limit: 180000,
      delta30: -0.09,
      due: "2026-06-12",
      style: "black",
      network: "MASTERCARD",
      brand: "BAC Black",
      tier: "World Elite",
      fullNumber: "5310 ▪▪▪▪ ▪▪▪▪ 1027",
      holder: "ANDREA MARTÍNEZ",
      expiry: "11/27",
      cvv: "•••",
      apr: 0.298,
      cycleStart: "2026-05-12",
      cycleEnd: "2026-06-11",
      statementBalance: 14820.00,
      minPayment: 1480.00,
      rewards: { kind: "cashback", balance: 4280, monthly: 380, partner: "BAC Rewards" },
      frozen: false,
    },
    {
      id: "acc-broker",
      name: "Brokerage · LAFISE",
      kind: "investment",
      number: "•• 7755",
      balance: 1182640.90,
      delta30: 0.038,
    },
  ];

  const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
  const income =   [172400,168900,175200,179800,181200,210400,234800,184600,179200,183400,188900,185300];
  const spending = [ 88100, 91200, 95800, 89400, 92600,118200,142800, 87900, 84200, 91200, 96400, 94800];
  const netWorth = [2110000,2168000,2204000,2248000,2298000,2335000,2390000,2424000,2470000,2512000,2558000,2589430];

  const categories = [
    { id: "groc",   name: "Groceries",      thisMonth: 18420,  prevMonth: 17890,  budget: 22000 },
    { id: "rent",   name: "Housing & Rent", thisMonth: 26000,  prevMonth: 26000,  budget: 26000 },
    { id: "trans",  name: "Transport",      thisMonth: 8240,   prevMonth: 9120,   budget: 10000 },
    { id: "dining", name: "Dining Out",     thisMonth: 11890,  prevMonth: 9420,   budget: 10000 },
    { id: "util",   name: "Utilities",      thisMonth: 4620,   prevMonth: 4480,   budget: 5500 },
    { id: "ent",    name: "Entertainment",  thisMonth: 3210,   prevMonth: 4180,   budget: 4500 },
    { id: "shop",   name: "Shopping",       thisMonth: 9840,   prevMonth: 7220,   budget: 8000 },
    { id: "health", name: "Health",         thisMonth: 2310,   prevMonth: 6190,   budget: 5000 },
    { id: "travel", name: "Travel",         thisMonth: 6240,   prevMonth: 1200,   budget: 6000 },
    { id: "other",  name: "Other",          thisMonth: 4030,   prevMonth: 2540,   budget: 4000 },
  ];

  const transactions = [
    { id:"t-101", date:"2026-05-20", merchant:"Pricesmart Managua",   cat:"groc",   sub:"Supermarket", note:"Weekly grocery run",      amount:-3420.50,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-102", date:"2026-05-20", merchant:"Café las Flores",       cat:"dining", sub:"Coffee",      note:"Lunch · roasted coffee",  amount:-485.00,   account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-103", date:"2026-05-19", merchant:"Uber",                  cat:"trans",  sub:"Rideshare",   note:"3 rides",                 amount:-742.00,   account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-104", date:"2026-05-19", merchant:"Salary · Acme S.A.",    cat:"income", sub:"Salary",      note:"Bi-monthly payroll",      amount:92650.00,  account:"acc-checking", method:"ACH transfer" },
    { id:"t-105", date:"2026-05-18", merchant:"Enacal",                cat:"util",   sub:"Water",       note:"Water bill · April",      amount:-1240.00,  account:"acc-checking", method:"Direct debit" },
    { id:"t-106", date:"2026-05-17", merchant:"Disnorte",              cat:"util",   sub:"Power",       note:"Electricity · April",     amount:-2890.40,  account:"acc-checking", method:"Direct debit" },
    { id:"t-107", date:"2026-05-17", merchant:"La Colonia",            cat:"groc",   sub:"Supermarket", note:"Mid-week shop",           amount:-2140.20,  account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-108", date:"2026-05-16", merchant:"Cinemark Galerías",     cat:"ent",    sub:"Cinema",      note:"2 tickets + concessions", amount:-820.00,   account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-109", date:"2026-05-16", merchant:"Farmacias Económicas",  cat:"health", sub:"Pharmacy",    note:"Prescription",            amount:-1180.00,  account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-110", date:"2026-05-15", merchant:"Amazon",                cat:"shop",   sub:"Online · Books", note:"Books · 3 items",      amount:-4280.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-111", date:"2026-05-14", merchant:"Avianca",               cat:"travel", sub:"Flights",     note:"MGA → SJO · Jun 14",      amount:-6240.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-112", date:"2026-05-14", merchant:"Tip Top",               cat:"dining", sub:"Fast Food",   note:"Family dinner",           amount:-980.00,   account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-113", date:"2026-05-13", merchant:"Rent · Los Robles",     cat:"rent",   sub:"Rent",        note:"May rent",                amount:-26000.00, account:"acc-checking", method:"Wire transfer" },
    { id:"t-114", date:"2026-05-12", merchant:"Spotify Premium",       cat:"ent",    sub:"Streaming",   note:"Family plan",             amount:-540.00,   account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-115", date:"2026-05-12", merchant:"Walmart",               cat:"groc",   sub:"Supermarket", note:"Restock",                 amount:-3890.00,  account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-116", date:"2026-05-11", merchant:"DHL",                   cat:"shop",   sub:"Courier",     note:"Courier · imports",       amount:-1420.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-117", date:"2026-05-10", merchant:"Hotel Camino Real",     cat:"travel", sub:"Hotels",      note:"1 night · business",      amount:-3800.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-118", date:"2026-05-10", merchant:"BAC · Interest",        cat:"income", sub:"Interest",    note:"Savings interest · April",amount:5420.50,   account:"acc-savings", method:"Interest credit" },
    { id:"t-119", date:"2026-05-09", merchant:"Claro",                 cat:"util",   sub:"Telecom",     note:"Mobile + internet",       amount:-1490.00,  account:"acc-checking", method:"Direct debit" },
    { id:"t-120", date:"2026-05-08", merchant:"On Running",            cat:"shop",   sub:"Apparel",     note:"Cloudmonster trainers",   amount:-4250.00,  account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-121", date:"2026-05-07", merchant:"Esso",                  cat:"trans",  sub:"Fuel",        note:"Fuel · full tank",        amount:-1980.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-122", date:"2026-05-06", merchant:"Asados Doña Tania",     cat:"dining", sub:"Dinner",      note:"Dinner with team",        amount:-1820.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-123", date:"2026-05-05", merchant:"Transfer to Savings",   cat:"transfer", sub:"Internal", note:"Auto-save 30%",           amount:-25000.00, account:"acc-checking", method:"Internal transfer" },
    { id:"t-124", date:"2026-05-05", merchant:"Transfer from Checking",cat:"transfer", sub:"Internal", note:"Auto-save 30%",           amount:25000.00,  account:"acc-savings", method:"Internal transfer" },
    { id:"t-201", date:"2026-04-29", merchant:"Pricesmart Managua",   cat:"groc",   sub:"Supermarket", note:"Big restock",             amount:-4180.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-202", date:"2026-04-28", merchant:"Uber",                  cat:"trans",  sub:"Rideshare",   note:"Weekend rides",           amount:-820.00,   account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-203", date:"2026-04-27", merchant:"Café las Flores",       cat:"dining", sub:"Coffee",      note:"Morning",                 amount:-220.00,   account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-204", date:"2026-04-25", merchant:"Amazon",                cat:"shop",   sub:"Online · Electronics", note:"Earbuds",      amount:-3290.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-205", date:"2026-04-22", merchant:"La Colonia",            cat:"groc",   sub:"Supermarket", note:"Week shop",               amount:-2480.00,  account:"acc-card-2", method:"MC •• 1027" },
    { id:"t-206", date:"2026-04-20", merchant:"Avianca",               cat:"travel", sub:"Flights",     note:"PTY return",              amount:-4180.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-207", date:"2026-04-18", merchant:"Esso",                  cat:"trans",  sub:"Fuel",        note:"Fuel",                    amount:-2080.00,  account:"acc-card-1", method:"Visa •• 3309" },
    { id:"t-208", date:"2026-04-15", merchant:"Netflix",               cat:"ent",    sub:"Streaming",   note:"Monthly",                 amount:-620.00,   account:"acc-card-2", method:"MC •• 1027" },
  ];

  const accountHistory = {
    "acc-savings":  [1000000, 1018000, 1041000, 1065000, 1092000, 1118000, 1148000, 1180000, 1210000, 1236000, 1260000, 1284500],
    "acc-checking": [165000, 158000, 162000, 149000, 152000, 138000, 144000, 156000, 161000, 152000, 147000, 142380],
    "acc-card-1":   [-12000, -18000, -25000, -22000, -30000, -42000, -58000, -34000, -28000, -36000, -38000, -42180],
    "acc-card-2":   [-9000, -14000, -16000, -12000, -18000, -22000, -28000, -16000, -14000, -19000, -21000, -18910],
    "acc-broker":   [945000, 968000, 992000, 1015000, 1042000, 1068000, 1098000, 1125000, 1148000, 1162000, 1175000, 1182640],
  };

  const stocks = [
    { ticker:"AAPL", name:"Apple Inc.",            qty:42,  price:218.40, cost:172.30, weight:0.18 },
    { ticker:"MSFT", name:"Microsoft Corp.",       qty:18,  price:462.10, cost:398.80, weight:0.17 },
    { ticker:"NVDA", name:"NVIDIA Corp.",          qty:24,  price:142.80, cost:88.50,  weight:0.07 },
    { ticker:"GOOGL",name:"Alphabet Inc. Class A", qty:32,  price:178.20, cost:155.60, weight:0.11 },
    { ticker:"VTI",  name:"Vanguard Total Market", qty:85,  price:281.40, cost:245.00, weight:0.46 },
    { ticker:"BRK.B",name:"Berkshire Hathaway B",  qty:14,  price:484.00, cost:412.30, weight:0.13 },
  ];

  function rngSeries(seed, len = 24, vol = 0.02, drift = 0.001) {
    let v = 0.5;
    const out = [];
    for (let i = 0; i < len; i++) {
      const r = Math.sin(seed * (i + 1) * 7.21) * 0.5 + 0.5;
      v += (r - 0.5) * vol + drift;
      v = Math.max(0.02, Math.min(0.98, v));
      out.push(v);
    }
    return out;
  }
  stocks.forEach((s, i) => {
    s.series = rngSeries((i + 1) * 0.913, 24, 0.07, 0.004);
    s.day = (Math.sin((i + 2) * 1.91) * 0.022);
  });

  const alts = [
    { kind:"CD",     name:"BAC 18-month CD",        value: 350000, rate:0.072, matures:"2027-03-12" },
    { kind:"Bond",   name:"NIC Sovereign 5y",       value: 220000, rate:0.085, matures:"2029-08-20" },
    { kind:"Crypto", name:"Bitcoin",                value: 84200,  qty:0.62,   rate:null },
    { kind:"Crypto", name:"Ethereum",               value: 41800,  qty:9.4,    rate:null },
    { kind:"Real Estate", name:"Apt · Los Robles",  value: 4200000, rate:0.04, note:"Rental yield est." },
  ];

  const insights = [
    {
      tone: "up",
      title: "Dining is trending high",
      body: "C$11,890 spent on dining so far — 26% over your typical month. Mostly weekend dinners.",
    },
    {
      tone: "flat",
      title: "Rent paid · on time",
      body: "C$26,000 to Los Robles cleared on May 13. Same as the last 9 months.",
    },
    {
      tone: "dn",
      title: "Health spending down",
      body: "Only C$2,310 this month vs. C$6,190 in April. No recurring meds scheduled.",
    },
    {
      tone: "up",
      title: "Brokerage gained C$43,800",
      body: "VTI and NVDA drove +3.8% on the portfolio over the last 30 days.",
    },
  ];

  return {
    accounts,
    months,
    income,
    spending,
    netWorth,
    categories,
    transactions,
    stocks,
    alts,
    insights,
    accountHistory,
  };
})();
