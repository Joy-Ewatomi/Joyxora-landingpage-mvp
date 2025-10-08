import React from 'react';

const Landing: React.FC = () => {
  return (
    <section className="w-full h-full bg-joyxora-dark text-joyxora-textMuted">
      <div className="grid grid-cols-1 md:grid-cols-2 text-joyxora-green px-12 py-12 font-semibold">
	<div>
	<h1 className="text-white text-bold align-center">welcome to joyxora</h1>
        <h1>left hand size</h1>
	</div>
	<div>
	<h1 className="text-white text-bold align-center">welcome to joyxora</h1>
        <h1>right hand side</h1>
        </div>
	</div>
    </section>
  );
};

export default Landing;
