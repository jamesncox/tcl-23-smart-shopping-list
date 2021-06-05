export default function SortableFilters({
  listItems,
  renderSortableList,
  filterByAlphabetizedStoreOrder,
}) {
  return (
    <>
      {filterByAlphabetizedStoreOrder(listItems).length !== 0 && (
        <div className="flex items-center full mt-5 mb-1">
          <span className="text-xl md:text-2xl font-light">shopping order</span>
          <button className="w-12 ml-auto bg-gray-900 bg-opacity-50 rounded p-2 hover:bg-gray-700">
            Edit
          </button>
        </div>
      )}

      {filterByAlphabetizedStoreOrder(listItems).map((doc) =>
        renderSortableList(doc, 'text-blue-400'),
      )}
    </>
  );
}
