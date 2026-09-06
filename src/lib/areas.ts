/**
 * Places served. Each entry becomes a page at /headshots/<slug>. The text is
 * written per town so the pages are not copies of each other.
 */
export type Faq = { q: string; a: string };

export type Area = {
  slug: string;
  name: string; // "Monsey"
  fullName: string; // "Monsey, NY"
  kind: "county" | "town" | "village" | "hamlet";
  zips: string[];
  title: string; // <title>, 50–60 characters
  description: string; // meta description, 150–160 characters
  heading: string; // h1
  intro: string[]; // opening paragraphs
  local: string[]; // short factual notes about photographing there
  commonRequests: string[];
  faq: Faq[];
  neighbors: string[]; // slugs
};

export const areas: Area[] = [
  {
    slug: "rockland-county",
    name: "Rockland County",
    fullName: "Rockland County, NY",
    kind: "county",
    zips: [],
    title: "Headshots in Rockland County, NY | Meilech Biller",
    description:
      "Headshot photographer serving all of Rockland County, NY. Studio sessions in Spring Valley and on-location headshots at offices in Monsey, Nanuet, New City, Suffern and more.",
    heading: "Headshots in Rockland County, NY",
    intro: [
      "I photograph headshots across Rockland County. Individual sessions happen in my studio in Spring Valley. Team sessions happen at your office, anywhere from Suffern to Nyack.",
      "Most people book for LinkedIn, a company website, a staff directory, a real estate profile, a medical practice page, or an acting portfolio. The process is the same for all of them: a short session, proofs in an online gallery within a few days, and retouched files ready to download.",
    ],
    local: [
      "Studio in Spring Valley, near Route 59 and the Palisades Parkway. Free parking.",
      "On-location sessions cover the towns of Ramapo, Clarkstown, Orangetown, Haverstraw and Stony Point.",
      "No travel fee anywhere in Rockland County. Bergen County, NJ and Westchester are also possible; ask.",
      "Evening and Sunday sessions are available. The studio is closed Friday afternoon and Saturday.",
    ],
    commonRequests: [
      "LinkedIn and business headshots",
      "Matching headshots for a whole office or practice",
      "Real estate agent and broker photos",
      "Attorney and CPA firm portraits",
      "Actor headshots",
      "Photos for a school, camp or nonprofit staff page",
    ],
    faq: [
      {
        q: "Where in Rockland County do you photograph?",
        a: "Individual sessions are in my studio in Spring Valley. For teams I bring lights and a background to your office. Any town in Rockland County is covered without a travel fee.",
      },
      {
        q: "How soon can I get my photos?",
        a: "Proofs are posted to your online gallery within one or two business days. Retouched finals follow within two to three business days of your picks.",
      },
      {
        q: "Do you photograph on Sundays?",
        a: "Yes. Sunday and weekday evening sessions are available. The studio is closed Friday afternoon and Saturday.",
      },
    ],
    neighbors: ["spring-valley", "monsey", "nanuet", "new-city", "airmont", "suffern", "ramapo"],
  },
  {
    slug: "spring-valley",
    name: "Spring Valley",
    fullName: "Spring Valley, NY",
    kind: "village",
    zips: ["10977"],
    title: "Headshots in Spring Valley, NY | Meilech Biller",
    description:
      "Headshot photographer in Spring Valley, NY 10977. Studio headshots for business, LinkedIn, real estate and actors, plus on-site team photos for offices in the village.",
    heading: "Headshots in Spring Valley, NY",
    intro: [
      "My studio is in Spring Valley, so this is where most individual sessions happen. It is a short drive from anywhere in the village and from Monsey, Hillcrest, Chestnut Ridge and Nanuet.",
      "Sessions take 30 to 90 minutes depending on the package. You leave with nothing to carry. Proofs show up in your online gallery within a day or two, you pick your favorites, and the retouched files follow.",
    ],
    local: [
      "Studio location in Spring Valley (10977), near Route 59. Free parking at the door.",
      "Walk-in changes of clothing are fine. There is a place to change and a mirror.",
      "For businesses along Route 59, Main Street and Route 45, I can also set up in your office.",
      "Sessions for Spring Valley schools, camps and nonprofits are usually done on-site so staff can rotate through in a morning.",
    ],
    commonRequests: [
      "LinkedIn photos for professionals working in the village or commuting to the city",
      "Real estate agent headshots",
      "Website photos for local businesses and medical offices",
      "Staff photos for schools and organizations",
      "Passport-style and ID-style portraits when a formal headshot is not needed",
    ],
    faq: [
      {
        q: "Where exactly is the studio?",
        a: "In Spring Valley, NY 10977, near Route 59. You get the exact address and parking directions when we confirm your date.",
      },
      {
        q: "Can I bring more than one outfit?",
        a: "Yes. The Professional and Executive packages include multiple looks. There is a place to change in the studio.",
      },
      {
        q: "Do you do sessions at my office in Spring Valley?",
        a: "Yes. For two or more people I usually recommend an on-site session. For one person the studio is faster and cheaper.",
      },
    ],
    neighbors: ["monsey", "airmont", "nanuet", "ramapo", "rockland-county"],
  },
  {
    slug: "monsey",
    name: "Monsey",
    fullName: "Monsey, NY",
    kind: "hamlet",
    zips: ["10952"],
    title: "Headshots in Monsey, NY | Meilech Biller",
    description:
      "Headshot photographer for Monsey, NY 10952. Business, LinkedIn and professional headshots minutes from Monsey in the Spring Valley studio, or on-site at your Monsey office.",
    heading: "Headshots in Monsey, NY",
    intro: [
      "Monsey is a few minutes from my studio in Spring Valley. Many of the people I photograph run businesses, sell real estate, work in finance or healthcare, or need a photo for a website, a brochure or a LinkedIn profile.",
      "If you would rather not travel, I come to you. Offices along Route 59, Route 306 and Maple Avenue are all a short trip, and a full team can be photographed in one morning.",
    ],
    local: [
      "Studio sessions for Monsey residents are 5 to 10 minutes away in Spring Valley.",
      "On-site sessions in Monsey offices, stores, schools and organizations, with a portable background so every photo matches.",
      "Modest wardrobe and posing are handled naturally. Tell me what you need and the session is planned around it.",
      "Separate sessions for men and women can be scheduled on request.",
    ],
    commonRequests: [
      "Headshots for business owners and sales teams",
      "Real estate and mortgage professionals",
      "Nursing home, clinic and therapy practice staff photos",
      "Photos for organization websites, dinners and journals",
      "LinkedIn and resume photos for job seekers",
    ],
    faq: [
      {
        q: "Do you photograph in Monsey itself?",
        a: "Yes. Individual sessions are in the Spring Valley studio, a few minutes away. Group and office sessions are done in Monsey at your location.",
      },
      {
        q: "Can you match new headshots to the ones our office already has?",
        a: "Usually yes. Send me an existing photo and I match the background, framing and lighting as closely as possible.",
      },
      {
        q: "How long does a team session take?",
        a: "About 5 to 10 minutes per person once the setup is in place. Setup takes about 30 minutes.",
      },
    ],
    neighbors: ["spring-valley", "airmont", "ramapo", "rockland-county"],
  },
  {
    slug: "nanuet",
    name: "Nanuet",
    fullName: "Nanuet, NY",
    kind: "hamlet",
    zips: ["10954"],
    title: "Headshots in Nanuet, NY | Meilech Biller",
    description:
      "Headshot photographer serving Nanuet, NY 10954. Studio headshots 10 minutes away in Spring Valley, or on-location sessions for offices and businesses along Route 59 in Nanuet.",
    heading: "Headshots in Nanuet, NY",
    intro: [
      "Nanuet has a lot of offices, medical practices and retail along Route 59 and around the Shops at Nanuet. I photograph staff and business owners there on-site, and individuals in my Spring Valley studio about 10 minutes west.",
      "A common request from Nanuet is a set of matching headshots for a company website or a practice directory. I bring the same lighting and background to each session so photos taken months apart still match.",
    ],
    local: [
      "Studio sessions are in Spring Valley, roughly 10 minutes from Nanuet via Route 59.",
      "On-site sessions for offices near Route 59, Middletown Road and the Shops at Nanuet.",
      "Corporate parks and medical buildings near the Palisades Parkway are covered without a travel fee.",
      "Clarkstown residents from West Nyack, Bardonia and Pearl River book the same way.",
    ],
    commonRequests: [
      "Company website and directory headshots",
      "Medical, dental and physical therapy practice staff",
      "Financial advisors, insurance agents and attorneys",
      "LinkedIn photos for commuters",
      "Retail and restaurant owner portraits",
    ],
    faq: [
      {
        q: "Do you come to offices in Nanuet?",
        a: "Yes. For two or more people I set up a small studio at your office. Nanuet is covered without a travel fee.",
      },
      {
        q: "We hire people throughout the year. Can new staff get matching photos?",
        a: "Yes. New hires can come to the studio or be photographed at your next on-site date, and I match the original setup.",
      },
    ],
    neighbors: ["new-city", "spring-valley", "rockland-county"],
  },
  {
    slug: "new-city",
    name: "New City",
    fullName: "New City, NY",
    kind: "hamlet",
    zips: ["10956"],
    title: "Headshots in New City, NY | Meilech Biller",
    description:
      "Headshot photographer for New City, NY 10956, the Rockland County seat. Headshots for attorneys, county and town staff, agents and business owners, in studio or at your office.",
    heading: "Headshots in New City, NY",
    intro: [
      "New City is the county seat, so many of my clients from there are attorneys, title and real estate professionals, and people who work for the county or the Town of Clarkstown. They usually need a clean, conservative headshot for a firm website, a bar directory or LinkedIn.",
      "Individual sessions are in my Spring Valley studio, about 15 minutes away. For law firms and offices near the courthouse on New Hempstead Road, I set up on-site so the whole firm can be photographed in one visit.",
    ],
    local: [
      "On-site sessions for firms and offices around Main Street, New Hempstead Road and Little Tor Road.",
      "Studio sessions in Spring Valley, about 15 minutes by Route 304 and Route 59.",
      "Formal, neutral backgrounds are the usual choice for legal and professional clients.",
      "Evening sessions are available for people who cannot leave the office during the day.",
    ],
    commonRequests: [
      "Attorney and law firm headshots",
      "Real estate agents and title company staff",
      "Government and municipal staff photos",
      "Accountants and financial planners",
      "Website and LinkedIn photos for local business owners",
    ],
    faq: [
      {
        q: "Can you photograph our entire law firm in one day?",
        a: "Yes. A firm of 10 to 20 people takes about two to three hours on-site, including setup.",
      },
      {
        q: "Do you offer a plain white or gray background?",
        a: "Yes. White, light gray, dark gray and a neutral office look are all available, in the studio and on-site.",
      },
    ],
    neighbors: ["nanuet", "spring-valley", "rockland-county"],
  },
  {
    slug: "airmont",
    name: "Airmont",
    fullName: "Airmont, NY",
    kind: "village",
    zips: ["10952", "10901", "10977"],
    title: "Headshots in Airmont, NY | Meilech Biller",
    description:
      "Headshot photographer for Airmont, NY. Studio headshots a few minutes away in Spring Valley, or on-location sessions for offices along Route 59 and Airmont Road in the village.",
    heading: "Headshots in Airmont, NY",
    intro: [
      "Airmont sits between Suffern and Spring Valley, and it is one of the closest villages to my studio. Most Airmont clients come to the studio; the drive along Route 59 is about five minutes.",
      "Airmont's offices and medical buildings along Route 59 and Airmont Road also book on-site sessions, especially when several staff members need photos at once.",
    ],
    local: [
      "Studio sessions about 5 minutes from Airmont in Spring Valley.",
      "On-site sessions for offices near Route 59, Airmont Road and Saddle River Road.",
      "Residents from Tallman, Hillcrest and Chestnut Ridge book the same way.",
      "Sessions before and after regular business hours are available.",
    ],
    commonRequests: [
      "LinkedIn and business headshots",
      "Medical and dental office staff",
      "Real estate professionals",
      "Small business owner portraits for websites",
    ],
    faq: [
      {
        q: "Is the studio close to Airmont?",
        a: "Yes. It is in Spring Valley, about five minutes from the village along Route 59.",
      },
      {
        q: "Can I get one retouched photo quickly for a job application?",
        a: "Yes. The Essential package is a 30-minute session with two retouched images, usually delivered within two business days.",
      },
    ],
    neighbors: ["suffern", "spring-valley", "monsey", "ramapo"],
  },
  {
    slug: "suffern",
    name: "Suffern",
    fullName: "Suffern, NY",
    kind: "village",
    zips: ["10901"],
    title: "Headshots in Suffern, NY | Meilech Biller",
    description:
      "Headshot photographer serving Suffern, NY 10901. Headshots for hospital and medical staff, business owners and commuters, on-site in Suffern or 15 minutes away in the studio.",
    heading: "Headshots in Suffern, NY",
    intro: [
      "Suffern clients are often medical staff from Good Samaritan Hospital and the practices around it, business owners on Lafayette Avenue, and commuters who need a LinkedIn photo. It is about 15 minutes from my Spring Valley studio along Route 59.",
      "For hospitals, practices and offices in Suffern I set up on-site. For one or two people the studio is quicker. Suffern is at the New Jersey line, and Mahwah and Ramsey offices are also within reach; ask about travel.",
    ],
    local: [
      "On-site sessions for medical practices near Good Samaritan Hospital and offices along Route 59 and Lafayette Avenue.",
      "Studio sessions in Spring Valley, about 15 minutes east.",
      "Hillburn, Sloatsburg and Montebello are covered without a travel fee.",
      "White-coat and scrubs portraits for medical directories are common; bring the coat and I light for it.",
    ],
    commonRequests: [
      "Physician, nurse and practice staff headshots",
      "Business owner and restaurant portraits for Lafayette Avenue storefronts",
      "LinkedIn photos for people commuting to New Jersey and the city",
      "Team photos for offices in the Route 59 corridor",
    ],
    faq: [
      {
        q: "Can you photograph medical staff on-site during a shift?",
        a: "Yes. On-site sessions are scheduled so each person needs only about 10 minutes. I can work around shift changes.",
      },
      {
        q: "Do you travel into New Jersey from Suffern?",
        a: "Yes, Bergen County is possible. There may be a travel fee depending on distance; ask when you book.",
      },
    ],
    neighbors: ["airmont", "ramapo", "spring-valley", "rockland-county"],
  },
  {
    slug: "ramapo",
    name: "Ramapo",
    fullName: "Town of Ramapo, NY",
    kind: "town",
    zips: ["10952", "10977", "10901", "10970", "10974", "10982"],
    title: "Headshots in the Town of Ramapo, NY | Meilech Biller",
    description:
      "Headshot photographer based in the Town of Ramapo, NY. Studio in Spring Valley and on-site sessions in Monsey, Airmont, Suffern, Pomona, Sloatsburg, Wesley Hills and New Hempstead.",
    heading: "Headshots in the Town of Ramapo, NY",
    intro: [
      "The Town of Ramapo covers most of western Rockland County: Spring Valley, Monsey, Airmont, Suffern, Pomona, Wesley Hills, New Hempstead, Chestnut Ridge, Hillburn, Sloatsburg, Montebello and Kaser. My studio is in Spring Valley, so every part of Ramapo is close.",
      "Town of Ramapo clients include business owners, real estate offices, schools, camps, nonprofits and medical practices. Individuals come to the studio; groups are photographed where they work.",
    ],
    local: [
      "Studio in Spring Valley, central to the town.",
      "On-site sessions anywhere in Ramapo without a travel fee.",
      "Sessions for school and camp staff can be scheduled early in the season so photos are ready for websites and handbooks.",
      "Evening and Sunday availability.",
    ],
    commonRequests: [
      "Staff photos for schools, camps and community organizations",
      "Business and real estate headshots",
      "Medical and therapy practice staff",
      "LinkedIn and resume photos",
      "Portraits for journals, dinners and printed programs",
    ],
    faq: [
      {
        q: "Which villages in Ramapo do you cover?",
        a: "All of them: Spring Valley, Airmont, Suffern, Pomona, Wesley Hills, New Hempstead, Chestnut Ridge, Hillburn, Sloatsburg, Montebello and Kaser, plus the hamlets of Monsey, Tallman and Viola.",
      },
      {
        q: "Can an organization get a group rate?",
        a: "Yes. The Team package is priced per person with a five-person minimum. Larger groups get a quote.",
      },
    ],
    neighbors: ["spring-valley", "monsey", "airmont", "suffern", "rockland-county"],
  },
];

export function getArea(slug: string) {
  return areas.find((a) => a.slug === slug);
}

export const townAreas = areas.filter((a) => a.slug !== "rockland-county");
