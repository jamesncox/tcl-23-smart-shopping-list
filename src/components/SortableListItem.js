import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import React, { useState } from 'react';

export default function SortableListItem({
  id,
  index,
  item,
  compareTimeStampsAndUncheckAfter24Hours,
  markItemPurchased,
  deleteItem,
  editable,
}) {
  return editable ? (
    <Draggable key={id} draggableId={id} index={index}>
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
            id={item.item_name}
            defaultChecked={
              item.checked && compareTimeStampsAndUncheckAfter24Hours(item, id)
            }
            onClick={(e) => markItemPurchased(item, id)}
          />

          <label htmlFor={item.item_name}>
            <p
              aria-label={item.item_name}
              id={item.item_name}
              className="text-md md:text-lg"
            >
              {item.item_name}
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
        id={item.item_name}
        defaultChecked={
          item.checked && compareTimeStampsAndUncheckAfter24Hours(item, id)
        }
        onClick={(e) => markItemPurchased(item, id)}
      />

      <label htmlFor={item.item_name}>
        <p
          aria-label={item.item_name}
          id={item.item_name}
          className="text-md md:text-lg"
        >
          {item.item_name}
        </p>
      </label>
      <button
        className="ml-auto"
        key={item.item_name}
        onClick={() => deleteItem(item, id)}
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
  );
}
