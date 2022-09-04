import './App.css';
import React from 'react';
import { AppContext } from './context/AppContext'
import { useContextState } from './context-manager/ContextState'
import { AuthenticationServiceProvider } from './service/authentication/AuthenticationService';
import { AppHeader } from './component/header/AppHeader';

const App = () => {
  const [authenticationService] = useContextState(() => AuthenticationServiceProvider())
  return (
    <AppContext.Provider value={{authenticationService}}>
      <div className="App">
        <AppHeader>

        </AppHeader>
      </div>
    </AppContext.Provider>
  );
}

export default App;