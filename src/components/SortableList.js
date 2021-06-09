import React, { useState } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function SortableList({
  listData,
  renderSortableListItem,
  filterSortableItems,
  toggleEditable,
  editable,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // function handleDragEnd(event) {
  //   const { active, over } = event;

  //   if (active.id !== over.id) {
  //     setItems((items) => {
  //       const oldIndex = items.indexOf(active.id);
  //       const newIndex = items.indexOf(over.id);

  //       return arrayMove(items, oldIndex, newIndex);
  //     });
  //   }
  // }

  return (
    // <DndContext
    //   sensors={sensors}
    //   collisionDetection={closestCenter}
    //   // onDragEnd={handleDragEnd}
    // >
    //   <SortableContext strategy={verticalListSortingStrategy}>
    <>
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
    </>
    //   </SortableContext>
    // </DndContext>
  );
}
