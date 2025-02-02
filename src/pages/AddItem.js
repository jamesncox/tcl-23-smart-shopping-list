import { useState } from 'react';
import { db } from '../lib/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import Button from '../components/Button';
import uuid from 'react-uuid';
import firebase from 'firebase';

export default function AddItem({ token }) {
  const [itemName, setItemName] = useState('');
  const [purchaseFrequency, setPurchaseFrequency] = useState(null);

  const [listItems] = useCollection(db.collection(token), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const history = useHistory();

  const handleNameChange = (e) => {
    setItemName(e.target.value);
  };

  const handleFrequencyChange = (e) => {
    setPurchaseFrequency(e.target.value);
  };

  const normalizeString = (str) => {
    return str.toLowerCase().replace(/[^\w]|_|\s/g, '');
  };

  const doesItemExistInDatabase = () => {
    const normalizedUserInput = normalizeString(itemName);

    const matchingItemName = listItems.docs.filter((doc) => {
      if (doc.data().item_name) {
        const normalizedDatabaseItem = normalizeString(doc.data().item_name);

        return normalizedDatabaseItem === normalizedUserInput;
      }
      return false;
    });

    return matchingItemName.length !== 0;
  };

  function createListItem(e) {
    e.preventDefault();

    const uniqueId = uuid();

    const newItemObject = {
      item_name: itemName,
      purchase_frequency: parseInt(purchaseFrequency),
      last_purchased: null,
      last_estimate: null,
      times_purchased: 0,
      checked: false,
      id: uniqueId,
    };

    const itemExists = doesItemExistInDatabase(itemName);

    if (itemExists) {
      Swal.fire({
        title: 'OH GOSH!',
        text: `${normalizeString(
          itemName,
        ).toUpperCase()} is already in your list`,

        icon: 'error',
        buttonsStyling: true,
        iconColor: '#EF476F',
        width: '28rem',
        confirmButtonColor: '#073B4C',
      });
    } else if (!itemName || !purchaseFrequency) {
      Swal.fire({
        title: 'UH OH!',
        text: 'Must have an item name and purchase frequency',
        icon: 'warning',
        iconColor: '#F5AB00',
        confirmButtonColor: '#073B4C',
      });
    } else {
      db.collection(token).doc(uniqueId).set(newItemObject);
      if (listItems.docs.length === 0) {
        db.collection(token)
          .doc('sort_order')
          .set({ sort_order: [uniqueId] });
      } else {
        const docRef = db.collection(token).doc('sort_order');

        docRef.update({
          sort_order: firebase.firestore.FieldValue.arrayUnion(uniqueId),
        });
      }
      history.push('/list');
    }
  }

  return (
    <>
      <h1 className="mt-5 mb-10 text-3xl self-start font-light">
        Add New Item
      </h1>
      <form
        onSubmit={createListItem}
        className="flex flex-col items-center w-full"
      >
        <label htmlFor="itemName" className="w-full">
          <input
            className="w-full pl-5 py-2 rounded bg-midnight-green border border-gray-200"
            type="text"
            name="name"
            placeholder="Item Name"
            value={itemName}
            onChange={handleNameChange}
          />
        </label>
        <h2 className="mt-10 mb-5 self-start text-2xl font-light">
          How soon will you buy it?
        </h2>

        <div className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-2 rounded w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mr-5 fill-current text-caribbean-green"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex items-center">
            <input
              type="radio"
              name="frequency"
              id="soon"
              value={7}
              className="h-5 w-5 mr-5 bg-black bg-opacity-20 text-caribbean-green"
              onChange={handleFrequencyChange}
            />
            <label htmlFor="soon" className="text-xl">
              Within a week
            </label>
          </div>
        </div>

        <div className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 p-2 rounded w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mr-5 fill-current text-orange-yellow"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex items-center">
            <input
              type="radio"
              name="frequency"
              id="soonish"
              value={14}
              className="h-5 w-5 mr-5 bg-black bg-opacity-20 text-orange-yellow"
              onChange={handleFrequencyChange}
            />
            <label htmlFor="soonish" className="text-xl">
              Within a month
            </label>
          </div>
        </div>

        <div className="container flex items-center bg-gray-900 bg-opacity-60 md:font-medium my-1 mb-9 p-2 rounded w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mr-5 fill-current text-paradise-pink"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex items-center">
            <input
              type="radio"
              name="frequency"
              id="not soon"
              value={30}
              className="h-5 w-5 mr-5 bg-black bg-opacity-20 text-paradise-pink"
              onChange={handleFrequencyChange}
            />
            <label htmlFor="not soon" className="text-xl">
              After thirty days
            </label>
          </div>
        </div>
        <Button type="submit" text="Add to your list" />
      </form>
      <div className="mb-36" />
    </>
  );
}
