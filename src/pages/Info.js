import React, { useRef, useState } from 'react';
import Button from '../components/Button';

export default function Info({ token }) {
  const tokenRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipBoard = (e) => {
    console.log(tokenRef.current);

    let r = document.createRange();
    r.selectNode(tokenRef.current);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000);
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
            <p className="font-bold">Your token</p>
          </div>
          <p
            className="text-sm lg:text-lg ml-5 md:ml-10"
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
                <p className="mr-2 invisible md:visible text-sm lg:text-lg">
                  Copy
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 focus:outline-none"
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
                <p className="mr-2 invisible md:visible text-sm lg:text-lg">
                  Copied!
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-caribbean-green focus:outline-none"
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

      <Button text="Sign out" />
    </>
  );
}
