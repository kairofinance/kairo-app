import Navbar from "./components/Navbar";
import Link from "next/link";
import { headers } from "next/headers";
import { getDictionary } from "@/utils/get-dictionary";
import { Locale } from "@/utils/i18n-config";

type ValidLang = "en" | "fr" | "es" | "pt" | "ja" | "zh" | "de";

export default async function NotFound() {
  const headersList = headers();
  const acceptLanguage = (await headersList).get("accept-language");
  const currentLang = (acceptLanguage?.split(",")[0].split("-")[0] ||
    "en") as ValidLang;

  const dictionary = await getDictionary(currentLang as Locale);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center bg-kairo-black bg-gradient-to-t ">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-kairo-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-kairo-white mb-4">
            {dictionary?.notFound?.title || "Page Not Found"}
          </h2>
          <p className="text-xl text-kairo-white mb-8">
            {dictionary?.notFound?.description ||
              "The page you are looking for does not exist."}
          </p>
          <Link
            href="/"
            className="bg-kairo-green text-kairo-white font-bold py-2 px-4 rounded transition duration-300 hover:bg-kairo-green-a40"
          >
            {dictionary?.notFound?.goHome || "Go Back Home"}
          </Link>
        </div>
      </main>
    </div>
  );
}
