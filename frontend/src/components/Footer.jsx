import React from "react";
import "../styles/footer.css";

function Footer() {
    return (
        <>
            <footer>
                <h1>
                    Copyright &#169; {new Date().getFullYear()} Secrets Project.
                    All rights reserved.
                    </h1>
            </footer>
        </>
    );
};

export default Footer;