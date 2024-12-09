import { Button } from 'react-bootstrap';
import '../WelcomePage.css';
import { useContext } from 'react';
import AppContext from '../AppContext';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const navigate = useNavigate();
    const setViewMode = useContext(AppContext).viewMode.setViewMode;

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
                <div className='welcome-message-button'>
                  <Button variant='light' className=' mb-1 mt-5 mx-2 rounded-pill px-5 py-3' onClick={() => {setViewMode('map'); navigate('/home')}}>
                    <h4>Explore the <span style={{color:'#E63946'}}>Map</span>!</h4>
                    <div className="popup-message">Discover the journey of relocating Kiruna city.</div>
                  </Button>
                  <Button variant='light' className=' mb-1 mt-5 mx-2 rounded-pill px-5 py-3' onClick={() => {setViewMode('diagram'); navigate('/home')}}>
                    <h4>Explore the <span style={{color:'#2A9D8F'}}>Diagram</span>!</h4>
                    <div className="popup-message">Discover the journey of relocating Kiruna city.</div>
                  </Button>
                </div>
            </div>
        </div>
    );
}

export default WelcomePage;
