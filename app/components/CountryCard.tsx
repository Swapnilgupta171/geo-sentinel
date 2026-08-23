import { CountryResult } from "../../shared/types";

export default function CountryCard({ result }: { result: CountryResult }) {
  const isUS = result.country === 'us';
  const flag = isUS ? '🇺🇸' : '🇩🇪';
  const countryName = isUS ? 'United States' : 'Germany';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
        <span className="text-2xl">{flag}</span>
        <h3 className="text-lg font-bold text-gray-800">{countryName}</h3>
      </div>
      
      <div className="p-6 flex-grow flex flex-col gap-6">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Narrative Summary</h4>
          <p className="text-gray-800 leading-relaxed">{result.narrativeSummary || "No summary available."}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sentiment</h4>
            <div className="flex items-center gap-2">
              <span className={\`text-xl font-bold \${result.sentiment > 0 ? 'text-green-600' : result.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}\`}>
                {result.sentiment > 0 ? '+' : ''}{result.sentiment.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Visibility</h4>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-700">
                {result.visibility ? 'High' : 'Low'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Citations ({result.citations?.length || 0})</h4>
          <ul className="space-y-2 text-sm">
            {result.citations && result.citations.length > 0 ? (
              result.citations.map((url, index) => (
                <li key={index} className="truncate">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {url}
                  </a>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No citations found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
