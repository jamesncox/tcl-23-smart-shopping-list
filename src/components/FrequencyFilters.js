export default function FrequencyFilters({
  filterByLessThanSevenDays,
  listData,
  renderFrequencyList,
  filterByMoreThanSevenDaysAndLessThanThirtyDays,
  filterByMoreThanThirtyDays,
  filterByRecentlyPurchased,
  filterByInactiveItems,
}) {
  return (
    <>
      {filterByLessThanSevenDays(listData.data().items).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...within a week
        </span>
      )}
      {filterByLessThanSevenDays(listData.data().items).map((item) =>
        renderFrequencyList(item, 'text-caribbean-green'),
      )}

      {filterByMoreThanSevenDaysAndLessThanThirtyDays(listData.data().items)
        .length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...within a month
        </span>
      )}
      {filterByMoreThanSevenDaysAndLessThanThirtyDays(
        listData.data().items,
      ).map((item) => renderFrequencyList(item, 'text-orange-yellow'))}

      {filterByMoreThanThirtyDays(listData.data().items).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...after thirty days
        </span>
      )}
      {filterByMoreThanThirtyDays(listData.data().items).map((item) =>
        renderFrequencyList(item, 'text-paradise-pink'),
      )}

      {filterByRecentlyPurchased(listData.data().items).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...recently purchased
        </span>
      )}
      {filterByRecentlyPurchased(listData.data().items).map((item) =>
        renderFrequencyList(item, 'text-blue-400'),
      )}

      {filterByInactiveItems(listData.data().items).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">...inactive</span>
      )}
      {filterByInactiveItems(listData.data().items).map((item) =>
        renderFrequencyList(item, 'text-gray-200'),
      )}
    </>
  );
}
