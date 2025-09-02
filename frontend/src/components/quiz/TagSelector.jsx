export default function TagSelector({ allTags, selectedTagIds, onTagChange, disabled = false }) {
  const handleTagClick = (tagId) => {
    if (disabled) return;
    const newSelectedTagIds = new Set(selectedTagIds);
    if (newSelectedTagIds.has(tagId)) {
      newSelectedTagIds.delete(tagId);
    } else {
      newSelectedTagIds.add(tagId);
    }
    onTagChange(newSelectedTagIds);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map(tag => {
        const isSelected = selectedTagIds.has(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagClick(tag.id)}
            disabled={disabled}
            className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-ghost'} ${disabled ? 'btn-disabled' : ''}`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}