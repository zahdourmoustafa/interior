import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "ArchiCassoAI",
  description: "Transform your space with AI-powered interior design",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Interior Design", "AI", "Next.js", "React", "Tailwind CSS"],
  links: {
    email: "support@archicassoai.com",
    twitter: "https://twitter.com/archicassoai",
    discord: "https://discord.gg/archicassoai",
    github: "https://github.com/archicassoai",
    instagram: "https://instagram.com/archicassoai/",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "AI-Powered Interior Design",
          description: "Transform your space with intelligent design automation.",
          href: "#",
        },
        items: [
          {
            href: "#",
            title: "Room Redesign",
            description: "Redesign any room with AI-powered suggestions.",
          },
          {
            href: "#",
            title: "Furniture Placement",
            description: "Optimize your furniture layout with AI insights.",
          },
          {
            href: "#",
            title: "Style Matching",
            description: "AI-powered style matching for your preferences.",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "For Homeowners",
            href: "#",
            description: "Transform your home with AI design assistance.",
          },
          {
            title: "For Real Estate",
            href: "#",
            description: "Stage properties virtually with AI technology.",
          },
          {
            title: "For Designers",
            href: "#",
            description: "AI tools to enhance your design workflow.",
          },
          {
            title: "For Architects",
            href: "#",
            description: "Integrate AI into your architectural designs.",
          },
          {
            title: "For Contractors",
            href: "#",
            description: "Visualize projects before construction begins.",
          },
          {
            title: "For Students",
            href: "#",
            description: "Learn interior design with AI assistance.",
          },
        ],
      },
    },
    {
      href: "/blog",
      label: "Blog",
    },
  ],
  pricing: [
    {
      name: "Basic Plan",
      href: "#",
      price: "$19",
      originalPrice: "$22",
      period: "month",
      yearlyPrice: "$15.8",
      description: "Explore AI tools to elevate your design workflow.",
      credits: "1,000 Credits",
      creemProductId: "prod_5TBCtzyYf2Tscj5szrdY1y",
      features: [
        "100 Designs",
        "12 Videos",
        "200 text-to-render designs",
        "High resolution designs",
        "Save generated designs",
        "4K Upscaling",
        "Commercial use",
      ],
    },
    {
      name: "Pro Plan",
      href: "#",
      price: "$39",
      originalPrice: "$49",
      period: "month",
      yearlyPrice: "$32.5",
      description: "Generate amazing designs and visuals at fraction of cost.",
      credits: "5,000 Credits",
      creemProductId: "prod_4iQOMKeKCamCrX4tAK15N9",
      features: [
        "500 Designs",
        "65 Videos",
        "1000 text-to-render designs",
        "High resolution designs",
        "Save generated designs",
        "4K Upscaling",
        "Commercial use",
      ],
      isPopular: true,
    },
    {
      name: "Expert Plan",
      href: "#",
      price: "$79",
      originalPrice: "$99",
      period: "month",
      yearlyPrice: "$65.8",
      description: "Optimize your design workflow and serve your clients fast.",
      credits: "10,000 Credits",
      creemProductId: "prod_32FFPjxTeZSLIdHHNscTkz",
      features: [
        "1000 Designs",
        "130 Videos",
        "2000 text-to-render designs",
        "High resolution designs",
        "Save generated designs",
        "4K Upscaling",
        "Commercial use",
      ],
    },
  ],
  footer: [
    {
      title: "Product",
      items: [
        {
          title: "Features",
          href: "#",
        },
        {
          title: "Pricing",
          href: "#",
        },
        {
          title: "API",
          href: "#",
        },
        {
          title: "Documentation",
          href: "#",
        },
      ],
    },
    {
      title: "Company",
      items: [
        {
          title: "About",
          href: "#",
        },
        {
          title: "Blog",
          href: "#",
        },
        {
          title: "Careers",
          href: "#",
        },
        {
          title: "Contact",
          href: "#",
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          title: "Help Center",
          href: "#",
        },
        {
          title: "Community",
          href: "#",
        },
        {
          title: "Tutorials",
          href: "#",
        },
        {
          title: "Support",
          href: "#",
        },
      ],
    },
    {
      title: "Legal",
      items: [
        {
          title: "Privacy",
          href: "#",
        },
        {
          title: "Terms",
          href: "#",
        },
        {
          title: "Security",
          href: "#",
        },
        {
          title: "Cookies",
          href: "#",
        },
      ],
    },
  ],
  socials: [
    {
      name: "Twitter",
      href: "https://twitter.com/archicassoai",
      icon: FaTwitter,
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@archicassoai",
      icon: FaYoutube,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/archicassoai",
      icon: RiInstagramFill,
    },
  ],
};

export type SiteConfig = typeof siteConfig;

export interface PricingPlan {
  name: string;
  href: string;
  price: string;
  originalPrice: string;
  period: string;
  yearlyPrice: string;
  yearlyOriginalPrice?: string;
  description: string;
  credits: string;
  features: string[];
  isPopular?: boolean;
  creemProductId?: string;
  creemMonthlyPriceId?: string;
  creemYearlyPriceId?: string;
} 