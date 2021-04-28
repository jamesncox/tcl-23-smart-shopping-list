import { addKeyValuePairToLocalStorage } from '../lib/localStorage';
import getToken from '../lib/tokens';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { db } from '../lib/firebase';
import swal from 'sweetalert';

export default function Home(props) {
  const history = useHistory();
  const [inputValue, setInputValue] = useState('');

  function handleClick() {
    const token = getToken();
    addKeyValuePairToLocalStorage('token', token);
    db.collection(token).add({
      item_name: 'Your Item',
      last_purchased: 'Soon, Later, Whenever',
      purchase_frequency: null,
    });
    // .then((docRef) => {
    //   console.log("New collection added with doc id: ", docRef.id);
    // })
    //
    props.setToken(token);
    swal(
      'List successfully created',
      `Your new token is ${token}. Add your first item!`,
    );
    history.push('/add-item');
    // db.collection(token)
    //   .doc()
    //   .delete()
    //   .then(() => {
    //     console.log('It works! Yay!');
    //   })
    //   .catch((error) => {
    //     console.error('error ');
    //   });
  }

  function handleInputValue(e) {
    setInputValue(e.target.value);
  }

  function checkExistingToken(e) {
    e.preventDefault();
    if (!inputValue) {
      return swal('Please enter your token!', 'Input is empty', 'error');
    }
    db.collection(inputValue.trim())
      .get()
      .then((snap) => {
        if (snap.empty) {
          swal(
            'Token not found!',
            'Please try again or start a new list!',
            'error',
          );
        } else {
          addKeyValuePairToLocalStorage('token', inputValue);
          props.setToken(inputValue);
          history.push('/list');
        }
      });
  }

  return (
    <main>
      <h1>Welcome To CLEVER NAME TO BE DETERMINED List!</h1>
      <p>
        CNTBD is here to add a little more organization to your grocery list. Or
        lists!
      </p>
      <p>To start, either:</p>
      <h2>Create a brand new list</h2>
      <button onClick={handleClick}>Create New List</button>
      <p>Or</p>

      <h2>Enter a 3 word token to access an already existing list.</h2>
      <form onSubmit={checkExistingToken}>
        <label htmlFor="token">
          Please Enter Token:
          <input
            type="text"
            name="token"
            placeholder="Three word token"
            value={inputValue}
            onChange={handleInputValue}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </main>
  );
}
