import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function SortableList({
  sortableData,
  filterSortableItems,
  toggleEditable,
  compareTimeStampsAndUncheckAfter24Hours,
  markItemPurchased,
  deleteItem,
  editable,
}) {
  const [listItems, updateListItems] = useState(sortableData);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sortableData);
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
            {filterSortableItems(listItems).map((item, index) =>
              editable ? (
                <Draggable key={item.id} draggableitem={item.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-2 rounded w-full"
                    >
                      <input
                        type="checkbox"
                        className="mx-2 h-4 w-4 rounded h-5 w-5 bg-black bg-opacity-20 text-gray-700 cursor-pointer"
                        id={item.data().item_name}
                        defaultChecked={
                          item.data().checked &&
                          compareTimeStampsAndUncheckAfter24Hours(item, item.id)
                        }
                        onClick={(e) => markItemPurchased(item, item.id)}
                      />

                      <label htmlFor={item.data().item_name}>
                        <p
                          aria-label={item.data().item_name}
                          className="text-md md:text-lg"
                        >
                          {item.data().item_name}
                        </p>
                      </label>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 ml-auto mx-2 hover:text-caribbean-green"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </li>
                  )}
                </Draggable>
              ) : (
                <li className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-2 rounded w-full">
                  <input
                    type="checkbox"
                    className="mx-2 h-4 w-4 rounded h-5 w-5 bg-black bg-opacity-20 text-gray-700 cursor-pointer"
                    id={item.id}
                    defaultChecked={
                      item.data().checked &&
                      compareTimeStampsAndUncheckAfter24Hours(item, item.id)
                    }
                    onClick={(e) => markItemPurchased(item, item.id)}
                  />

                  <label htmlFor={item.data().item_name}>
                    <p
                      aria-label={item.data().item_name}
                      className="text-md md:text-lg"
                    >
                      {item.data().item_name}
                    </p>
                  </label>
                  <button
                    className="ml-auto"
                    key={item.data().item_name}
                    onClick={() => deleteItem(item.data(), item.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mx-2 hover:text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ),
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
