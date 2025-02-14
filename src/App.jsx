import "./App.css";
import { Routes, Route } from "react-router-dom";
import Auth from "./Components/Auth";
import Dashboard from "./Components/Dashboard";
import UpdateTask from "./Components/UpdateTask";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/updatetask/:id" element={<UpdateTask />} />
      </Routes>
    </>
  );
}

export default App;
