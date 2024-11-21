import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 font-jetbrains">
          404*
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-4 font-jetbrains">
          Page Not Found
        </h2>
        <p className="text-xl text-zinc-400 mb-8 font-jetbrains">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex font-jetbrains items-center px-4 py-2 text-sm font-semibold text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
}
