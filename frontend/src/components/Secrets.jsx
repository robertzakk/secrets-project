import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../styles/Secrets.css';

function Secrets() {
    const [userData, setUserData] = useState(null);
    const [userSecrets, setUserSecrets] = useState([]);
    const [isAddingSecret, setIsAddingSecret] = useState(false);
    const [isSecretBeingPosted, setIsSecretBeingPosted] = useState(false);
    const [newSecret, setNewSecret] = useState('');

    useEffect(() => {
        async function fetchUserData() {
            const response = await axios.get('http://localhost:8080/user', { withCredentials: true });
    
            setUserData(response.data);
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        console.log("Fetching user secrets...");
        async function fetchUserSecrets() {
            const response = await axios.get('http://localhost:8080/secrets', { withCredentials: true  });

            setUserSecrets(response.data);
        };
        console.log("Fetched user secrets.");
        
        for (let secret of userSecrets) {
            console.log(secret.secret);
        }
        fetchUserSecrets();
    }, [isSecretBeingPosted]);

    function enableAddingSecret() {
        setIsAddingSecret(true);
    };

    function onNewSecretChange(event) {
        setNewSecret(event.target.value);
    };

    function addSecret() {
        if (!isSecretBeingPosted) {
            setIsSecretBeingPosted(true);
            axios.post('http://localhost:8080/secret', { secret: newSecret }, { withCredentials: true }).then((value) => {
                setNewSecret('');
                setIsAddingSecret(false);
                setIsSecretBeingPosted(false);
            }).catch((err) => {
                console.log(err);
            });
        }
    };

    return (
        <>
            <div className='secrets-page'>
                <h1>{userData ? userData.name : 'Loading'}</h1>

                <div className='secrets'>
                    <h2>Your Secrets</h2>
                    <div>
                        {
                            userSecrets.map((secret, index) => {
                                return <p key={index}>{secret.secret}</p>
                            })
                        }

                        { isAddingSecret && (
                            <>
                                <form className='secret-edit' action={addSecret}>
                                    <textarea onChange={onNewSecretChange} value={newSecret}></textarea>
                                    <button onClick={addSecret} type="submit">Add</button>
                                </form>
                            </>
                        )}
                        <button 
                            className='add-secret' 
                            style={{backgroundColor: isAddingSecret && "GrayText"}} 
                            onClick={enableAddingSecret}>Add
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

};


export default Secrets;