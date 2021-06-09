import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

export default function SortableList({
  listData,
  renderSortableListItem,
  filterSortableItems,
  toggleEditable,
  editable,
}) {
  return (
    <DragDropContext>
      <Droppable droppableId="sortable-items">
        {(provided) => (
          <ul
            className="flex flex-col w-full"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {listData.length !== 0 && (
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
            {filterSortableItems(listData).map((doc, index) =>
              renderSortableListItem(doc, 'text-blue-400', index),
            )}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
