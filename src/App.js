import React, { useEffect, useState } from 'react';
import { checkLocalStorageForKey } from './lib/localStorage';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './stylesheets/App.css';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import List from './pages/List';
import AddItem from './pages/AddItem';
import Info from './pages/Info';

const App = () => {
  const [token, setToken] = useState('');
  const [listData, setListData] = useState([]);

  useEffect(() => {
    const retrievedToken = checkLocalStorageForKey('token', '');
    setToken(retrievedToken);
  }, []);

  return (
    <Router>
      <main className="flex flex-col items-center bg-midnight-green min-h-screen text-gray-200 font-roboto mx-auto px-5 md:px-36 lg:px-48 xl:px-72 lg:w-2/3">
        {token ? (
          <>
            <Switch>
              <Route exact path="/">
                <Home setToken={setToken} currentToken={token} />
              </Route>
              <Route exact path="/list">
                <List
                  token={token}
                  listData={listData}
                  setListData={setListData}
                />
              </Route>
              <Route exact path="/add-item">
                <AddItem token={token} />
              </Route>
              <Route exact path="/info">
                <Info token={token} setToken={setToken} />
              </Route>
            </Switch>
            <NavBar />
          </>
        ) : (
          <Home setToken={setToken} currentToken={token} />
        )}
      </main>
    </Router>
  );
};

export default App;
