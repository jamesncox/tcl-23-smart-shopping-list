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
      {filterByLessThanSevenDays(listData).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...within a week
        </span>
      )}
      {filterByLessThanSevenDays(listData).map((item) =>
        renderFrequencyList(item, 'text-caribbean-green'),
      )}

      {filterByMoreThanSevenDaysAndLessThanThirtyDays(listData).length !==
        0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...within a month
        </span>
      )}
      {filterByMoreThanSevenDaysAndLessThanThirtyDays(listData).map((item) =>
        renderFrequencyList(item, 'text-orange-yellow'),
      )}

      {filterByMoreThanThirtyDays(listData).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...after thirty days
        </span>
      )}
      {filterByMoreThanThirtyDays(listData).map((item) =>
        renderFrequencyList(item, 'text-paradise-pink'),
      )}

      {filterByRecentlyPurchased(listData).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">
          ...purchased
        </span>
      )}
      {filterByRecentlyPurchased(listData).map((item) =>
        renderFrequencyList(item, 'text-blue-400'),
      )}

      {filterByInactiveItems(listData).length !== 0 && (
        <span className="text-xl md:text-2xl font-light mt-5">...inactive</span>
      )}
      {filterByInactiveItems(listData).map((item) =>
        renderFrequencyList(item, 'text-gray-200'),
      )}
    </>
  );
}
