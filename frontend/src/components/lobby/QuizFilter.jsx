import TagSelector from '../quiz/TagSelector'

export default function QuizFilter({
  searchId,
  onSearchIdChange,
  allTags,
  selectedTagIds,
  onTagChange,
}) {
  return (
    <div className="p-4 bg-base-200 rounded-box mb-4 space-y-4">
      <div>
        <label htmlFor="quiz-id-search" className="label">
          <span className="label-text font-semibold">Search by Quiz ID</span>
        </label>
        <div className="flex gap-2">
          <input
            id="quiz-id-search"
            type="text"
            placeholder="Enter exact Quiz ID..."
            className="input input-bordered w-full"
            value={searchId}
            onChange={(e) => onSearchIdChange(e.target.value)}
          />
          <button
            className="btn btn-neutral"
            onClick={() => onSearchIdChange('')}
            disabled={!searchId}
          >
            Clear
          </button>
        </div>
      </div>
      <div>
        <label className="label">
          <span className="label-text font-semibold">Filter by Tags</span>
        </label>
        <TagSelector
          allTags={allTags}
          selectedTagIds={selectedTagIds}
          onTagChange={onTagChange}
        />
      </div>
    </div>
  )
}