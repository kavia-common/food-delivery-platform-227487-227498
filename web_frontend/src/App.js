import React from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AppProviders } from "./app/providers/AppProviders";
import { AppRoutes } from "./app/routes/AppRoutes";
import { TopNav } from "./components/layout/TopNav";
import { CustomerBottomBar } from "./components/layout/CustomerBottomBar";

// PUBLIC_INTERFACE
function App() {
  /** Root application shell with providers, routing, and global layout. */
  return (
    <div className="App">
      <BrowserRouter>
        <AppProviders>
          <div className="appShell">
            <TopNav />
            <main className="appMain" role="main">
              <AppRoutes />
            </main>
            <CustomerBottomBar />
          </div>
        </AppProviders>
      </BrowserRouter>
    </div>
  );
}

export default App;
