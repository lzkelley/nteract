// @flow
import * as React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";

type JupyterConfigData = {
  token: string,
  page: "tree" | "view" | "edit",
  contentsPath: string,
  baseUrl: string,
  appVersion: string
};

import { NotebookApp } from "@nteract/core/providers";

function createApp(jupyterConfigData: JupyterConfigData) {
  const store = configureStore({ config: jupyterConfigData });
  window.store = store;

  class App extends React.Component<*> {
    notificationSystem: NotificationSystem;

    componentDidMount(): void {
      store.dispatch({ type: "LOAD", path: jupyterConfigData.contentsPath });
    }

    render(): React$Element<any> {
      return (
        <Provider store={store}>
          <div>
            <NotebookApp />
            <NotificationSystem
              ref={notificationSystem => {
                this.notificationSystem = notificationSystem;
              }}
            />
            <style jsx global>{`
              body {
                font-family: "Source Sans Pro";
                font-size: 16px;
                line-height: 22px;
                background-color: var(--main-bg-color);
                color: var(--main-fg-color);
                /* All the old theme setups declared this, putting it back for consistency */
                line-height: 1.3 !important;
              }

              #app {
                padding-top: 20px;
              }

              @keyframes fadeOut {
                from {
                  opacity: 1;
                }
                to {
                  opacity: 0;
                }
              }

              div#loading {
                animation-name: fadeOut;
                animation-duration: 0.25s;
                animation-fill-mode: forwards;
              }
            `}</style>
          </div>
        </Provider>
      );
    }
  }

  return App;
}

function main(rootEl: Element, dataEl: Node | null) {
  // When the data element isn't there, provide an error message
  // Primarily for development usage
  const ErrorPage = (props: { error?: Error }) => (
    <React.Fragment>
      <h1>ERROR</h1>
      <pre>Unable to parse / process the jupyter config data.</pre>
      {props.error ? props.error.message : null}
    </React.Fragment>
  );

  if (!dataEl) {
    ReactDOM.render(<ErrorPage />, rootEl);
    return;
  }

  let jupyterConfigData: JupyterConfigData;

  try {
    jupyterConfigData = JSON.parse(dataEl.textContent);
  } catch (err) {
    ReactDOM.render(<ErrorPage error={err} />, rootEl);
    return;
  }

  const App = createApp(jupyterConfigData);
  ReactDOM.render(<App />, rootEl);
}

const rootEl = document.querySelector("#root");
const dataEl = document.querySelector("#jupyter-config-data");

// $FlowFixMe: querySelector can return null so this freaks out.
main(rootEl, dataEl);
