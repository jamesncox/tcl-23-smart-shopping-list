export default function FrequencyFilters({
  filterByLessThanSevenDays,
  listItems,
  renderUnorderedList,
  filterByMoreThanSevenDaysAndLessThanThirtyDays,
  filterByMoreThanThirtyDays,
  filterByRecentlyPurchased,
  filterByInactiveItems,
}) {
  return (
    <>
      {filterByLessThanSevenDays(listItems).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...within a week
        </span>
      )}
      {filterByLessThanSevenDays(listItems).map((doc) =>
        renderUnorderedList(doc, 'text-caribbean-green'),
      )}

      {filterByMoreThanSevenDaysAndLessThanThirtyDays(listItems).length !==
        0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...within a month
        </span>
      )}
      {filterByMoreThanSevenDaysAndLessThanThirtyDays(listItems).map((doc) =>
        renderUnorderedList(doc, 'text-orange-yellow'),
      )}

      {filterByMoreThanThirtyDays(listItems).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...after thirty days
        </span>
      )}
      {filterByMoreThanThirtyDays(listItems).map((doc) =>
        renderUnorderedList(doc, 'text-paradise-pink'),
      )}

      {filterByRecentlyPurchased(listItems).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...recently purchased
        </span>
      )}
      {filterByRecentlyPurchased(listItems).map((doc) =>
        renderUnorderedList(doc, 'text-blue-400'),
      )}

      {filterByInactiveItems(listItems).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">...inactive</span>
      )}
      {filterByInactiveItems(listItems).map((doc) =>
        renderUnorderedList(doc, 'text-gray-200'),
      )}
    </>
  );
}
