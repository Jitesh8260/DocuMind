import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [authed, setAuthed] = useState(false);

  if (!authed) return <Login setAuthed={setAuthed} />;

  return <Dashboard />;
}
