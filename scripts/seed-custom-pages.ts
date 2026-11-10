import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding sample custom pages for Admin Pages CMS...");

  // 1. NRI Investment Page
  await db.page.upsert({
    where: { slug: "nri-investments" },
    update: {
      title: "NRI Real Estate Investment Desk & Wealth Advisory",
      slug: "nri-investments",
      template: "LANDING",
      status: "PUBLISHED",
      seoTitle: "NRI Real Estate Investments in India | ChannelPartner Pro",
      seoDescription:
        "Comprehensive FEMA-compliant advisory for Non-Resident Indians investing in luxury townships, commercial assets, and residential high-rises.",
      content: {
        badge: "Specialized NRI Services",
        subtitle:
          "End-to-end legal verification, repatriation guidance, power of attorney facilitation, and high-yield property curation for global Indians.",
        bodyText: `Investing in Indian real estate from abroad has never been more seamless. With transparent RERA guidelines, digital escrow mechanisms, and favourable currency dynamics, luxury property yields and capital appreciation are reaching historic highs.

Our dedicated NRI Desk assigns a personal Portfolio Manager to oversee virtual 3D walkthroughs, municipal due diligence, title verification, and documentation right from token booking to possession handover.`,
        features: [
          "100% FEMA & RBI compliant transactions with NRE/NRO repatriation clarity",
          "Virtual 3D Township tours and high-resolution drone inspections",
          "Doorstep Power of Attorney (PoA) draft and consular attestation guidance",
          "Guaranteed rental leasing management & key-custody service after handover",
          "Dedicated relationship manager across US, UK, UAE & Singapore time zones",
        ],
        calloutBox:
          "Zero GST on ready-to-move properties with completion certificate. Special pre-launch allocations reserved for international investors with flexible milestone payment schedules.",
        ctaText: "Schedule NRI Video Consultation",
        ctaLink: "/contact?intent=nri",
      },
    },
    create: {
      title: "NRI Real Estate Investment Desk & Wealth Advisory",
      slug: "nri-investments",
      template: "LANDING",
      status: "PUBLISHED",
      seoTitle: "NRI Real Estate Investments in India | ChannelPartner Pro",
      seoDescription:
        "Comprehensive FEMA-compliant advisory for Non-Resident Indians investing in luxury townships, commercial assets, and residential high-rises.",
      content: {
        badge: "Specialized NRI Services",
        subtitle:
          "End-to-end legal verification, repatriation guidance, power of attorney facilitation, and high-yield property curation for global Indians.",
        bodyText: `Investing in Indian real estate from abroad has never been more seamless. With transparent RERA guidelines, digital escrow mechanisms, and favourable currency dynamics, luxury property yields and capital appreciation are reaching historic highs.

Our dedicated NRI Desk assigns a personal Portfolio Manager to oversee virtual 3D walkthroughs, municipal due diligence, title verification, and documentation right from token booking to possession handover.`,
        features: [
          "100% FEMA & RBI compliant transactions with NRE/NRO repatriation clarity",
          "Virtual 3D Township tours and high-resolution drone inspections",
          "Doorstep Power of Attorney (PoA) draft and consular attestation guidance",
          "Guaranteed rental leasing management & key-custody service after handover",
          "Dedicated relationship manager across US, UK, UAE & Singapore time zones",
        ],
        calloutBox:
          "Zero GST on ready-to-move properties with completion certificate. Special pre-launch allocations reserved for international investors with flexible milestone payment schedules.",
        ctaText: "Schedule NRI Video Consultation",
        ctaLink: "/contact?intent=nri",
      },
    },
  });

  // 2. Evara Township Exclusive Showcase
  await db.page.upsert({
    where: { slug: "evara-master-plan" },
    update: {
      title: "Evara 27-Acre Master Township: Architectural Blueprint & Inventory",
      slug: "evara-master-plan",
      template: "LANDING",
      status: "PUBLISHED",
      seoTitle: "Evara 27-Acre Master Township | Bungalows & Towers",
      seoDescription:
        "Discover Evara: 27 acres of ultra-luxury living featuring 4-8 BHK Presidential Bungalows and 4 iconic G+23 towers with alternating sky terraces.",
      content: {
        badge: "27-Acre Signature Township",
        subtitle:
          "An architectural marvel crafted with 75% green open spaces, private helipad, 50,000 sq ft clubhouse, and alternating odd-even sky balconies.",
        bodyText: `Evara represents the pinnacle of luxury township living. Spread over 27 meticulously planned acres, the township is organized into two distinct lifestyle enclaves:

1. The Presidential Bungalow Enclave: Ultra-exclusive 4 BHK to 8 BHK private villas with internal elevators, swimming pools, private gardens, and dedicated servant quarters.
2. The Sky Tower Quadrant: Four iconic G+23 towers (T1, T2, T3, T4) featuring innovative alternating odd/even floor plans. Odd floors feature cantilevered sky balcony decks, while even floors showcase double-height landscaped party terraces.`,
        features: [
          "27-Acre Integrated Township with 3-tier biometrics and smart surveillance",
          "4 to 8 BHK Presidential Bungalows with plot sizes up to 12,000 sq ft",
          "4 High-Rise Towers (T1-T4, G+23 Floors) with alternating double-height decks",
          "Clubhouse 'The Grand Solitaire' (50,000 sq ft) with Olympic pool & bowling alley",
          "Private Helipad, Golf putting greens & High-Street Retail Boulevard",
        ],
        calloutBox:
          "Pre-launch priority token bookings now open. Phase 1 possession scheduled for Dec 2027. Approved by all major financial institutions with 80% funding availability.",
        ctaText: "Request Master Plan & Price Sheet",
        ctaLink: "/projects/evara-27-acre-luxury-township",
      },
    },
    create: {
      title: "Evara 27-Acre Master Township: Architectural Blueprint & Inventory",
      slug: "evara-master-plan",
      template: "LANDING",
      status: "PUBLISHED",
      seoTitle: "Evara 27-Acre Master Township | Bungalows & Towers",
      seoDescription:
        "Discover Evara: 27 acres of ultra-luxury living featuring 4-8 BHK Presidential Bungalows and 4 iconic G+23 towers with alternating sky terraces.",
      content: {
        badge: "27-Acre Signature Township",
        subtitle:
          "An architectural marvel crafted with 75% green open spaces, private helipad, 50,000 sq ft clubhouse, and alternating odd-even sky balconies.",
        bodyText: `Evara represents the pinnacle of luxury township living. Spread over 27 meticulously planned acres, the township is organized into two distinct lifestyle enclaves:

1. The Presidential Bungalow Enclave: Ultra-exclusive 4 BHK to 8 BHK private villas with internal elevators, swimming pools, private gardens, and dedicated servant quarters.
2. The Sky Tower Quadrant: Four iconic G+23 towers (T1, T2, T3, T4) featuring innovative alternating odd/even floor plans. Odd floors feature cantilevered sky balcony decks, while even floors showcase double-height landscaped party terraces.`,
        features: [
          "27-Acre Integrated Township with 3-tier biometrics and smart surveillance",
          "4 to 8 BHK Presidential Bungalows with plot sizes up to 12,000 sq ft",
          "4 High-Rise Towers (T1-T4, G+23 Floors) with alternating double-height decks",
          "Clubhouse 'The Grand Solitaire' (50,000 sq ft) with Olympic pool & bowling alley",
          "Private Helipad, Golf putting greens & High-Street Retail Boulevard",
        ],
        calloutBox:
          "Pre-launch priority token bookings now open. Phase 1 possession scheduled for Dec 2027. Approved by all major financial institutions with 80% funding availability.",
        ctaText: "Request Master Plan & Price Sheet",
        ctaLink: "/projects/evara-27-acre-luxury-township",
      },
    },
  });

  console.log("Custom pages seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
