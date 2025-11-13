import { useState } from "react";
import axios from "axios";

function Login({ setIsLoggedOut, setName }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.status === 200) {
                alert(`The user ${response.data.username} is loggedin`);
                localStorage.setItem('token', response.data.token);
                setName(axios.get('/api/users').then(response => setName(response.data.find(user => user.username === username).name)));
                setIsLoggedOut(false);
            }
        } catch (error) {
            setNotification('wrong username or password');
            const status = error.response.status;
            if (status === 401) {
                console.error('Unauthorized! Please login.');
            } else if (status === 500) {
                console.error('Server error! Try again later.');
            } else {
                console.error('Some other error', error.response.data);
            }
        }
    }

    setTimeout(() => {
        setNotification(null);
    }, 5000);

    return (
        <>
            <h1>log in to application</h1>
            {notification && 
                <p style={{backgroundColor: 'silver', color: 'red', fontSize: '20px', width: 'auto', height: '45px', borderRadius: '5px', border: '3px solid red', paddingLeft: '10px', display: 'flex', alignItems: 'center'}}>
                    {notification}</p> }
            <form onSubmit={handleSubmit}>
                <div>
                    <label>username</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} type='text' />
                </div>
                <div>
                    <label>password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' />
                </div>
                <button type='submit'>login</button>
            </form>
        </>
    )
};

export default Login;