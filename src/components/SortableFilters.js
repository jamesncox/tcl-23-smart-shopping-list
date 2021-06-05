export default function SortableFilters({
  listItems,
  renderSortableList,
  filterByAlphabetizedStoreOrder,
}) {
  return (
    <>
      {filterByAlphabetizedStoreOrder(listItems).length !== 0 && (
        <span className="text-xl md:text-2xl font-light my-5">
          ...preferred shopping order
        </span>
      )}

      {filterByAlphabetizedStoreOrder(listItems).map((doc) =>
        renderSortableList(doc, 'text-blue-400'),
      )}
    </>
  );
}
