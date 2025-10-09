import React from "react";
import Header from "./components/Header";
import Features from "./components/Features";
import Comparison from "./components/Comparison";
import Footer from "./components/Footer";
{/*import HeroActions from "./components/HeroActions";*/}
{/*import WaitlistModal from "./components/WaitlistModal"; // optional*/}

const App: React.FC = () => {
  return (
    <div>
      <Header />
      <Features />
      <Comparison />
      <Footer /> 
      {/* <HeroActions /> */}
      {/* <WaitlistModal /> */}
    </div>
  );
};

export default App;
