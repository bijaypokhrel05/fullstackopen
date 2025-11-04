import { useState } from "react";
import axios from "axios";

function Login({ setIsLoggedOut }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.status === 200) {
                alert(`The user ${response.data.username} is loggedin`);
                setIsLoggedOut(false);
            }
        } catch (error) {
            alert('Login failed: ' + error.response?.data?.error || error.message);
        }
    }

    return (
        <>
            <h1>log in to application</h1>
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