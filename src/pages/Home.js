import { addKeyValuePairToLocalStorage } from '../lib/localStorage';
import getToken from '../lib/tokens';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { db } from '../lib/firebase';
import Swal from 'sweetalert2';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import honeyDoCurve from './../img/honey-do-curved-600px.png';
import { Redirect } from 'react-router';

export default function Home({ setToken, currentToken }) {
  const history = useHistory();
  const [inputValue, setInputValue] = useState('');

  function createNewList() {
    const token = getToken();
    addKeyValuePairToLocalStorage('token', token);
    setToken(token);

    db.collection('shopping_lists').doc(token).set({
      // items: [],
      sort_order: [],
    });

    db.collection('shopping_lists')
      .doc(token)
      .collection('items')
      .doc()
      .set({ initial_entry: 'hello world' })

      .then(() => {
        console.log('Document successfully written!');
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });

    Swal.fire({
      icon: 'success',
      iconColor: '#048B67',
      confirmButtonColor: '#073B4C',
      title: 'List successfully created!',
      text: `Your new token is "${token}"`,
    });
    history.push('/list');
  }

  function handleTokenInput(e) {
    setInputValue(e.target.value.toLowerCase());
  }

  function checkExistingToken(e) {
    e.preventDefault();
    if (!inputValue) {
      return Swal.fire({
        icon: 'error',
        iconColor: '#EF476F',
        title: 'Please enter your token.',
        text: 'Input is empty',
        confirmButtonColor: '#073B4C',
      });
    }

    db.collection('shopping_lists')
      .doc(inputValue.trim())
      .get()
      .then((doc) => {
        if (doc.exists) {
          addKeyValuePairToLocalStorage('token', inputValue);
          setToken(inputValue);
          history.push('/list');
        } else {
          Swal.fire({
            icon: 'error',
            iconColor: '#EF476F',
            title: 'Token not found',
            text: 'Please try again or start a new list!',
            confirmButtonColor: '#073B4C',
          });
        }
      });
  }

  if (currentToken !== '') {
    return <Redirect to="/list" />;
  } else {
    return (
      <div>
        <h1 className="mt-5 text-3xl md:text-4xl text-center self-start font-light">
          Welcome to Honey Do
        </h1>
        <h2 className="text-2xl md:text-3xl text-center self-start font-thin md:mt-2">
          Your smart shopping list
        </h2>
        <img
          src={honeyDoCurve}
          alt="colorful circular logo with half of a honeydew melon as a shopping basket with grocery items coming out of it"
          className="md:max-w-md md:m-auto p-4 md:p-8"
        />
        <h2 className="text-2xl font-light mb-5">Get organized now</h2>
        <Button onClick={createNewList} text="Start a new list" />

        <h2 className="text-2xl font-light mt-10">
          ...or join an existing list
        </h2>
        <form onSubmit={checkExistingToken} className="mb-10">
          <label className="opacity-0 text-xs" htmlFor="token">
            Please Enter Token
          </label>
          <div className="flex">
            <input
              type="text"
              className="pl-5 py-2 w-full rounded bg-midnight-green border border-gray-200"
              name="token"
              placeholder="three word token"
              value={inputValue}
              onChange={handleTokenInput}
            />
            <IconButton
              type="submit"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              }
              label="submit token"
            />
          </div>
        </form>
      </div>
    );
  }
}
