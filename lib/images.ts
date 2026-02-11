import { OpportunityCategory } from "@/src/generated/prisma/client";

// Curated list of high-quality Unsplash image IDs for each category
// These are IDs, not full URLs, to allow us to construct optimized URLs (resizing, format, etc.)
const CATEGORY_IMAGES: Record<string, string[]> = {
  [OpportunityCategory.INTERNSHIP]: ["1524178232363-1fb2b075b655", "1523240795612-9a054b0db644", "1552664730-d307ca884978"],
  [OpportunityCategory.FULL_TIME]: ["1497032628192-86f99bcd76bc", "1573496359142-b8d87734a5a2", "1664575602276-acd073f104c1"],
  [OpportunityCategory.PART_TIME]: ["1454165804606-c3d57bc86b40", "1593672715491-5521d9ef563a"],
  [OpportunityCategory.CONTRACT]: ["1450101499163-c8848c66ca85", "1664575601786-b00156752b65"],
  [OpportunityCategory.FREELANCE]: ["1586281380349-453088b22e1b", "1516321318423-f06f85e504b3", "1593672715491-5521d9ef563a"],
  [OpportunityCategory.TUTORING]: ["1544717305-2782549b5136", "1434030216411-0b793f4b4173"],
  [OpportunityCategory.CONSULTING]: ["1556761175-5973ac0f96fc", "1454165804606-c3d57bc86b40"],
  [OpportunityCategory.VIRTUAL_ASSISTANT]: ["1593672715491-5521d9ef563a", "1483058712412-4245e9b90334"],
  [OpportunityCategory.TRANSCRIPTION]: ["1587620962725-abab7fe55159", "1516321318423-f06f85e504b3"],
  [OpportunityCategory.TRANSLATION]: ["1543269865-cbf427effbad", "1456513080510-981cb30e56f4"],
  [OpportunityCategory.COACHING]: ["1571624436279-b272aff752b5", "1531482615713-2afd69097998"],
  [OpportunityCategory.DROPSHIPPING]: ["1566576912902-48f5d06c26f4", "1516321497487-e288fb19713f"],
  [OpportunityCategory.PRINT_ON_DEMAND]: ["1566576912902-48f5d06c26f4", "1516321497487-e288fb19713f"],
  [OpportunityCategory.DIGITAL_PRODUCT]: ["1526374965328-7f61d4dc18c5", "1486312338219-ce68d2c6f44d"],
  [OpportunityCategory.RESELLING]: ["1556740758-90de29cf9fab", "1472851294608-4155f2142c67"],
  [OpportunityCategory.HANDMADE]: ["1459749411175-04bf5292ceea", "1606787366850-de6330128bfc"],
  [OpportunityCategory.CONTENT_MONETIZATION]: ["1516321497487-e288fb19713f", "1496181133206-80ce9b88a853"],
  [OpportunityCategory.SPONSORSHIP]: ["1557804506-669a67965ba0", "1511632765486-a01980e01a18"],
  [OpportunityCategory.NEWSLETTER]: ["1586769852044-70061dfa7138", "1516321147705-794717ced809"],
  [OpportunityCategory.COURSE]: ["1501504905252-473c47e087f8", "1497633762265-9d179a990aa6"],
  [OpportunityCategory.PODCASTING]: ["1590602847861-f357a9332bbc", "1581368135153-a5cb6cf11153"],
  [OpportunityCategory.MEMBERSHIP]: ["1529156069894-3d07e285a8ef", "1516321318423-f06f85e504b3"],
  [OpportunityCategory.WEBSITE_FLIPPING]: ["1460925895917-afdab827c52f", "1498050108023-c5249f4df085"],
  [OpportunityCategory.DOMAIN_FLIPPING]: ["1555421689-d68471e189f7", "1486312338219-ce68d2c6f44d"],
  [OpportunityCategory.REAL_ESTATE_DIGITAL]: ["1560518883638-3868851c81a4", "1448630360428-65456885c650"],
  [OpportunityCategory.TRADING_CRYPTO]: ["1518546305927-5a555bb7020d", "1621504450374-b47f7347eb11"],
  [OpportunityCategory.TRADING_STOCK]: ["1611974765270-ca12588265b6", "1590283603385-17ffb3a7f29f"],
  [OpportunityCategory.INVESTMENT]: ["1579532537598-45d0818a12dc", "1565514020176-87ac76427028"],
  [OpportunityCategory.USER_TESTING]: ["1531403009284-440f080d1e12", "1526374965328-7f61d4dc18c5"],
  [OpportunityCategory.DATA_LABELING]: ["1551288049-bebda4e38f71", "1504868584819-f8e8b4b6d7e3"],
  [OpportunityCategory.BUG_BOUNTY]: ["1526374965328-7f61d4dc18c5", "1562813733979-322d5d8bd12e"],
  [OpportunityCategory.AI_TRAINING]: ["1677442120464-cd46a6f30a54", "1620712943543-0a3817a1518a"],
  [OpportunityCategory.MYSTERY_SHOPPING]: ["1483985988355-763728e1935b", "1573855616956-42acb2390632"],
  [OpportunityCategory.SCHOLARSHIP]: ["1523050854058-8df90110c9f1", "1523240795612-9a054b0db644"],
  [OpportunityCategory.GRANT]: ["1454165804606-c3d57bc86b40", "1554415703-48f632a29490"],
  [OpportunityCategory.FELLOWSHIP]: ["1522202176988-66273c2fd55f", "1517048676732-d65bc937f952"],
  [OpportunityCategory.RESEARCH]: ["1532094349884-543bc11b234d", "1581091226825-a6a2a5aee158"],
  [OpportunityCategory.VOLUNTEER]: ["1593113598345-d9120c4bfa69", "1559027613-8004f32df563"],
  [OpportunityCategory.COMPETITION]: ["1546213292943-934024640452", "1511512578047-923ee9626372"],
  [OpportunityCategory.PROGRAM]: ["1531482615713-2afd69097998", "1524178232363-1fb2b075b655"],
  [OpportunityCategory.APPRENTICESHIP]: ["1581091226825-a6a2a5aee158", "1504384308090-c54beed04a91"],
  [OpportunityCategory.GIG]: ["1516321318423-f06f85e504b3", "1487260211189-b49ac7902c23"],
  [OpportunityCategory.SIDE_HUSTLE]: ["1579621970560-a7d1d5134785", "1450101499163-c8848c66ca85"],
  [OpportunityCategory.SURVEY]: ["1555421689-d68471e189f7", "1454165804606-c3d57bc86b40"],
  [OpportunityCategory.AFFILIATE]: ["1563986768427-620ca7566085", "1556761175-5973ac0f96fc"],
  [OpportunityCategory.AMBASSADOR]: ["1557804506-669a67965ba0", "1522202176988-66273c2fd55f"],
  [OpportunityCategory.OTHER]: ["1516321318423-f06f85e504b3", "1484417894907-623942c8ee12"],
};

// Default fallback image (Abstract colorful shape)
const DEFAULT_IMAGE = "1550684848-fac1c5b4e853";

/**
 * Get a consistent high-quality curated image URL for a given opportunity category
 * @param category The opportunity category
 * @param seed Optional string to ensure consistent image selection (e.g., opportunity ID)
 * @param width Optional width in pixels (default 800)
 * @param height Optional height in pixels (default 600)
 * @returns Full Unsplash image URL
 */
export function getCategoryCoverImage(category: string, seed?: string, width = 800, height = 600): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES[OpportunityCategory.OTHER];
  
  let index = 0;
  if (seed) {
    // Simple hash function to deterministically pick an image based on seed (ID)
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    index = Math.abs(hash) % images.length;
  } else {
    index = Math.floor(Math.random() * images.length);
  }

  const imageId = images[index] || DEFAULT_IMAGE;
  
  // Construct optimized Unsplash URL
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=${width}&q=80`;
}
