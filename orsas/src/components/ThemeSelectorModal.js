import { useState } from "react";
import { useThemeContext } from '../context/ThemeContext'; // Import the useThemeContext hook

import filledCircle from './images/filled-circle-icon.png';
import notFilledCircle from './images/not-filled-circle-icon.png';
import './css/themeModal.css';

export const ThemeSelectorModal = ({ clicked, setClicked }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('auto');
  const { isDark, setIsDark } = useThemeContext(); // Use the context

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setClicked(false);
  };

  const chooseOption = (option) => {
    setSelectedOption(option);
    if (option !== 'auto') {
      if (option === 'dark' && !isDark) {
        setIsDark(true);
      } else if (option === 'light' && isDark) {
        setIsDark(false);
      }
    } else {
      const isBrowserThemeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark !== isBrowserThemeDark) {
        setIsDark(v => !v);
      }
    }
  };

  return (
    <>
      <div>
        <div onClick={openModal}></div>
        {clicked && (
          <div className="theme-modal-div" style={{ backgroundColor: isDark ? "#4D638C" : "#FFFFFF", color: isDark ? 'gainsboro' : 'black' }}>
            <a style={{ fontSize: "16px", fontWeight: "600", lineHeight: "24px", color: isDark ? 'gainsboro' : 'black' }}>Theme</a>
            <a onClick={() => chooseOption('auto')} style={{ color: isDark ? 'gainsboro' : 'black' }}>
              <img style={{ height: "6px", width: "6px", marginRight: "5px" }} src={selectedOption === 'auto' ? filledCircle : notFilledCircle} alt="auto-icon" />
              Auto
            </a>
            <a onClick={() => chooseOption('light')} style={{ color: isDark ? 'gainsboro' : 'black' }}>
              <img style={{ height: "6px", width: "6px", marginRight: "5px" }} src={selectedOption === 'light' ? filledCircle : notFilledCircle} alt="light-icon" />
              Light
            </a>
            <a onClick={() => chooseOption('dark')} style={{ color: isDark ? 'gainsboro' : 'black' }}>
              <img style={{ height: "6px", width: "6px", marginRight: "5px" }} src={selectedOption === 'dark' ? filledCircle : notFilledCircle} alt="dark-icon" />
              Dark
            </a>
            <button style={{ marginTop: "10px" }} onClick={closeModal}>
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
};
