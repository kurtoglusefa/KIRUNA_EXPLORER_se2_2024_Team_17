import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button } from 'react-bootstrap';
import '../WelcomePage.css';

const WelcomePage = () => {
    return (
        <div className="welcome-page">
            <div className="background-image"></div>
            {/* Logo */}
            <div className="logo">
              <a href="/">
                <img src="/kiruna2.webp" alt="Logo" className="logo-img" />
              </a>
            </div>

            {/* Welcome message */}
            <div className="welcome-message">
                <h1>Welcome to Kiruna eXplorer</h1>
                <p>Join us in mapping the transformation of Kiruna as we relocate this unique city!</p>
                <Button variant='light' className='welcome-message-button mb-1 mt-5 rounded-pill px-5 py-3' href='/home'>
                  <h4>Explore the Move!</h4>
                  <div className="popup-message">Discover the journey of relocating Kiruna city.</div>
                </Button>
            </div>
        </div>
    );
}

export default WelcomePage;
