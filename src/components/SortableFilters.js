import { useState } from 'react';

export default function SortableFilters({
  listItems,
  renderSortableList,
  filterByAlphabetizedStoreOrder,
}) {
  const [editable, setEditable] = useState(false);

  const toggleEditable = () => {
    if (editable) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  };

  return (
    <>
      {filterByAlphabetizedStoreOrder(listItems).length !== 0 && (
        <div className="flex items-center full mt-5 mb-1">
          <span className="text-xl md:text-2xl font-light">shopping order</span>
          <button
            className="w-16 ml-auto bg-gray-900 bg-opacity-50 rounded p-2 hover:bg-gray-700"
            onClick={toggleEditable}
          >
            {editable ? 'Done' : 'Edit'}
          </button>
        </div>
      )}

      {filterByAlphabetizedStoreOrder(listItems).map((doc) =>
        renderSortableList(doc, 'text-blue-400'),
      )}
    </>
  );
}
