// components/TagCloud.jsx
"use client";

export default function TagCloud({ 
  tags, 
  selectedTags = [], 
  onTagClick,
  maxTags = 20,
  showCount = false 
}) {
  // Llogarit madhësinë e fontit bazuar në frekuencën e tag-ut
  const getFontSize = (count, maxCount) => {
    if (!showCount || maxCount === 0) return "text-sm";
    
    const ratio = count / maxCount;
    if (ratio > 0.8) return "text-xl font-bold";
    if (ratio > 0.6) return "text-lg font-semibold";
    if (ratio > 0.4) return "text-base font-medium";
    if (ratio > 0.2) return "text-sm";
    return "text-xs";
  };

  // Gjej numrin maksimal për normalizim
  const maxCount = showCount 
    ? Math.max(...tags.map(tag => tag.count || 1))
    : 1;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tags.slice(0, maxTags).map((tagObj, index) => {
        const tag = typeof tagObj === 'string' ? tagObj : tagObj.tag;
        const count = typeof tagObj === 'string' ? 1 : tagObj.count || 1;
        const isSelected = selectedTags.includes(tag);
        
        return (
          <button
            key={index}
            onClick={() => onTagClick && onTagClick(tag)}
            className={`
              px-3 py-1.5 rounded-full transition-all duration-200
              hover:scale-105 active:scale-95
              ${getFontSize(count, maxCount)}
              ${isSelected
                ? 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }
            `}
            title={showCount ? `Used ${count} times` : tag}
          >
            {tag}
            {showCount && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                isSelected 
                  ? 'bg-gray-900 text-yellow-300' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}