import React, { useRef, useState, useEffect } from 'react';
import Button from '../components/Button';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import honeyDoCurve from './../img/honey-do-curved-600px.png';

export default function Info({ token, setToken }) {
  const history = useHistory();
  const tokenRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    return () => {
      clearTimeout();
    };
  }, []);

  const copyToClipBoard = (e) => {
    let r = document.createRange();
    r.selectNode(tokenRef.current);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const handleSignOut = () => {
    Swal.fire({
      icon: 'warning',
      iconColor: '#DC2626',
      title: 'Sign out?',
      text: 'Make sure to save your token',
      showCancelButton: true,
      cancelButtonText: 'Sign out',
      cancelButtonColor: '#DC2626',
      confirmButtonColor: '#073B4C',
      confirmButtonText: 'Remain Signed In',
    }).then((result) => {
      if (result.isDismissed) {
        localStorage.clear();
        setToken('');
        history.push('/');
      }
    });
  };

  return (
    <>
      <h1 className="mt-5 mb-5 text-3xl self-start font-light">Information</h1>

      <div
        className="bg-teal-blue mb-5 border-t-4 rounded-b text-midnight-green border-caribbean-green px-4 py-3 shadow-md w-full"
        role="alert"
      >
        <div className="flex items-center">
          <div className="py-1 text-caribbean-green">
            <svg
              className="fill-current h-6 w-6 text-teal-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
            </svg>
          </div>
          <div className="flex items-center">
            <p className="text-sm lg:text-lg font-bold">Your token</p>
          </div>
          <p
            className="text-sm lg:text-lg ml-3 md:ml-10"
            ref={tokenRef}
            value={token}
          >
            {token}
          </p>
          <button
            className="flex ml-auto text-midnight-green items-center hover:text-caribbean-green 
            hover:text-caribbean-green "
            type="button"
            aria-label={!copySuccess ? 'To Copy' : 'Copied Success'}
            onClick={copyToClipBoard}
          >
            {!copySuccess ? (
              <>
                <p className="mr-1 text-sm lg:text-lg">Copy</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 focus:outline-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </>
            ) : (
              <>
                <p className="mr-1 text-caribbean-green text-sm lg:text-lg">
                  Copied!
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-caribbean-green focus:outline-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <section className="self-start my-5">
        <h2 className="text-2xl self-start font-light mb-5">About Honey Do</h2>
        <p>
          A “smart” shopping list app that learns your buying habits and helps
          you remember what you’re likely to need to buy on your next trip to
          the store.
        </p>
        <p className="mt-5">
          As you purchase items, Honey Do will re-prioritize items by frequency
          based both on which category you select and how often you buy each
          item.
        </p>
        <p className="mt-5">Thank you for using Honey Do!</p>
        <img
          src={honeyDoCurve}
          alt="colorful circular logo with half of a honeydew melon as a shopping basket with grocery items coming out of it"
          className="md:max-w-md w-56 h-56 md:w-72 md:h-72 mt-5 md:mt-2 m-auto"
        />
      </section>

      <Button text="Sign out" onClick={handleSignOut} />
      <div className="mb-36" />
    </>
  );
}
