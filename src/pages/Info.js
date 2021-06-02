import Button from '../components/Button';

export default function Info({ token }) {
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
          <p className="text-sm lg:text-lg ml-10">{token}</p>
        </div>
      </div>

      <Button text="Sign out" />
    </>
  );
}
