import IconButton from './IconButton';

export default function FilterItems({ query, setQuery, handleReset }) {
  return (
    <div className="flex mb-5 mt-5">
      <input
        className="w-full pl-5 py-2 rounded bg-midnight-green border border-gray-200"
        type="text"
        placeholder="Find item"
        value={query}
        id="thesearch"
        onChange={(e) => setQuery(e.target.value)}
      />
      <IconButton
        onClick={handleReset}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        }
        label="clear input"
      />
    </div>
  );
}
