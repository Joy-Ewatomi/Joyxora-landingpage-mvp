import React from 'react';
import { useNavigate } from 'react-router-dom';

 const navigate = useNavigate(); // Step 1: Initialize useNavigate

    <div className="mt-12 text-center">
      <button
        onClick={() => navigate('/Landing')} // Step 3: Navigate to Landing
        className="px-10 py-4 rounded-2xl bg-gradient-to-r from-joyxora-gradientFrom to-joyxora-gradientTo text-black font-extrabold hover:scale-105 transition-transform"
      >
        🔐 Check Out the MVP
      </button>
    </div>
  );
};

export default YourComponent;
