import Link from "next/link";
import { headers } from "next/headers";
import { getDictionary } from "@/utils/get-dictionary";
import { Locale } from "@/utils/i18n-config";
import { CubeTransparentIcon, ServerIcon } from "@heroicons/react/20/solid";

type ValidLang = "en" | "fr" | "es" | "pt" | "ja" | "zh" | "de";

export default async function NotFound() {
  const headersList = headers();
  const acceptLanguage = (await headersList).get("accept-language");
  const currentLang = (acceptLanguage?.split(",")[0].split("-")[0] ||
    "en") as ValidLang;

  const dictionary = await getDictionary(currentLang as Locale);

  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 font-jetbrains">
          404*
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-4 font-jetbrains">
          {dictionary?.notFound?.title || "Page Not Found"}
        </h2>
        <p className="text-xl text-zinc-400 mb-8 font-jetbrains">
          {dictionary?.notFound?.description ||
            "The page you are looking for does not exist."}
        </p>
        <Link
          href="/"
          className="inline-flex font-jetbrains items-center px-4 py-2 text-sm font-semibold text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
        >
          {dictionary?.notFound?.goHome || "Go Back Home"}
        </Link>
      </div>
    </main>
  );
}
