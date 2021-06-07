import { useState } from 'react';
import { db } from '../lib/firebase';
import firebase from 'firebase/app';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import calculateEstimate from '../lib/estimates';
import { DateTime, Interval } from 'luxon';
import Button from '../components/Button';
import writingToken from './../img/writingToken.png';
import { Redirect } from 'react-router';
import FrequencyList from '../components/FrequencyList';
import FilterItems from '../components/FilterItems';
import FrequencyFilters from '../components/FrequencyFilters';
import SortableListItem from '../components/SortableListItem';
import SortableList from '../components/SortableList';

const viewOptions = [{ type: 'Frequency' }, { type: 'Store Order' }];

export default function List({ token }) {
  const history = useHistory();

  const [listData, loading, error] = useDocument(
    firebase.firestore().doc(`shopping_lists/${token}`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  // set and clear user query for item filter
  const [query, setQuery] = useState('');
  function handleReset() {
    setQuery('');
  }

  // set and toggle the viewOptions Frequency or Store Order
  const [selectedView, setSelectedView] = useState('Frequency');
  const toggleSelectedView = (e) => {
    setSelectedView(e.target.id);
  };

  // set the editable value and toggle true/false
  const [editable, setEditable] = useState(false);
  const toggleEditable = () => {
    if (editable) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  };

  const [itemIds, setItemIds] = useState([]);

  function viewUtilityClasses(view) {
    switch (view) {
      case 'Frequency':
        return 'w-28 p-2 rounded-tl rounded-bl mr-auto text-lg font-light bg-black bg-opacity-40 hover:bg-gray-700';
      case 'Store Order':
        return 'w-28 p-2 rounded-tr rounded-br mr-auto text-lg font-light bg-black bg-opacity-40 hover:bg-gray-700';
    }
  }

  const calculateLatestInterval = (lastPurchased, currentDateTime) => {
    return Math.floor(
      Interval.fromDateTimes(DateTime.fromISO(lastPurchased), currentDateTime)
        .toDuration('days')
        .toObject().days,
    );
  };

  const markItemPurchased = (id, itemData) => {
    const currentDateTime = DateTime.now();
    const itemRef = db.collection('shopping_lists').doc(token);

    if (itemData.checked === false) {
      // if an item has not yet been purchased, last_estimate has no value, so we initialize with the user's selected purchase_frequency
      if (itemData.times_purchased === 0) {
        db.collection(token)
          .doc(id)
          .update({
            last_purchased: currentDateTime.toString(),
            times_purchased: itemData.times_purchased + 1,
            last_estimate: itemData.purchase_frequency,
            checked: true,
          });
      } else {
        // if an item has at least 1 times_purchased, calculate the latestInterval with Interval from Luxon
        // and use the previous last_estimate property to update the database's last_estimate property with latestEstimate
        const latestInterval = calculateLatestInterval(
          itemData.last_purchased,
          currentDateTime,
        );

        const latestEstimate = calculateEstimate(
          itemData.last_estimate,
          latestInterval,
          itemData.times_purchased,
        );

        db.collection(token)
          .doc(id)
          .update({
            last_purchased: currentDateTime.toString(),
            times_purchased: itemData.times_purchased + 1,
            last_estimate: latestEstimate,
            checked: true,
          });
      }
    } else {
      db.collection(token).doc(id).update({
        checked: false,
      });
    }
  };

  function compareTimeStampsAndUncheckAfter24Hours(item, id) {
    // determine the amount days between now and last_purchase
    const currentDateTime = DateTime.now();
    const latestInterval = calculateLatestInterval(
      item.data().last_purchased,
      currentDateTime,
    );

    const doubleLastEstimate = item.last_estimate * 2;

    // check if an item marked purchased for more than 24 hours
    // uncheck the item if it is more than 24 hours purchased
    // if the item is less than DOUBLE the last_estimate, return false so it stays "inactive"
    if (latestInterval > 0) {
      db.collection(token).doc(id).update({
        checked: false,
      });
      return latestInterval > 0 && latestInterval > doubleLastEstimate;
    } else {
      return latestInterval === 0;
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
    const itemRef = db.collection('shopping_lists').doc(token);
    console.log(itemRef);

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
        itemRef.update({
          items: firebase.firestore.FieldValue.arrayRemove(item),
          sort_order: firebase.firestore.FieldValue.arrayRemove(item.item_name),
        });
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
      (data) =>
        data.item_name.toLowerCase().includes(query.toLowerCase().trim()) ||
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

  const filterSortableItems = () => {
    return listData
      .data()
      .items.filter(
        (item) =>
          item.item_name.toLowerCase().includes(query.toLowerCase().trim()) ||
          query === '',
      );
  };

  const renderFrequencyList = (item, color) => {
    return (
      <div className="flex items-center" key={item.item_name}>
        <FrequencyList
          item={item}
          color={color}
          markItemPurchased={markItemPurchased}
          compareTimeStampsAndUncheckAfter24Hours={
            compareTimeStampsAndUncheckAfter24Hours
          }
          deleteItem={deleteItem}
        />
      </div>
    );
  };

  const renderSortableList = (item, color) => {
    return (
      <div className="flex items-center" key={item.item_name}>
        <SortableListItem
          item={item}
          color={color}
          compareTimeStampsAndUncheckAfter24Hours={
            compareTimeStampsAndUncheckAfter24Hours
          }
          markItemPurchased={markItemPurchased}
          deleteItem={deleteItem}
          editable={editable}
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

        {error && (
          <strong className="text-2xl mt-10 font-bold text-orange-yellow text-center">
            Error: {JSON.stringify(error)}
          </strong>
        )}
        {loading && (
          <h2 className="text-2xl mt-10 font-bold text-orange-yellow text-center">
            Loading...
          </h2>
        )}
        {listData && (
          <>
            {listData.data().items.length === 0 ? (
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
              <div className="w-full">
                <ul className="flex flex-col w-full">
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
                    <SortableList
                      listData={listData}
                      renderSortableList={renderSortableList}
                      filterSortableItems={filterSortableItems}
                      toggleEditable={toggleEditable}
                      editable={editable}
                    />
                  )}
                  <div className="mb-36" />
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}
