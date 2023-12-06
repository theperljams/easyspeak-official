import React from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./App.jsx";
import { reportWebVitals } from "./reportWebVitals.js";

const root = createRoot(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	document.getElementById("root")!,
);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
