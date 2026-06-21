/**
 * Single source of truth for all editable site copy.
 * Edit this file to update dates, prizes, contacts, FAQ, etc.
 * No need to touch component code for content changes.
 */

import {
  Brain,
  Eye,
  MessageSquareText,
  LineChart,
  Sparkles,
  Lightbulb,
  Trophy,
  Medal,
  Award,
  Target,
  Users,
  Rocket,
  ShieldCheck,
} from "lucide-react";

export const site = {
  name: "Byte Brainiacs",
  event: "ML Showdown",
  tagline: "The ML Showdown",
  url: "https://bytebrainiacs.example.com",
  org: "Department of Information Technology",
  college: "SVKM's Narsee Monjee College of Commerce & Economics",
  shortCollege: "NM College",

  hero: {
    headline: "Where Future ML Innovators Compete",
    sub: "India's premier machine learning challenge bringing together brilliant minds, innovative solutions, and real-world AI applications.",
    // Dates are placeholders — edit freely.
    season: "August 2026",
  },

  // Animated count-up statistics
  stats: [
    { label: "Teams", value: 75, suffix: "+" },
    { label: "Participants", value: 150, suffix: "+" },
    { label: "Problem Statement", value: 1, suffix: "" },
    { label: "Winner", value: 1, suffix: "" },
  ],

  about: {
    eyebrow: "About the showdown",
    title: "An arena built for machine intelligence",
    paragraphs: [
      "Byte Brainiacs is the flagship technology initiative of the Department of Information Technology at SVKM's Narsee Monjee College of Commerce & Economics — a community where students push the boundaries of data, models, and applied AI.",
      "ML Showdown is its marquee competition: a multi-stage machine learning gauntlet that takes teams from raw datasets to deployable solutions. Compete across real-world tracks, defend your approach before expert judges, and ship work that matters.",
    ],
    objectives: [
      {
        icon: Target,
        title: "Apply, don't just theorize",
        body: "Translate models into solutions for problems that mirror industry and research.",
      },
      {
        icon: Users,
        title: "Build with the best",
        body: "Form teams, exchange ideas, and grow alongside a serious ML community.",
      },
      {
        icon: Rocket,
        title: "Ship under pressure",
        body: "Iterate fast through preliminary and final rounds judged on rigor and impact.",
      },
      {
        icon: ShieldCheck,
        title: "Earn real recognition",
        body: "Win prizes, certificates, and a portfolio piece backed by an academic stage.",
      },
    ],
  },

  timeline: [
    {
      phase: "01",
      title: "Registration",
      window: "Opens August 2026",
      body: "Enter solo, as a duo, or as a team of three. Sign up and submit your details. Free to enter.",
    },
    {
      phase: "02",
      title: "Shortlisting",
      window: "Late August 2026",
      body: "Submissions are screened; qualifying teams are notified by email.",
    },
    {
      phase: "03",
      title: "Preliminary Round",
      window: "September 2026",
      body: "Online briefing of the event — what to expect, rules, and how the rounds unfold.",
    },
    {
      phase: "04",
      title: "Final Round",
      window: "September 2026",
      body: "On-campus finale. Live build sprint and presentation before the jury.",
    },
    {
      phase: "05",
      title: "Winner Announcement",
      window: "October 2026",
      body: "Winners, runners-up, and special awards revealed at the closing ceremony.",
    },
  ],

  tracks: [
    {
      icon: Eye,
      title: "Computer Vision",
      body: "Detection, segmentation, and visual understanding on real image and video data.",
      tag: "CV",
    },
    {
      icon: MessageSquareText,
      title: "Natural Language Processing",
      body: "Build systems that read, reason over, and generate human language.",
      tag: "NLP",
    },
    {
      icon: LineChart,
      title: "Predictive Analytics",
      body: "Forecast, classify, and uncover signal in structured, tabular datasets.",
      tag: "Tabular",
    },
    {
      icon: Sparkles,
      title: "Generative AI",
      body: "Design with diffusion, transformers, and LLMs to create something new.",
      tag: "GenAI",
    },
    {
      icon: Lightbulb,
      title: "Open Innovation",
      body: "No constraints. Bring any ML idea that solves a problem worth solving.",
      tag: "Open",
    },
  ],

  prizes: [
    {
      icon: Trophy,
      rank: "Winner",
      amount: "Prize",
      accent: "gold",
      perks: ["Special Prize", "Certificates", "Mentorship spotlight"],
    },
    {
      icon: Medal,
      rank: "Runner Up",
      amount: "Prize",
      accent: "silver",
      perks: ["Runner-up trophy", "Certificates", "Goodies"],
    },
    {
      icon: Award,
      rank: "Special Awards",
      amount: "Prize",
      accent: "violet",
      perks: ["Best Rookie Team", "Most Innovative", "People's Choice"],
    },
  ],
  prizePoolNote:
    "Special prizes, certificates, and goodies await our winners, runners-up, and special award categories.",

  faq: [
    {
      q: "Who can participate?",
      a: "Any undergraduate or postgraduate student is welcome. Teams may be from a single college or mixed across colleges, subject to the rules shared at registration.",
    },
    {
      q: "What is the team size?",
      a: "You can enter solo (1), as a duo (2), or as a team of three. Solo entrants can also be grouped into teams by the organizers before the rounds begin.",
    },
    {
      q: "Is there a registration fee?",
      a: "No. Registration for ML Showdown is free. You only need a team and an idea.",
    },
    {
      q: "What should we know before the preliminary round?",
      a: "Comfort with Python and a core ML stack (e.g. scikit-learn, PyTorch or TensorFlow) is recommended. Problem statements and datasets are released at the start of each round.",
    },
    {
      q: "Do all members need to be present for the final round?",
      a: "At least two members of each finalist team should attend the on-campus final round. Details are shared with shortlisted teams over email.",
    },
    {
      q: "How are submissions judged?",
      a: "On technical rigor, model performance, originality, real-world applicability, and the clarity of your presentation to the jury.",
    },
  ],

  contact: {
    // Placeholders — replace with official details.
    email: "bytebrainiacs@nmcollege.in",
    phone: "+91 00000 00000",
    location: "NM College, Vile Parle (W), Mumbai",
  },

  socials: {
    instagram: "https://www.instagram.com/byte_brainiacs/",
    linkedin:
      "https://www.linkedin.com/in/department-of-information-technology-svkm-s-narsee-monjee-college-125555376/",
  },

  brainIcon: Brain,
};

export type Site = typeof site;
