import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

export default function SortableList({
  sortableData,
  renderSortableListItem,
  filterSortableItems,
  toggleEditable,
  editable,
}) {
  const [listItems, updateListItems] = useState(sortableData);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(listItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    console.log(items);

    updateListItems(items);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="sortable-items">
        {(provided) => (
          <ul
            className="flex flex-col w-full"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {sortableData.length !== 0 && (
              <div className="flex items-center full mt-5 mb-1">
                <span className="text-xl md:text-2xl font-light">
                  shopping order
                </span>
                <button
                  className="w-16 ml-auto bg-gray-900 bg-opacity-50 rounded p-2 hover:bg-gray-700"
                  onClick={toggleEditable}
                >
                  {editable ? 'Done' : 'Edit'}
                </button>
              </div>
            )}
            {filterSortableItems(listItems).map((doc, index) =>
              renderSortableListItem(doc, 'text-blue-400', index),
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
