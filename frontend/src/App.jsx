import React from "react";
import {BrowserRouter, Routes, Route } from 'react-router';
import Page from "./components/Page";
import PageNotFound from "./components/PageNotFound";
import Authenticator from "./components/Authenticator";
import Secrets from "./components/Secrets";
import "./styles/App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Page />}>
            <Route path='authentication' element={<Authenticator />}/>

            <Route path='secrets' element={<Secrets />}/>
          </Route>

          <Route path="*" element={<PageNotFound />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;