import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'
import { useState, useEffect } from 'react'
import AppContext from './AppContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Authentication';
import Default from './components/Default';
import Home from './components/Home';
import Document from './components/Document';
import Documents from './components/Documents';
import API from './API';
import ModifyDocument from './components/ModifyDocument';
import MyNavbar from './components/MyNavbar';

function App() {
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  // Authentication check
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        setLoggedIn(false);
        setUser(undefined);
      }
    }
    checkAuth();
  }, []);

  function loginSuccessful(user) {
    setUser(user);
    setLoggedIn(true);
  }

  async function doLogout() {
    await API.logout();
    setLoggedIn(false);
    setUser(undefined);
  }


  return (
    <BrowserRouter>
      <AppContext.Provider value={{
        loginState: {
          user: user,
          loggedIn: loggedIn,
          loginSuccessful: loginSuccessful,
          doLogout: doLogout
        }
      }}>
        <Routes>
          <Route path="/login" element={<><Login /></>} />
          <Route path="/" element={<><MyNavbar /><Home /></>} />
          <Route path="/addDocument" element={<><MyNavbar /><Document /></>} />
          <Route path="/documents" element={<><Documents /></>} />
          <Route path="/documents/modify-document/:documentId" element={<><MyNavbar /><ModifyDocument/></>} />
          <Route path="/documents/create-document" element={<><MyNavbar /><ModifyDocument /></>} />
          <Route path="/*" element={<><MyNavbar /><Default /></>} />
        </Routes>

      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App;
