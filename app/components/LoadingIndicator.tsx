export default function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <h3 className="text-xl font-semibold text-gray-800">Processing Request</h3>
      <p className="text-gray-500 mt-2 max-w-md">
        Scraping Perplexity AI across multiple proxy regions and running LLM analysis. This can take up to 90 seconds. Please wait...
      </p>
    </div>
  );
}
