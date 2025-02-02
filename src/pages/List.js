import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import calculateEstimate from '../lib/estimates';
import { DateTime, Interval } from 'luxon';
import Button from '../components/Button';
import writingToken from './../img/writingToken.png';
import { Redirect } from 'react-router';
import FrequencyList from '../components/FrequencyList';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FilterItems from '../components/FilterItems';
import FrequencyFilters from '../components/FrequencyFilters';
import firebase from 'firebase';

const viewOptions = [{ type: 'Frequency' }, { type: 'Store Order' }];

export default function List({ token, listData, setListData }) {
  const [selectedView, setSelectedView] = useState('Frequency');
  const [editable, setEditable] = useState(false);
  const [sortedData, setSortedData] = useState([]);
  const [query, setQuery] = useState('');

  const history = useHistory();
  const [listItems, loading, error] = useCollection(db.collection(token), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  useEffect(() => {
    if (listItems) {
      const sortOrderDoc = listItems.docs.find(
        (item) => item.data().sort_order,
      );

      let sortOrderArray = [];
      if (sortOrderDoc) {
        sortOrderArray = sortOrderDoc.data().sort_order;
      }
      if (sortOrderArray) {
        setSortedData(sortOrderArray);
      }

      const itemsArray = sortOrderArray.map((id) => {
        const item = listData.find((item) => item.id === id);
        if (item) {
          return item;
        }
        return listItems.docs.find((item) => item.data().id === id).data();
      });
      setListData(itemsArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listItems, selectedView]);

  // set and clear user query for item filter
  function handleReset() {
    setQuery('');
  }

  // set and toggle the viewOptions Frequency or Store Order
  const toggleSelectedView = (e) => {
    setSelectedView(e.target.id);
    setEditable(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(listData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const sortedIds = items.map((item) => item.id);
    setSortedData(sortedIds);
    setListData(items);
  };

  // set the editable value and toggle true/false
  const toggleEditable = () => {
    if (editable) {
      setEditable(false);
      const docRef = db.collection(token).doc('sort_order');
      docRef.update({ sort_order: sortedData });
    } else {
      setEditable(true);
    }
  };

  const filterSortableItems = () => {
    const itemsArray = sortedData.map((id) => {
      const item = listData.find((item) => item.id === id);
      if (item) {
        return item;
      }
      return listItems.docs.find((item) => item.data().id === id).data();
    });

    const unCheckedItems = itemsArray.filter((item) => !item.checked);

    return unCheckedItems.filter(
      (item) =>
        item.item_name.toLowerCase().includes(query.toLowerCase().trim()) ||
        query === '',
    );
  };

  function viewUtilityClasses(view) {
    switch (view) {
      case 'Frequency':
        return 'w-28 p-2 rounded-tl rounded-bl mr-auto text-lg font-light bg-black bg-opacity-40 hover:bg-gray-700';
      case 'Store Order':
        return 'w-28 p-2 rounded-tr rounded-br mr-auto text-lg font-light bg-black bg-opacity-40 hover:bg-gray-700';
      default:
        return 'w-28 p-2 rounded-tl rounded-bl mr-auto text-lg font-light bg-black bg-opacity-40 hover:bg-gray-700';
    }
  }

  const calculateLatestInterval = (lastPurchased, currentDateTime) => {
    return Math.floor(
      Interval.fromDateTimes(DateTime.fromISO(lastPurchased), currentDateTime)
        .toDuration('days')
        .toObject().days,
    );
  };

  const markItemPurchased = (item) => {
    const currentDateTime = DateTime.now();

    if (item.checked === false) {
      // if an item has not yet been purchased, last_estimate has no value, so we initialize with the user's selected purchase_frequency
      if (item.times_purchased === 0) {
        db.collection(token)
          .doc(item.id)
          .update({
            last_purchased: currentDateTime.toString(),
            times_purchased: item.times_purchased + 1,
            last_estimate: item.purchase_frequency,
            checked: true,
          })
          .then(() => {
            setListData((prev) => {
              return prev.map((doc) => {
                if (doc.id !== item.id) {
                  return doc;
                } else {
                  return {
                    ...doc,
                    last_purchased: currentDateTime.toString(),
                    times_purchased: item.times_purchased + 1,
                    last_estimate: item.purchase_frequency,
                    checked: true,
                  };
                }
              });
            });
          });
      } else {
        // if an item has at least 1 times_purchased, calculate the latestInterval with Interval from Luxon
        // and use the previous last_estimate property to update the database's last_estimate property with latestEstimate
        const latestInterval = calculateLatestInterval(
          item.last_purchased,
          currentDateTime,
        );

        const latestEstimate = calculateEstimate(
          item.last_estimate,
          latestInterval,
          item.times_purchased,
        );

        db.collection(token)
          .doc(item.id)
          .update({
            last_purchased: currentDateTime.toString(),
            times_purchased: item.times_purchased + 1,
            last_estimate: latestEstimate,
            checked: true,
          })
          .then(() => {
            setListData((prev) => {
              return prev.map((doc) => {
                if (doc.id !== item.id) {
                  return doc;
                } else {
                  return {
                    ...doc,
                    last_purchased: currentDateTime.toString(),
                    times_purchased: item.times_purchased + 1,
                    last_estimate: latestEstimate,
                    checked: true,
                  };
                }
              });
            });
          });
      }
    } else {
      db.collection(token)
        .doc(item.id)
        .update({
          checked: false,
        })
        .then(() => {
          setListData((prev) => {
            return prev.map((doc) => {
              if (doc.id !== item.id) {
                return doc;
              } else {
                return {
                  ...doc,
                  checked: false,
                };
              }
            });
          });
        });
    }
  };

  function compareTimeStampsAndUncheckAfterLatestIntervalExpires(item) {
    // determine the amount days between now and last_purchase
    const currentDateTime = DateTime.now();
    const latestInterval = calculateLatestInterval(
      item.last_purchased,
      currentDateTime,
    );

    // when an item is marked purchased and on a list AND the latestInterval,
    // (the time between now and when the item was last puchased) is greater than the
    // item's last_estimate property, uncheck it and put it back in it's category
    if (latestInterval > item.last_estimate && item.checked) {
      db.collection(token)
        .doc(item.id)
        .update({
          checked: false,
        })
        .then(() => {
          setListData((prev) => {
            return prev.map((doc) => {
              if (doc.id !== item.id) {
                return doc;
              } else {
                return {
                  ...doc,
                  checked: false,
                };
              }
            });
          });
        });
      return latestInterval > item.last_estimate;
    } else {
      return latestInterval <= item.last_estimate;
    }
  }

  const checkForInactiveItem = (item) => {
    // calculate if the duration between now and last_purchased is greater than DOUBLE the last_estimate
    const doubleLastEstimate = item.last_estimate * 2;
    const currentDateTime = DateTime.now();
    const latestInterval = calculateLatestInterval(
      item.last_purchased,
      currentDateTime,
    );

    if (latestInterval > doubleLastEstimate) {
      return true;
    }
    return false;
  };

  function deleteItem(item) {
    Swal.fire({
      title: `Delete ${item.item_name.toUpperCase()} from your list?`,
      text: 'Purchase history will be completely erased',
      icon: 'warning',
      iconColor: '#F5AB00',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#2081C3',
      cancelButtonColor: '#08415C',
      cancelButtonText: 'Do not delete',
      confirmButtonText: `Yes, delete`,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: `${item.item_name.toUpperCase()} has been deleted.`,
          icon: 'success',
          iconColor: '#049F76',
          buttonsStyling: true,
          confirmButtonColor: '#2081C3',
        });
        const docRef = db.collection(token).doc('sort_order');

        db.collection(token).doc(item.id).delete();
        docRef
          .update({
            sort_order: firebase.firestore.FieldValue.arrayRemove(item.id),
          })
          .then(() =>
            setListData((prev) => prev.filter((doc) => doc.id !== item.id)),
          );
      }
    });
  }

  const alphabetizeListItems = (list) => {
    const sortedList = list.sort((a, b) => {
      if (a.item_name.toLowerCase() < b.item_name.toLowerCase()) {
        return -1;
      }
      if (a.item_name.toLowerCase() > b.item_name.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return sortedList;
  };

  const filterByUserInput = (item) => {
    // first alphabetize all the items then filter for the user's searched item(s)
    return alphabetizeListItems(item).filter(
      (item) =>
        item.item_name.toLowerCase().includes(query.toLowerCase().trim()) ||
        query === '',
    );
  };

  const filterByLessThanSevenDays = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter into the green category of less than 7 days
    return alphabetizedUserInputOrAllItems.filter((item) => {
      if (item.times_purchased === 0) {
        return item.purchase_frequency === 7;
      } else {
        return (
          item.last_estimate <= 7 &&
          !checkForInactiveItem(item) &&
          !item.checked
        );
      }
    });
  };

  const filterByMoreThanSevenDaysAndLessThanThirtyDays = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter items into the purple category of more than 7 days and less than 30 days
    return alphabetizedUserInputOrAllItems.filter((item) => {
      if (item.times_purchased === 0) {
        return item.purchase_frequency === 14;
      } else {
        return (
          item.last_estimate > 7 &&
          item.last_estimate <= 30 &&
          !checkForInactiveItem(item) &&
          !item.checked
        );
      }
    });
  };

  const filterByMoreThanThirtyDays = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter items into the red category of more than 30 days
    return alphabetizedUserInputOrAllItems.filter((item) => {
      if (item.times_purchased === 0) {
        return item.purchase_frequency === 30;
      } else {
        return (
          item.last_estimate > 30 &&
          !checkForInactiveItem(item) &&
          !item.checked
        );
      }
    });
  };

  const filterByRecentlyPurchased = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    return alphabetizedUserInputOrAllItems.filter((item) => item.checked);
  };

  const filterByInactiveItems = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter items into the gray category of more than double last_estimate
    return alphabetizedUserInputOrAllItems.filter(
      (item) => checkForInactiveItem(item) && !item.checked,
    );
  };

  const renderFrequencyList = (item, color) => {
    return (
      <div className="flex items-center" key={item.id}>
        <FrequencyList
          item={item}
          color={color}
          markItemPurchased={markItemPurchased}
          compareTimeStampsAndUncheckAfterLatestIntervalExpires={
            compareTimeStampsAndUncheckAfterLatestIntervalExpires
          }
          deleteItem={deleteItem}
        />
      </div>
    );
  };

  if (!token) {
    return <Redirect to="/" />;
  } else {
    return (
      <div className="w-full">
        <h1 className="mt-5 text-3xl self-start font-light">
          Things I'll need
        </h1>
        <label htmlFor="thesearch" className="opacity-0">
          Search Grocery List Items{' '}
        </label>
        <FilterItems
          query={query}
          setQuery={setQuery}
          handleReset={handleReset}
        />

        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && (
          <h2 className="text-2xl mt-10 font-bold text-orange-yellow text-center">
            Loading...
          </h2>
        )}
        {listData && !loading && (
          <>
            {listData.length === 0 ? (
              <section className="flex flex-col items-center w-full">
                <img
                  src={writingToken}
                  alt="hand holding pen to write on paper"
                  className="my-5 md:max-w-md md:m-auto p-4"
                />
                <p className="my-5">You don’t have any listed items</p>
                <Button
                  onClick={() => history.push('/add-item')}
                  text="Add your first item"
                />
              </section>
            ) : (
              <div className="flex flex-col w-full">
                <nav className="m-auto grid grid-cols-2 rounded mt-2 bg-black bg-opacity-20">
                  {viewOptions.map(({ type }) => (
                    <button
                      key={type}
                      id={type}
                      className={
                        type === selectedView
                          ? viewUtilityClasses(selectedView)
                          : 'w-28 p-2 rounded ml-auto text-lg font-light hover:bg-gray-700'
                      }
                      onClick={toggleSelectedView}
                    >
                      {type}
                    </button>
                  ))}
                </nav>
                {selectedView === 'Frequency' ? (
                  <FrequencyFilters
                    filterByLessThanSevenDays={filterByLessThanSevenDays}
                    listData={listData}
                    renderFrequencyList={renderFrequencyList}
                    filterByMoreThanSevenDaysAndLessThanThirtyDays={
                      filterByMoreThanSevenDaysAndLessThanThirtyDays
                    }
                    filterByMoreThanThirtyDays={filterByMoreThanThirtyDays}
                    filterByRecentlyPurchased={filterByRecentlyPurchased}
                    filterByInactiveItems={filterByInactiveItems}
                  />
                ) : (
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="sortable-items">
                      {(provided) => (
                        <ul
                          className="flex flex-col w-full"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          <div className="flex items-center full mt-5 mb-2">
                            <span className="text-xl md:text-2xl font-light">
                              shopping order
                            </span>
                            <button
                              className="w-16 ml-auto bg-gray-900 bg-opacity-50 rounded p-2 hover:bg-gray-700"
                              onClick={toggleEditable}
                            >
                              {editable ? 'Done' : 'Sort'}
                            </button>
                          </div>
                          {filterSortableItems(listData).map((item, index) =>
                            editable ? (
                              <Draggable
                                key={item.item_name}
                                draggableId={item.item_name}
                                index={index}
                              >
                                {(provided) => (
                                  <li
                                    key={item.item_name}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="container flex items-center bg-gray-900 bg-opacity-30 md:font-medium my-1 p-3 active:bg-gray-900 rounded w-full"
                                  >
                                    <p
                                      aria-label={item.item_name}
                                      className="ml-9 text-md md:text-lg"
                                    >
                                      {item.item_name}
                                    </p>
                                    <button className="ml-auto">
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
                                  </li>
                                )}
                              </Draggable>
                            ) : (
                              <li
                                className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-3 rounded w-full"
                                key={item.item_name}
                              >
                                <input
                                  type="checkbox"
                                  className="mx-2 h-4 w-4 rounded h-5 w-5 bg-black bg-opacity-20 text-gray-700 cursor-pointer"
                                  id={item.item_name}
                                  defaultChecked={
                                    item.checked &&
                                    compareTimeStampsAndUncheckAfterLatestIntervalExpires(
                                      item,
                                    )
                                  }
                                  onClick={() => markItemPurchased(item)}
                                />

                                <label htmlFor={item.item_name}>
                                  <p
                                    aria-label={item.item_name}
                                    className="text-md md:text-lg"
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
                )}
                <div className="mb-36" />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}
