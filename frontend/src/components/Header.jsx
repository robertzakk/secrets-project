import React from "react";
import axios from 'axios';
import "../styles/Header.css";

function Header() {
    return (
        <>
            <header>
                <h1>Secrets Project</h1>
                <button onClick={() => {
                    axios.get('http://localhost:8080/user');
                }}>Request User</button>
            </header>
        </>
    );
};

export default Header;