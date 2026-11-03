import CourtNews from "./CourtNews";

export default function CourtNewsPage() {
  return (
    <main className="py-16 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Latest Court News
        </h1>
        <CourtNews />
      </div>
    </main>
  );
}
