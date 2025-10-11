import React from "react";
import { BrowserRouter as Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Features from "./components/Features";
import Comparison from "./components/Comparison";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";

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
      </Routes>
  );
};

export default App;

