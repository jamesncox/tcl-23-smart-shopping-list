export default function FrequencyList({
  item,
  color,
  compareTimeStampsAndUncheckAfter24Hours,
  markItemPurchased,
  deleteItem,
}) {
  return (
    <li
      key={item.item_name}
      className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-2 rounded w-full"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-8 w-8 md:h-10 md:w-10 mr-1 fill-current ${color}`}
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="checkbox"
        className="mx-2 h-4 w-4 rounded h-5 w-5 bg-black bg-opacity-20 text-gray-700 cursor-pointer"
        item_name={item.item_name}
        defaultChecked={
          item.checked && compareTimeStampsAndUncheckAfter24Hours(item)
        }
        onClick={(e) => markItemPurchased(item)}
      />

      <label htmlFor={item.item_name}>
        <p
          aria-label={item.item_name}
          item_name={item.item_name}
          className="text-md md:text-lg cursor-pointer"
        >
          {item.item_name}
        </p>
      </label>
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
            // strokeWitem_nameth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </li>
  );
}
