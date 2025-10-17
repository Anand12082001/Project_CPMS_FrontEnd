import React, { useState } from 'react';
import HeroImg from '../../assets/heroImg.jpg';
import { useNavigate } from 'react-router-dom';

function LandingHeroPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleCreateAccount = () => {
    if (email.trim()) {
      navigate('/student/signup', {
        state: { prefillEmail: email }
      });
    } else {
      navigate('/student/signup');
    }
  }

  const handleScrollAbout = () => document.getElementById('about').scrollIntoView();

  return (
    <section
      id="home"
      className="relative h-[90vh] w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${HeroImg})` }}
    >
      {/* Dark glass overlay */}
      <div className="absolute inset-0 bg-black/40 bg-opacity-20 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-20 max-w-5xl text-center">
        <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight drop-shadow-md">
          Empower Your Career with <br />
          <span className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            CPMS Portal
          </span>
        </h1>

        <p className="mt-6 text-gray-300 text-lg sm:text-xl font-light">
          Discover opportunities, track progress, and connect with your tpo — all in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <input
            type="email"
            className="px-5 py-3 w-80 sm:w-96 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-green-400 text-black transition duration-300"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 transition duration-300 px-6 py-3 rounded-xl text-white font-semibold shadow-lg"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
        </div>

        {/* Call-to-action */}
        <div className="mt-8">
          <p
            className="inline-block cursor-pointer mt-4 text-sm text-white opacity-70 hover:opacity-100 transition duration-300 underline underline-offset-4"
            onClick={handleScrollAbout}
          >
            Learn more about CPMS
          </p>
        </div>
      </div>
    </section>
  );
}

export default LandingHeroPage;
