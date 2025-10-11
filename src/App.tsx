import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Features from "./components/Features";
import Comparison from "./components/Comparison";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Home page component
const Home: React.FC = () => {
  return (
    <div>
      <Header />
      <Features />
      <Comparison />
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default App;
