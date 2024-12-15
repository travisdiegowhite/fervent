import { useState } from 'react';
import { SearchResult } from './types';


interface HeaderProps {
  routeType: 'cycling' | 'walking';
  onRouteTypeChange: (routeType: 'cycling' | 'walking') => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onLocationSelect: (result: SearchResult) => void;
  canSave: boolean;
  onSave: () => void;
  onClear: () => void;
  hasRoute: boolean;
}

const Header: React.FC<HeaderProps> = ({
  routeType,
  onRouteTypeChange,
  onSearch,
  onLocationSelect,
  canSave,
  onSave,
  onClear,
  hasRoute
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const user = { email: 'user@example.com' }; // Replace with actual user data
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  function signOut(): void {
    // Implement sign out logic here, for example, clearing user session and redirecting to login page
    console.log('Signing out...');
    // Clear user session (this is just an example, adjust according to your auth logic)
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  }
  return (
    <div className="flex justify-between p-4 bg-white border-b z-20 relative">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Create New Route</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <button 
              onClick={() => signOut()}
              className="px-3 py-1 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a location..."
              className="w-full px-4 py-2 border rounded-lg"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onLocationSelect(result);
                      setSearchQuery(result.text);
                      setShowSearchResults(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    {result.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select 
            value={routeType}
            onChange={(e) => onRouteTypeChange(e.target.value as 'cycling' | 'walking')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="cycling">Cycling</option>
            <option value="walking">Walking</option>
          </select>
        </div>
      </div>
      <div className="flex items-start ml-4 space-x-2">
        <button 
          className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          onClick={onClear}
          disabled={!hasRoute}
        >
          Clear
        </button>
        <button 
          className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          onClick={onSave}
          disabled={!canSave}
        >
          Save Route
        </button>
      </div>
    </div>
  );
};

export default Header;