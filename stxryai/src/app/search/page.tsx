'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  // In a real application, you would use the query to fetch search results from your API
  // For now, we'll just display the query.

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Search Results for "{query}"
      </h1>
      <p className="text-gray-600">
        This is a placeholder for the search results page. In a real application, you would see a list of stories matching your search query.
      </p>
      {/* Placeholder for search results list */}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}
