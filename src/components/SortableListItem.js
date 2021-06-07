import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableListItem({
  item,
  compareTimeStampsAndUncheckAfter24Hours,
  markItemPurchased,
  deleteItem,
  editable,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.item_name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      key={item.item_name}
      className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-2 rounded w-full"
      {...listeners}
    >
      <input
        type="checkbox"
        className="mx-2 h-4 w-4 rounded h-5 w-5 bg-black bg-opacity-20 text-gray-700 cursor-pointer"
        id={item.item_name}
        defaultChecked={
          item.checked &&
          compareTimeStampsAndUncheckAfter24Hours(item, item.item_name)
        }
        onClick={(e) => markItemPurchased(item.item_name, item)}
      />

      <label htmlFor={item.item_name}>
        <p
          aria-label={item.item_name}
          id={item.item_name}
          className="text-md md:text-lg cursor-pointer"
        >
          {item.item_name}
        </p>
      </label>
      {editable ? (
        <button className="ml-auto" key={item.item_name} {...attributes}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mx-2 hover:text-caribbean-green"
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
        </button>
      ) : (
        <button
          className="ml-auto"
          key={item.item_name}
          onClick={() => deleteItem(item)}
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
      )}
    </li>
  );
}
