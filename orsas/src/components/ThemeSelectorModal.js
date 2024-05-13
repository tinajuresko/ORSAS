import { useState } from "react";

import filledCircle from './images/filled-circle-icon.png'
import notFilledCircle from './images/not-filled-circle-icon.png'
import './css/themeModal.css'



export const ThemeSelectorModal = ({ clicked, setClicked, isDark, setIsDark }) => {
    
    const [showModal, setShowModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState('auto')

    

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setClicked(false);
    };


    // Situacije u kojima se treba promjeniti tema, 
    // ovisno o trenutnoj temi, odabranoj temi i default browser temi
    const chooseOption = (option) => {
        setSelectedOption(option)
        if (option !== 'auto') {
            if(option === 'dark' && !isDark) {
                setIsDark(true)
            } else if (option === 'light' && isDark) {
                setIsDark(false)
            }
        } else {
            const isBrowserThemeDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            if(isDark !== isBrowserThemeDark) {
                setIsDark(v => !v)
            }
        }
    }


    return(
        <>
            <div>
                <div onClick={openModal}>
                
                </div>
                {clicked && (
                    <div className="theme-modal-div" style={{ backgroundColor: isDark ? "#4D638C" : "#FFFFFF", color: isDark ? 'gainsboro' : 'black' }}>
                        <a style={{fontSize: "16px", fontWeight: "600", lineHeight: "24px", color: isDark ? 'gainsboro' : 'black'}}>Theme</a>
                        <a onClick={() => chooseOption('auto')} style={{color: isDark ? 'gainsboro' : 'black'}}>
                            <img style={{height: "6px", width: "6px", marginRight: "5px"}} src={selectedOption === 'auto' ? filledCircle : notFilledCircle} alt="auto-icon"></img>
                            Auto
                        </a>
                        <a onClick={() => chooseOption('light')} style={{color: isDark ? 'gainsboro' : 'black'}}>
                            <img style={{height: "6px", width: "6px", marginRight: "5px"}} src={selectedOption === 'light' ? filledCircle : notFilledCircle} alt="light-icon"></img>
                            Light
                        </a>
                        <a onClick={() => chooseOption('dark')} style={{color: isDark ? 'gainsboro' : 'black'}}>
                            <img style={{height: "6px", width: "6px", marginRight: "5px"}} src={selectedOption === 'dark' ? filledCircle : notFilledCircle} alt="dark-icon"></img>
                            Dark
                        </a>
                        <button style={{marginTop: "10px"}} onClick={closeModal}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

