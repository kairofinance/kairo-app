import { Suspense } from "react";
import {
  ArrowTrendingUpIcon,
  DocumentIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClockIcon,
  UserCircleIcon,
  CalendarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import SpinningLogo from "@/components/SpinningLogo";
import Image from "next/image";
import * as cheerio from "cheerio";
import PageTransition from "@/components/PageTransition";

// Placeholder data
async function getTotalPaid() {
  return "$1,234.56";
}

async function getStats() {
  return {
    streams: 12,
    vests: 8,
    invoices: 24,
  };
}

const featuredUsers = [
  { id: 1, address: "0x1234...5678", username: "haruxe" },
  { id: 2, address: "0x8765...4321", username: "frank" },
  { id: 3, address: "0x2468...1357", username: "sarah" },
  { id: 4, address: "0x1357...2468", username: "alex" },
  { id: 5, address: "0x9876...5432", username: "mike" },
  { id: 6, address: "0x5432...9876", username: "emma" },
  { id: 7, address: "0x3333...4444", username: "chris" },
  { id: 8, address: "0x4444...3333", username: "luna" },
  { id: 9, address: "0x5555...6666", username: "kai" },
  { id: 10, address: "0x6666...5555", username: "zoe" },
  { id: 11, address: "0x7777...8888", username: "max" },
  { id: 12, address: "0x8888...7777", username: "nova" },
];

// Function to fetch article metadata from Mirror URL
async function getArticleMetadata(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Get metadata
    const title = $('meta[property="og:title"]').attr("content");
    const description = $('meta[property="og:description"]').attr("content");
    const image = $('meta[property="og:image"]').attr("content");

    // Look for any span containing a date with year 2024 or later
    const dateRegex = /.*\b(202[4-9]|20[3-9]\d|\d{4})\b.*/; // Matches 2024-2029, 2030-2099, and beyond
    const dateText =
      $("span")
        .filter((_, el) => dateRegex.test($(el).text()))
        .first()
        .text()
        .trim() || "N/A";

    return {
      title,
      summary: description,
      imageUrl: image,
      date: dateText,
    };
  } catch (error) {
    console.error("Error fetching article metadata:", error);
    return null;
  }
}

const articleUrls = [
  "https://mirror.xyz/0xaF5CC495f412f71fe10052De7A1E8fe696c715Ee/PJfIz1sei2TAvZqk9Ed_Pb_Ehdz6JzrGhIqixH8KdZs",
];

// Add Featured DAOs data
const featuredDAOs = [
  {
    id: 1,
    name: "Optimism",
    address: "0x1234...5678",
    description: "Layer 2 scaling solution focused on Ethereum development",
  },
  {
    id: 2,
    name: "Arbitrum",
    address: "0x8765...4321",
    description: "Leading Layer 2 platform for scalable smart contracts",
  },
  {
    id: 3,
    name: "Base",
    address: "0x2468...1357",
    description: "Next-generation Layer 2 platform built on Optimism",
  },
  {
    id: 4,
    name: "Zora",
    address: "0x1357...2468",
    description: "Protocol for decentralized media and NFT infrastructure",
  },
];

export default async function Home() {
  const totalPaid = await getTotalPaid();
  const stats = await getStats();

  // Fetch metadata for each article
  const featuredNews = await Promise.all(
    articleUrls.map(async (url, index) => {
      const metadata = await getArticleMetadata(url);
      return {
        id: index + 1,
        title: metadata?.title || "Article Title",
        summary: metadata?.summary || "Article summary not available",
        date: metadata?.date || new Date().toLocaleDateString(),
        imageUrl: metadata?.imageUrl || "/news/default-cover.jpg",
        url,
      };
    })
  );

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 relative gap-6 outline-2 outline outline-white/[0.2] p-7">
            {/* Total Paid Section */}
            <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
              stats
            </h2>
            <div className="backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-7">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains">$</span>
                <h3 className="text-sm font-medium text-white/60 font-jetbrains">
                  total_paid
                </h3>
              </div>
              <Suspense fallback={<SpinningLogo />}>
                <div className="mt-4">
                  <p className="text-4xl font-jetbrains font-semibold text-white">
                    <span className="text-white/40">=</span> {totalPaid}
                  </p>
                  <p className="mt-2 text-sm font-jetbrains text-white/40">
                    # across all payment types
                  </p>
                </div>
              </Suspense>
            </div>

            {/* Activity Stats Section */}
            <div className="backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-7">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-jetbrains">&gt;</span>
                <h3 className="text-sm font-medium text-white/60 font-jetbrains">
                  analytics
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-8 mt-4">
                <div className="flex flex-col">
                  <span className="text-sm text-white/60 font-jetbrains">
                    streams
                  </span>
                  <span className="text-4xl mt-1 font-jetbrains font-semibold text-white">
                    {stats.streams}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-white/60 font-jetbrains">
                    vests
                  </span>
                  <span className="text-4xl mt-1 font-jetbrains font-semibold text-white">
                    {stats.vests}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-white/60 font-jetbrains">
                    invoices
                  </span>
                  <span className="text-4xl mt-1 font-jetbrains font-semibold text-white">
                    {stats.invoices}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Users Section */}
          <div>
            <div className="grid grid-cols-6 grid-rows-2 gap-4 outline-2 outline outline-white/[0.2] p-7 relative">
              <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
                featured users
              </h2>
              {featuredUsers.map((user) => (
                <div
                  key={user.id}
                  className="backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-4 flex flex-col items-center gap-2"
                >
                  <div className="h-10 w-10 overflow-hidden">
                    <Image
                      src={`https://cdn.stamp.fyi/avatar/${
                        user.address.split("...")[0]
                      }?s=50`}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="[image-rendering:pixelated]"
                      quality={100}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/60 font-jetbrains">
                      {user.address}
                    </p>
                    <p className="text-sm text-white font-semibold mt-1">
                      {user.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured DAOs Section */}
          <div className="mt-12">
            <div className="grid grid-cols-2 gap-6 outline-2 outline outline-white/[0.2] p-7 relative">
              <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
                featured daos
              </h2>
              {featuredDAOs.map((dao) => (
                <div
                  key={dao.id}
                  className="backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] p-6 flex items-start gap-4"
                >
                  <div className="h-12 w-12 overflow-hidden flex-shrink-0">
                    <Image
                      src={`https://cdn.stamp.fyi/avatar/${
                        dao.address.split("...")[0]
                      }?s=100`}
                      alt={`${dao.name} Avatar`}
                      width={48}
                      height={48}
                      className="[image-rendering:pixelated]"
                      quality={100}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {dao.name}
                      </h3>
                      <span className="text-xs text-white/60 font-jetbrains">
                        {dao.address}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">
                      {dao.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured News Section */}
          <div className="mt-12">
            <div className="grid grid-cols-2 gap-6 outline-2 outline outline-white/[0.2] p-7 relative">
              <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
                news
              </h2>
              {featuredNews.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden backdrop-blur-sm border border-white/[0.08] bg-white/[0.02]"
                >
                  {/* Banner Image Container */}
                  <div className="relative h-32 w-full">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      {article.date}
                    </div>

                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-600 transition-colors duration-200">
                      {article.title}
                    </h3>

                    <p className="text-sm text-white/60 line-clamp-2 mt-2">
                      {article.summary}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export const dynamic = "force-dynamic";
