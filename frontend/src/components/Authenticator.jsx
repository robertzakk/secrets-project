import React, { useState } from "react";
import axios from 'axios';
import "../styles/Authenticator.css";

function Authenticator() {
    const [isSignUpForm, setIsSignUpForm] = useState(false);

    async function onFormSubmitClick(formData) {
        const formDataObject = {};

        for (let [key, value] of formData) {
            formDataObject[key] = value;
        };

        if (isSignUpForm) {
            console.log(formData);
            const response = await axios.post('http://localhost:8080/signup', formDataObject, {
                withCredentials: true
            });

            if (response.status === 201) {
                console.log('User signed up successfully');
            } else {
                console.log('Email already exists.');
            };
        } else {
            const response = await axios.post('http://localhost:8080/signup', formDataObject, {
                withCredentials: true
            });
        
            if (response.status === 200) {
                console.log('User logged in successfully');
            } else {
                console.log('Credentials are incorrect.');
            };
        };
    };

    function onSwitchFormClick() {
        setIsSignUpForm(!isSignUpForm);
    };

    function onLogInWithGoogleClick() {

    };

    function onLogInWithGithubClick() {

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
                    <button onClick={onSwitchFormClick}>
                        {isSignUpForm ? 'Go Back' : 'Sign Up'}
                    </button>
                </form>

                <h3>OR</h3>

                <button onClick={onLogInWithGoogleClick}>Log In with Google</button>
                <button onClick={onLogInWithGithubClick}>Log In with Github</button>
            </div>
        </>
    );
};

export default Authenticator;