import { useState } from 'react';
import { db } from '../lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import calculateEstimate from '../lib/estimates';
import { DateTime, Interval } from 'luxon';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import writingToken from './../img/writingToken.png';
import { Redirect } from 'react-router';
import FrequencyList from '../components/FrequencyList';

const viewOptions = [{ type: 'Frequency' }, { type: 'Store Order' }];

export default function List({ token }) {
  const history = useHistory();
  const [listItems, loading, error] = useCollection(db.collection(token), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

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

  const checkForInactiveItem = (itemData) => {
    // pass in the item and create a variable for item.data() here
    const item = itemData.data();

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

  function deleteItem(doc) {
    Swal.fire({
      title: `Delete ${doc.data().item_name.toUpperCase()} from your list?`,
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
          text: `${doc.data().item_name.toUpperCase()} has been deleted.`,
          icon: 'success',
          iconColor: '#049F76',
          buttonsStyling: true,
          confirmButtonColor: '#2081C3',
        });
        db.collection(token).doc(doc.id).delete();
      }
    });
  }

  const alphabetizeListItems = (list) => {
    const sortedList = list.sort((a, b) => {
      if (a.data().item_name.toLowerCase() < b.data().item_name.toLowerCase()) {
        return -1;
      }
      if (a.data().item_name.toLowerCase() > b.data().item_name.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return sortedList;
  };

  const filterByUserInput = (item) => {
    // first alphabetize all the items then filter for the user's searched item(s)
    return alphabetizeListItems(item.docs).filter(
      (doc) =>
        doc
          .data()
          .item_name.toLowerCase()
          .includes(query.toLowerCase().trim()) || query === '',
    );
  };

  const filterByLessThanSevenDays = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter into the green category of less than 7 days
    return alphabetizedUserInputOrAllItems.filter((item) => {
      if (item.data().times_purchased === 0) {
        return item.data().purchase_frequency === 7;
      } else {
        return (
          item.data().last_estimate <= 7 &&
          !checkForInactiveItem(item) &&
          !item.data().checked
        );
      }
    });
  };

  const filterByMoreThanSevenDaysAndLessThanThirtyDays = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter items into the purple category of more than 7 days and less than 30 days
    return alphabetizedUserInputOrAllItems.filter((item) => {
      if (item.data().times_purchased === 0) {
        return item.data().purchase_frequency === 14;
      } else {
        return (
          item.data().last_estimate > 7 &&
          item.data().last_estimate <= 30 &&
          !checkForInactiveItem(item) &&
          !item.data().checked
        );
      }
    });
  };

  const filterByMoreThanThirtyDays = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter items into the red category of more than 30 days
    return alphabetizedUserInputOrAllItems.filter((item) => {
      if (item.data().times_purchased === 0) {
        return item.data().purchase_frequency === 30;
      } else {
        return (
          item.data().last_estimate > 30 &&
          !checkForInactiveItem(item) &&
          !item.data().checked
        );
      }
    });
  };

  const filterByRecentlyPurchased = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    return alphabetizedUserInputOrAllItems.filter(
      (item) => item.data().checked,
    );
  };

  const filterByInactiveItems = (listItems) => {
    // filter the items by user input or render all items if no input
    const alphabetizedUserInputOrAllItems = filterByUserInput(listItems);

    // filter items into the gray category of more than double last_estimate
    return alphabetizedUserInputOrAllItems.filter(
      (item) => checkForInactiveItem(item) && !item.data().checked,
    );
  };

  const filterSortableItems = () => {
    return listItems.docs.filter(
      (item) =>
        item
          .data()
          .item_name.toLowerCase()
          .includes(query.toLowerCase().trim()) || query === '',
    );
  };

  const renderFrequencyList = (item, color) => {
    return (
      <div className="flex items-center" key={item.id}>
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
      <div className="flex items-center" key={item.id}>
        {/* <SortableListItem
          item={item}
          color={color}
          compareTimeStampsAndUncheckAfter24Hours={
            compareTimeStampsAndUncheckAfter24Hours
          }
          markItemPurchased={markItemPurchased}
          deleteItem={deleteItem}
          editable={editable}
        /> */}
      </div>
    );
  };

  const renderUnorderedList = (doc, color) => {
    return (
      <div className="flex items-center" key={doc.id}>
        <li
          key={doc.id}
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
            id={doc.id}
            defaultChecked={
              doc.data().checked &&
              compareTimeStampsAndUncheckAfter24Hours(doc, doc.id)
            }
            onClick={(e) => markItemPurchased(doc.id, doc.data())}
          />

          <label htmlFor={doc.id}>
            <p
              aria-label={doc.data().item_name}
              id={doc.id}
              className="text-md md:text-lg cursor-pointer"
            >
              {doc.data().item_name}
            </p>
          </label>
          <button
            className="ml-auto"
            key={doc.id}
            onClick={() => deleteItem(doc)}
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
        <div className="flex mb-5 mt-5">
          <input
            className="w-full pl-5 py-2 rounded bg-midnight-green border border-gray-200"
            type="text"
            placeholder="Find item"
            value={query}
            id="thesearch"
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconButton
            onClick={handleReset}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
            label="clear input"
          />
        </div>

        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && (
          <h2 className="text-2xl mt-10 font-bold text-orange-yellow text-center">
            Loading...
          </h2>
        )}
        {listItems && (
          <>
            {listItems.docs.length === 0 ? (
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
                  {filterByLessThanSevenDays(listItems).length !== 0 && (
                    <span className="text-xl md:text-2xl font-light mt-5">
                      ...within a week
                    </span>
                  )}
                  {filterByLessThanSevenDays(listItems).map((doc) =>
                    renderUnorderedList(doc, 'text-caribbean-green'),
                  )}

                  {filterByMoreThanSevenDaysAndLessThanThirtyDays(listItems)
                    .length !== 0 && (
                    <span className="text-xl md:text-2xl font-light mt-5">
                      ...within a month
                    </span>
                  )}
                  {filterByMoreThanSevenDaysAndLessThanThirtyDays(
                    listItems,
                  ).map((doc) =>
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
                    <span className="text-xl md:text-2xl font-light mt-5">
                      ...inactive
                    </span>
                  )}
                  {filterByInactiveItems(listItems).map((doc) =>
                    renderUnorderedList(doc, 'text-gray-200'),
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
