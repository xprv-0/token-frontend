import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import App from "./app";
import reportWebVitals from "./reportWebVitals";

const dsn = process.env.REACT_APP_SENTRY_DSN || false;

/* istanbul ignore next */
if (dsn) {
  Sentry.init({
    dsn,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.request?.url?.includes("/claim?")) {
        return {
          ...event,
          request: { ...event.request, url: event.request?.url.split("?")[0] },
        };
      }
      return event;
    },
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
