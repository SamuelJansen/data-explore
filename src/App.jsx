import './App.css';
import React from 'react';
import { AppContext } from './context/AppContext'
import { useContextState } from './context-manager/ContextState'
import { AuthenticationServiceProvider } from './service/authentication/AuthenticationService';
import { StyleServiceProvider } from './service/style/StyleService';
import { TopbarComponent } from './component/header/TopbarComponent';

const App = () => {
  const [styleService] = useContextState(() => StyleServiceProvider())
  const [authenticationService] = useContextState(() => AuthenticationServiceProvider())
  return (
    <AppContext.Provider value={{styleService, authenticationService}}>
      <div
        style={styleService.build({
          position: "absolute",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: styleService.getColorMode().component.base
        })}
      >
        <TopbarComponent />
      </div>
    </AppContext.Provider>
  );
}

export default App;