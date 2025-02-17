import React, { useState } from "react";
import { useNavigate } from 'react-router';
import axios from 'axios';
import "../styles/Authenticator.css";

function Authenticator() {
    const [isSignUpForm, setIsSignUpForm] = useState(false);
    let navigate = useNavigate();

    async function onFormSubmitClick(formData) {
        console.log('Form submitted:', formData);
        const formDataObject = {};

        for (let [key, value] of formData) {
            formDataObject[key] = value;
        };

        if (isSignUpForm) {
            try {
                console.log('Signing up...');
                await axios.post('http://localhost:8080/signup', formDataObject, {
                    withCredentials: true
                });
                console.log('User signed up successfully!');
    
                navigate(`/secrets`);
            } catch (err) {
                console.log(`Error: ${err}`);
            };
        } else {
            try {
                await axios.post('http://localhost:8080/login', formDataObject, {
                    withCredentials: true
                });
                
                navigate(`/secrets`);
            } catch (err) {
                console.log(`Error: ${err}`);
            };
        };
    };

    function onSwitchFormClick() {
        setIsSignUpForm(!isSignUpForm);
    };

    function onLogInWithGoogleClick() {

    };

    function onLogInWithGithubClick() {
        console.log('Redirecting to Github authentication...');
        window.location.href = 'http://localhost:8080/auth/github';
    };

    return (
        <>
            <div className='authentication'>
                <h2>Authentication</h2>
                <form action={onFormSubmitClick}>
                    {isSignUpForm && (
                        <>
                            <label>Name</label>
                            <input name='name' required></input>
                        </>
                    )}

                    <label>Email</label>
                    <input name='username' required/>

                    <label>Password</label>
                    <input name='password' required/>

                    <button type='submit'>{isSignUpForm ? 'Sign Up' : 'Log In'}</button>
                    <button type='button' onClick={onSwitchFormClick}>
                        {isSignUpForm ? 'Go Back' : 'Sign Up'}
                    </button>
                </form>

                <h3>OR</h3>

                <button onClick={onLogInWithGoogleClick}>Sign In with Google</button>
                <button onClick={onLogInWithGithubClick}>Sign In with Github</button>
            </div>
        </>
    );
};

export default Authenticator;