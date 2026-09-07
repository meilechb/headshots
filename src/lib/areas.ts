/**
 * Local landing pages. Each entry is written for one place in Rockland County
 * and is reached from search engines and the sitemap only: the pages are not
 * linked from the header, footer or home page.
 *
 * Facts checked against public sources (village websites, county pages,
 * transit and health-facility listings). Travel times are approximate.
 */

export type Faq = { q: string; a: string };
export type Section = { heading: string; paragraphs: string[] };

export type Area = {
  slug: string;
  name: string;
  fullName: string;
  title: string; // browser tab and search result title
  description: string; // search result description
  heading: string; // H1
  lead: string;
  sections: Section[];
  places: string[]; // neighborhoods, roads, landmarks used as landmarks in copy
  zips: string[];
  faq: Faq[];
  neighbors: string[];
  defaultLocation: "studio" | "on-site" | "either";
};

const studio = "Spring Valley";

export const areas: Area[] = [
  {
    slug: "rockland-county",
    name: "Rockland County",
    fullName: "Rockland County, NY",
    title: "Headshot Photographer in Rockland County, NY",
    description:
      "Headshots for business, LinkedIn, teams and actors anywhere in Rockland County, NY. Studio in Spring Valley, on-site sessions in all five towns, no travel fee. Proofs online in 1–2 days.",
    heading: "Headshot photographer for all of Rockland County",
    lead:
      "I photograph headshots across Rockland County: in my studio in Spring Valley, or at your office in Clarkstown, Ramapo, Orangetown, Haverstraw or Stony Point. Same price everywhere in the county, no travel fee, proofs online within one or two business days.",
    sections: [
      {
        heading: "Studio or your office",
        paragraphs: [
          "For one person, the studio in Spring Valley is the simplest option. It is a few minutes off Route 59 and Route 45, with parking. A session takes 30 to 90 minutes depending on the package.",
          "For on-site sessions, I bring the studio to you. The kit is a background, two lights and a laptop, and it sets up in about 20 minutes in a conference room, lobby or spare office. Each person needs 10 to 15 minutes, so a team of twelve is done in a morning.",
        ],
      },
      {
        heading: "Who I photograph in the county",
        paragraphs: [
          "Attorneys and accountants near the county courthouse in New City. Medical and dental practices along Route 59 from Suffern through Nanuet, and staff at Good Samaritan Hospital in Suffern and Montefiore Nyack. Real estate agents who need a photo for listings and signs. Companies in the office parks in Pearl River, Nanuet and West Nyack. School and organization staff who need matching photos for a website or journal.",
          "I also photograph actors, students applying to programs, and anyone who needs a current photo for LinkedIn or a company bio.",
        ],
      },
      {
        heading: "How delivery works",
        paragraphs: [
          "Proofs are posted to a private online gallery protected by a code. You mark the frames you want and leave a note on any of them. Retouched files are delivered to the same gallery within two to three business days, sized for the web and for print. Team galleries are shared with one link so an office manager can collect everyone's picks.",
        ],
      },
      {
        heading: "Hours",
        paragraphs: [
          "Sessions run Sunday through Thursday, plus Friday mornings. Evenings are available on request. The studio is closed Friday afternoon and Saturday.",
        ],
      },
    ],
    places: ["New City", "Nanuet", "Spring Valley", "Monsey", "Suffern", "Pearl River", "Nyack", "West Nyack", "Haverstraw", "Stony Point"],
    zips: [],
    faq: [
      {
        q: "Do you charge for travel within Rockland County?",
        a: "No. On-site sessions anywhere in Rockland County are the same price as the studio. Bergen County, NJ and Westchester are quoted separately.",
      },
      {
        q: "How much space does an on-site session need?",
        a: "About 8 by 10 feet with a plain wall or room for a background, and an outlet. A conference room works. I bring everything else.",
      },
      {
        q: "Can everyone on the team have the same background?",
        a: "Yes. That is the reason to do it on-site in one session: same light, same background, same distance, so the staff page looks uniform even when people join later and I match the setup.",
      },
      {
        q: "How soon can you come out?",
        a: "Usually within one to two weeks. Send the form with a few dates that work and I confirm within one business day.",
      },
    ],
    neighbors: ["spring-valley", "monsey", "nanuet", "new-city", "suffern"],
    defaultLocation: "either",
  },
  {
    slug: "spring-valley",
    name: "Spring Valley",
    fullName: "Spring Valley, NY",
    title: "Headshots in Spring Valley, NY | Studio Sessions",
    description:
      "Headshot studio in Spring Valley, NY 10977. Business, LinkedIn and professional headshots, $250 in the studio, retouching included. Walk-in distance from Main Street and Route 59; on-site sessions for offices, clinics and schools.",
    heading: "Headshots in Spring Valley, NY",
    lead:
      "The studio is in Spring Valley, so this is the easiest place to get a headshot in Rockland County. Sessions take 30 to 90 minutes and proofs are online within one or two business days. For offices, clinics and schools in the village I also come to you.",
    sections: [
      {
        heading: "Getting to the studio",
        paragraphs: [
          `The studio is in ${studio}, minutes from Main Street, Route 45 and Route 59, and about five minutes from the Spring Valley bus and train terminal. There is parking. The exact address is in your booking confirmation.`,
          "If you come from work, allow 45 minutes door to door for the Essential package and about an hour and a half for the Professional package. You can change in the studio; bring your outfits on hangers.",
        ],
      },
      {
        heading: "Who gets headshots in Spring Valley",
        paragraphs: [
          "Spring Valley is the busiest business district in Ramapo. I photograph owners and staff of stores and offices along Main Street and Route 59, insurance and tax offices, real estate agents, and home-based businesses that need one good photo for a website, a flyer or a WhatsApp business profile.",
          "Medical and dental practices in the village, including the practices around Refuah Health Center on North Main Street, book on-site sessions so providers can be photographed between patients in matching light. Schools and nonprofits in the village book staff sessions in a morning.",
        ],
      },
      {
        heading: "Languages and comfort",
        paragraphs: [
          "Directions during the session are simple and I show you the frames on the back of the camera as we go, so you see what is working. Sessions are unhurried; there is no one waiting behind you.",
        ],
      },
      {
        heading: "Hours",
        paragraphs: [
          "Sunday through Thursday, plus Friday mornings. Evening sessions are available Sunday through Thursday on request. Closed Friday afternoon and Saturday.",
        ],
      },
    ],
    places: ["Main Street", "Route 45", "Route 59", "North Main Street", "Spring Valley terminal", "Hillcrest"],
    zips: ["10977"],
    faq: [
      {
        q: "Can I come in the same week?",
        a: "Often yes. Individual sessions are usually available within a few days. Send the form with two or three times that work.",
      },
      {
        q: "Is there parking at the studio?",
        a: "Yes, free parking at the building. Directions and parking notes are in your confirmation email.",
      },
      {
        q: "I need a photo for a passport or visa too. Can you do that in the same session?",
        a: "Yes. A plain-background compliance photo can be added to any session; tell me the country and document when you book so I use the right size.",
      },
      {
        q: "Do you photograph men and women in separate sessions?",
        a: "Every session is private: one person or one group at a time, with the door closed. If you prefer a specific arrangement, say so when booking and I will accommodate it.",
      },
    ],
    neighbors: ["monsey", "airmont", "nanuet", "ramapo", "rockland-county"],
    defaultLocation: "studio",
  },
  {
    slug: "monsey",
    name: "Monsey",
    fullName: "Monsey, NY",
    title: "Headshots in Monsey, NY | Business & LinkedIn Photos",
    description:
      "Headshot photographer serving Monsey, NY 10952. Business, LinkedIn and professional headshots five minutes away in the Spring Valley studio, or on-site at your Monsey office, school or practice.",
    heading: "Headshots in Monsey, NY",
    lead:
      "Monsey is a five-minute drive from my studio in Spring Valley, so most people from Monsey come in for a 30 to 90 minute session. Offices, schools and practices along Route 59 and Route 306 book on-site sessions where I set up in a spare room and photograph the whole staff in a morning.",
    sections: [
      {
        heading: "From Monsey to the studio",
        paragraphs: [
          "From Route 59 in Monsey it is about five minutes east to the studio; from Route 306 and Wesley Hills about ten. Sessions are available Sunday through Thursday and Friday morning, with evenings on request, so you can come after work or after seder without missing a day.",
          "Bring two or three outfits. Solid colors in dark or medium tones photograph best; a jacket and a plain shirt or blouse cover most uses. I will tell you what to wear in the confirmation email.",
        ],
      },
      {
        heading: "Who books from Monsey",
        paragraphs: [
          "Real estate agents and mortgage brokers who need a photo for listings, signs and business cards. Owners of the many small and home-based businesses in Monsey who need a current photo for a website, an ad or a WhatsApp business profile. Accountants, insurance agents and attorneys with offices on Route 59. Therapists, tutors and coaches who need a warm, approachable photo for their profile.",
          "Yeshivas, schools and organizations in Monsey book staff photo days: I set up in an office or classroom and photograph staff one at a time so the website, journal or directory has matching photos. Photos for a dinner journal or an ad can be delivered the same week if you tell me the deadline.",
        ],
      },
      {
        heading: "Privacy",
        paragraphs: [
          "Every session is private. Nothing is posted anywhere unless you ask me to. If you prefer a same-gender photographer setup or a chaperone present, say so when booking and it is arranged.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Proofs go to a private online gallery, usually the next business day. You pick, and retouched files follow within two to three business days. Files are sized for LinkedIn, websites and print. If you need a specific crop for a listing service or a journal, tell me and I will include it.",
        ],
      },
    ],
    places: ["Route 59", "Route 306", "Wesley Hills", "Kaser", "New Square", "Viola"],
    zips: ["10952"],
    faq: [
      {
        q: "Do you come to Monsey for one person?",
        a: "The studio is five minutes away, so for one person the studio is quicker and the light is better controlled. For three or more people I come to you at no extra charge.",
      },
      {
        q: "Can I get the photo the same day?",
        a: "If you have a deadline, say so when booking. A quick-turn edited photo can usually be delivered the same or next day for an additional fee.",
      },
      {
        q: "What do you charge?",
        a: "An individual headshot in the studio is $250. For groups or on-site sessions, send the form and I quote it.",
      },
      {
        q: "Do you photograph children or families?",
        a: "I focus on headshots for adults and staff. For a school that needs student photos, ask and I will tell you whether it fits.",
      },
    ],
    neighbors: ["spring-valley", "airmont", "ramapo", "suffern", "rockland-county"],
    defaultLocation: "studio",
  },
  {
    slug: "nanuet",
    name: "Nanuet",
    fullName: "Nanuet, NY",
    title: "Headshots in Nanuet, NY | Office & LinkedIn Photos",
    description:
      "Headshot photographer for Nanuet, NY 10954. On-site team and office headshots along Route 59 and Route 304, or individual sessions 15 minutes away in Spring Valley. Retouching and online delivery included.",
    heading: "Headshots in Nanuet, NY",
    lead:
      "Nanuet has more offices than any other hamlet in Clarkstown, and most of my Nanuet work is on-site: I set up in a conference room and photograph the staff of a company, a medical practice or a bank branch in a morning. For one person, the studio in Spring Valley is about 15 minutes west on Route 59.",
    sections: [
      {
        heading: "On-site in Nanuet offices",
        paragraphs: [
          "The offices along Route 59 and Route 304, the medical and dental practices near The Shops at Nanuet, and the businesses around the Nanuet train station on Prospect Street are all a short drive from the studio, so I can be set up by 8:30 for a session before the workday starts. The setup needs a room about 8 by 10 feet and an outlet.",
          "Each person takes 10 to 15 minutes. Everyone is photographed with the same background and light so the staff page or directory matches. New hires later are photographed in the studio against the same setup and slotted in.",
        ],
      },
      {
        heading: "Who books from Nanuet",
        paragraphs: [
          "Companies with offices on Route 59 and Route 304 that need a consistent team page. Medical, dental and physical therapy practices that want matching provider photos for their website and insurance directories. Bank branch and financial-advisor teams. Retail managers at The Shops at Nanuet and nearby plazas who need a corporate photo. Commuters on the Pascack Valley Line who work in Manhattan or Hoboken and need a LinkedIn photo but do not want to book a Manhattan studio.",
        ],
      },
      {
        heading: "Individual sessions",
        paragraphs: [
          "For one person, come to the studio in Spring Valley: Route 59 west, about 15 minutes from Nanuet, with parking. Sessions run Sunday through Thursday, Friday mornings, and evenings on request, so you can come after the train.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Proofs are posted to a private gallery within one or two business days. For teams, one shared link goes to the office manager and each person can mark their own pick. Retouched files follow within two to three business days.",
        ],
      },
    ],
    places: ["Route 59", "Route 304", "The Shops at Nanuet", "Prospect Street", "Nanuet station", "Bardonia", "West Nyack"],
    zips: ["10954"],
    faq: [
      {
        q: "How long does a team session at our Nanuet office take?",
        a: "About 20 minutes to set up, then 10 to 15 minutes per person. A team of ten is finished in about two and a half hours.",
      },
      {
        q: "We are near the Palisades Center in West Nyack. Is that still no travel fee?",
        a: "Yes. West Nyack, Nanuet, Bardonia and all of Clarkstown are within the county, so there is no travel fee.",
      },
      {
        q: "Can you match photos we already have?",
        a: "Usually. Send me one of the existing photos before the session and I will match the background tone and crop as closely as the setup allows.",
      },
      {
        q: "Do you offer a group photo of the team as well?",
        a: "Yes. A group photo can be added to any on-site session; allow an extra 15 minutes and a space with a clean wall or an outdoor spot.",
      },
    ],
    neighbors: ["new-city", "spring-valley", "rockland-county", "monsey", "airmont"],
    defaultLocation: "on-site",
  },
  {
    slug: "new-city",
    name: "New City",
    fullName: "New City, NY",
    title: "Headshots in New City, NY | Attorneys, Offices & Teams",
    description:
      "Headshot photographer for New City, NY 10956. Professional photos for attorneys and offices near the Rockland County courthouse, team sessions at your New City office, or studio sessions in Spring Valley.",
    heading: "Headshots in New City, NY",
    lead:
      "New City is the county seat, and much of my work there is for law firms, accountants and county-related offices near the courthouse on South Main Street. I come to your office for teams, or you come to the studio in Spring Valley, about 15 minutes away.",
    sections: [
      {
        heading: "Attorneys and professional offices",
        paragraphs: [
          "Firms on Main Street, New Hempstead Road and Route 304 near the Rockland County Courthouse book on-site sessions so partners and associates are photographed on the same day against the same background. Photos are delivered in the crops attorney directories and the firm website need.",
          "For a solo practitioner, a studio session is the better use of time: 30 to 60 minutes, two or three looks, and a photo that works for the bar directory, LinkedIn and the website.",
        ],
      },
      {
        heading: "Other New City clients",
        paragraphs: [
          "Real estate agents working the New City, Congers and Bardonia markets. Financial advisors and insurance agents. Medical and dental practices on Route 304. Clarkstown school and town staff who need a photo for a directory. Parents of students who need a photo for college or program applications.",
        ],
      },
      {
        heading: "Getting to the studio from New City",
        paragraphs: [
          "Route 304 south to Route 59 west, or New Hempstead Road west to Route 45, about 15 minutes either way. Parking at the building. Sessions Sunday through Thursday, Friday mornings, evenings on request.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Proofs online within one or two business days, retouched files within two to three business days after you pick. Firms get one shared gallery so an administrator can collect picks and download everything at once.",
        ],
      },
    ],
    places: ["South Main Street", "Rockland County Courthouse", "New Hempstead Road", "Route 304", "Congers", "Bardonia", "Lake DeForest"],
    zips: ["10956"],
    faq: [
      {
        q: "Can you photograph our whole firm in one visit?",
        a: "Yes. Set aside a conference room for a morning; each person takes 10 to 15 minutes and can go straight back to work.",
      },
      {
        q: "We need photos for a court directory with specific dimensions.",
        a: "Tell me the requirements when you book and the files are delivered in that size in addition to the standard web and print versions.",
      },
      {
        q: "Is retouching included?",
        a: "Yes, on every package. It is kept natural: skin, stray hairs, glare on glasses. Faces are not reshaped.",
      },
      {
        q: "How far ahead should we book?",
        a: "One to two weeks is typical for a team session. Individuals can usually be seen within a few days.",
      },
    ],
    neighbors: ["nanuet", "spring-valley", "rockland-county", "monsey", "suffern"],
    defaultLocation: "on-site",
  },
  {
    slug: "airmont",
    name: "Airmont",
    fullName: "Airmont, NY",
    title: "Headshots in Airmont, NY | Studio 10 Minutes Away",
    description:
      "Headshot photographer for Airmont, NY (10901 and 10952). Business and LinkedIn headshots ten minutes away in Spring Valley, or on-site for offices along Route 59 and Airmont Road. Retouching included.",
    heading: "Headshots in Airmont, NY",
    lead:
      "Airmont is a small village between Monsey and Suffern, and my studio in Spring Valley is about ten minutes up Route 59. Most Airmont clients come in for an individual session; offices along Route 59 and Airmont Road book on-site sessions for their staff.",
    sections: [
      {
        heading: "From Airmont to the studio",
        paragraphs: [
          "Route 59 east about ten minutes, or Route 306 to Route 45. Parking at the building. Sessions Sunday through Thursday, Friday mornings, evenings on request.",
        ],
      },
      {
        heading: "Who books from Airmont",
        paragraphs: [
          "Professionals who commute to Bergen County or Manhattan and need a LinkedIn photo without going into the city. Real estate and insurance agents working the Airmont, Tallman and Suffern area. Owners and staff of the businesses along Route 59 near the Ramapo Town Hall. Home-based consultants and therapists who need one good photo for their website.",
          "Offices and practices in Airmont with five or more people book an on-site session so the team page matches.",
        ],
      },
      {
        heading: "What to expect",
        paragraphs: [
          "Sessions are calm and directed. You do not need experience in front of a camera; I tell you where to look and when the expression is right, and I show you frames as we go. Bring two or three outfits in solid colors.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Proofs online within one or two business days. Pick your favorites in the gallery and retouched files follow within two to three business days, sized for web and print.",
        ],
      },
    ],
    places: ["Route 59", "Route 306", "Airmont Road", "Tallman", "Ramapo Town Hall"],
    zips: ["10901", "10952"],
    faq: [
      {
        q: "Which is faster for one person, studio or on-site?",
        a: "The studio. Ten minutes away, everything is set up, and the light is fully controlled. On-site makes sense for three or more people.",
      },
      {
        q: "Can I book an evening?",
        a: "Yes, Sunday through Thursday evenings on request. Say the time that works in the form.",
      },
      {
        q: "Do you photograph in Mahwah or elsewhere in Bergen County, NJ?",
        a: "Yes, with a travel fee quoted in advance. Everything in Rockland County has no travel fee.",
      },
      {
        q: "How many photos do I get?",
        a: "It depends on the package: two, five or ten retouched photos. You see every usable frame in the proof gallery and pick the ones you want retouched.",
      },
    ],
    neighbors: ["suffern", "monsey", "spring-valley", "ramapo", "rockland-county"],
    defaultLocation: "studio",
  },
  {
    slug: "suffern",
    name: "Suffern",
    fullName: "Suffern, NY",
    title: "Headshots in Suffern, NY | Medical, Business & Teams",
    description:
      "Headshot photographer for Suffern, NY 10901. On-site headshots for practices near Good Samaritan Hospital, offices on Lafayette Avenue and Route 59, staff at Rockland Community College; studio sessions in Spring Valley.",
    heading: "Headshots in Suffern, NY",
    lead:
      "Suffern sits at the western edge of Rockland, by the New Jersey line. Much of my Suffern work is medical: providers and staff at practices around Good Samaritan Hospital who need matching photos for the practice website and insurance directories. Offices on Lafayette Avenue and Route 59 book team sessions, and individuals drive 15 minutes east to the studio in Spring Valley.",
    sections: [
      {
        heading: "Medical and dental practices",
        paragraphs: [
          "Practices near Good Samaritan Hospital and along Route 59 book on-site sessions so every provider is photographed in the same light in a white coat, scrubs or business dress. I set up in an exam room or office and each provider takes about ten minutes between patients. Files are delivered in the sizes hospital directories and insurance networks ask for.",
        ],
      },
      {
        heading: "Offices, the college and downtown",
        paragraphs: [
          "Businesses on Lafayette Avenue and in the plazas along Route 59 book staff sessions. Faculty and staff at Rockland Community College on College Road need photos for department pages and conference bios. Commuters from the Suffern train station on the Port Jervis Line need a LinkedIn photo without a trip into Manhattan.",
        ],
      },
      {
        heading: "Individual sessions in the studio",
        paragraphs: [
          "Route 59 east about 15 minutes to Spring Valley. Parking at the building. Sessions Sunday through Thursday, Friday mornings, evenings on request.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Proofs are online within one or two business days. For a practice, one shared gallery goes to the office manager. Retouched files follow within two to three business days.",
        ],
      },
    ],
    places: ["Good Samaritan Hospital", "Lafayette Avenue", "Route 59", "Rockland Community College", "Suffern station", "Montebello", "Hillburn", "Mahwah"],
    zips: ["10901"],
    faq: [
      {
        q: "Can you photograph providers between patients?",
        a: "Yes. That is how most practice sessions run: I set up once, and each provider steps in for about ten minutes when they have a gap.",
      },
      {
        q: "White coat or business dress?",
        a: "Both, if you like. Many practices want one of each; it adds about two minutes per person.",
      },
      {
        q: "We are in Mahwah, just over the line. Do you come there?",
        a: "Yes, with a small travel fee quoted in advance. Suffern, Hillburn, Montebello and Sloatsburg are in the county and have no fee.",
      },
      {
        q: "How do we get the files to our website vendor?",
        a: "Download them from the gallery, or send me the vendor's email and I share the gallery link with them directly.",
      },
    ],
    neighbors: ["airmont", "monsey", "spring-valley", "ramapo", "rockland-county"],
    defaultLocation: "on-site",
  },
  {
    slug: "ramapo",
    name: "Ramapo",
    fullName: "Town of Ramapo, NY",
    title: "Headshots in the Town of Ramapo, NY | All Villages",
    description:
      "Headshot photographer based in the Town of Ramapo, NY. Studio in Spring Valley; on-site sessions in Monsey, Airmont, Suffern, Wesley Hills, New Hempstead, Montebello, Pomona, Chestnut Ridge, Kaser, New Square, Hillburn and Sloatsburg.",
    heading: "Headshots in the Town of Ramapo",
    lead:
      "My studio is in Spring Valley, inside the Town of Ramapo, so every village and hamlet in the town is a short drive: Monsey, Airmont, Suffern, Wesley Hills, New Hempstead, Montebello, Pomona, Chestnut Ridge, Kaser, New Square, Hillburn, Sloatsburg, Tallman, Viola and Hillcrest. Come to the studio for an individual session, or I come to your office, school or practice.",
    sections: [
      {
        heading: "One studio, every village",
        paragraphs: [
          "From most of Ramapo the studio is 5 to 15 minutes away. Sessions are 30 to 90 minutes, Sunday through Thursday, Friday mornings, and evenings on request. The studio is closed Friday afternoon and Saturday.",
        ],
      },
      {
        heading: "On-site across the town",
        paragraphs: [
          "Offices along Route 59 from Suffern through Airmont, Monsey and Spring Valley. Schools and organizations in Monsey, New Square, Kaser and Wesley Hills that need matching staff photos for a website, directory or journal. Practices and businesses in Pomona and Chestnut Ridge. Town and village staff. Setup takes about 20 minutes and each person 10 to 15 minutes.",
        ],
      },
      {
        heading: "What is included",
        paragraphs: [
          "Every package includes direction during the session, natural retouching, a private online proof gallery where you mark your picks, and full-resolution files sized for web and print. Prices are the same in the studio and on-site anywhere in the town.",
        ],
      },
      {
        heading: "Privacy and scheduling",
        paragraphs: [
          "Sessions are private, one person or one group at a time. Nothing is published without permission. If you have a deadline, such as a dinner journal or a listing going live, tell me when you book and I schedule the delivery around it.",
        ],
      },
    ],
    places: ["Spring Valley", "Monsey", "Airmont", "Suffern", "Wesley Hills", "New Hempstead", "Montebello", "Pomona", "Chestnut Ridge", "Kaser", "New Square", "Hillburn", "Sloatsburg", "Tallman", "Viola", "Hillcrest"],
    zips: ["10977", "10952", "10901", "10970", "10977", "10982"].filter((z, i, a) => a.indexOf(z) === i),
    faq: [
      {
        q: "Which villages do you cover without a travel fee?",
        a: "All of them. Every village and hamlet in the Town of Ramapo, and the rest of Rockland County, is included.",
      },
      {
        q: "Can a school get all its staff photographed in one day?",
        a: "Yes. A staff of 40 takes about a school day with one setup. Larger staffs are split over two days or two setups.",
      },
      {
        q: "How do I book?",
        a: "Send the form on this page with a few dates. I confirm within one business day, and a payment link holds the date.",
      },
      {
        q: "Do you keep the photos?",
        a: "Retouched files stay in your gallery for at least a year so you can re-download them. I keep the originals archived in case you need another frame retouched later.",
      },
    ],
    neighbors: ["spring-valley", "monsey", "airmont", "suffern", "rockland-county"],
    defaultLocation: "either",
  },
];

export const townAreas = areas.filter((a) => a.slug !== "rockland-county");

export function getArea(slug: string) {
  return areas.find((a) => a.slug === slug);
}
