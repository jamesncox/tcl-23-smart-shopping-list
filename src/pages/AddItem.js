import { useState } from 'react';
import { db } from '../lib/firebase';
// import { useCollection } from 'react-firebase-hooks/firestore';

export default function AddItem(props) {
  const [itemName, setItemName] = useState('');
  const [purchaseFrequency, setPurchaseFrequency] = useState(0);
  const [lastPurchased] = useState(null);

  const handleName = (e) => {
    setItemName(e.target.value);
  };

  const handleFrequency = (e) => {
    setPurchaseFrequency(e.target.value);
  };

  const createListItem = (e) => {
    e.preventDefault();
    db.collection('generated_token')
      .add({
        item_name: itemName,
        purchase_frequency: parseInt(purchaseFrequency),
        last_purchased: lastPurchased,
      })
      .then((documentReference) => {
        console.log('document reference ID', documentReference.id);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <>
      <h1>Add Item</h1>
      <form onSubmit={(e) => createListItem(e)}>
        <label>
          Item Name
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => handleName(e)}
          />
        </label>
        <br />
        <label>
          Purchase Frequency
          <select onBlur={handleFrequency}>
            <option value={7}>Soon</option>
            <option value={14}>Kind of Soon</option>
            <option value={30}>Not Soon</option>
          </select>
        </label>
        <input type="submit" value="Submit" />
      </form>
    </>
  );
}
