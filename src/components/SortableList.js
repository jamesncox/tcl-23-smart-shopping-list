import React, { useState } from 'react';

export default function SortableList({
  listData,
  renderSortableListItem,
  filterSortableItems,
  toggleEditable,
  editable,
}) {
  return (
    <ul className="flex flex-col w-full">
      {listData.length !== 0 && (
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
      {filterSortableItems(listData).map((doc) =>
        renderSortableListItem(doc, 'text-blue-400'),
      )}
    </ul>
  );
}
