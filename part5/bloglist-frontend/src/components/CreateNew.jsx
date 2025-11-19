import { useState } from 'react';
import axios from 'axios';

function CreateNew({setNotification, setNewBlog}) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            console.log(token);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.post('/api/blogs', {title, author, url}, config);
            setNotification(`a new blog ${title} by ${author} added`)
            setNewBlog(response.data)
            setTitle('');
            setAuthor('');
            setUrl('');
            alert(`${response.data.title} is saved successfully!`);
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>create new</h1>
            <div>title:<input value={title} onChange={(e) => setTitle(e.target.value)} /></div> 
            <div>author:<input value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
            <div>url:<input value={url} onChange={(e) => setUrl(e.target.value)} /></div>
            <button type='submit'>create</button>
        </form>
    )
};

export default CreateNew;