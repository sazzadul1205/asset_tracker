import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-linear-to-br from-gray-100 to-gray-200 w-full h-screen flex items-center justify-center">
      <div className="bg-white border border-gray-200 flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-10 rounded-xl shadow-2xl text-center">
        <p className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-gray-300 animate-pulse">
          404
        </p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-600 mt-4">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-500 mt-2 mb-6">
          Sorry, we could&apos;t find the page you&apos;re looking for.
        </p>

        <Link href="/" className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 transform hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Go Back Home</span>
        </Link>

      </div>
    </div>
  );
}
