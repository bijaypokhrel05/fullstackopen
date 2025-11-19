import { useState } from "react";
import axios from 'axios';

const Blog = ({ blog, setRefresh }) => {
  const [isDetails, setIsDetails] = useState(false);
  const [likes, setLikes] = useState(blog.likes);

  const handleDetails = () => {
    setIsDetails(prev => !prev);
  }

  const handleLikes = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.put(`/api/blogs/${id}`, {...blog, likes: likes + 1}, config);
      setLikes(likes + 1);
      setRefresh(prev => prev + 1);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div style={{height: 'auto', width: '100%', border: '1px solid black', marginBottom: '5px', paddingLeft: '2px', paddingTop: '10px'}}>
    {blog.title} {blog.author} {' '}
    <button onClick={handleDetails}>{isDetails ? 'hide' : 'view'}</button>
    {isDetails && (
      <>
        <div>{blog.url}</div>
        <div>likes {likes} <button onClick={() => handleLikes(blog.id)}>likes</button></div>
        <div>{blog.user.name}</div>
        <button style={{backgroundColor: 'blue', border: '1px solid white', borderRadius: '8px', padding: '2px 0'}}>remove</button>
      </>
  )}
  </div>  
  )
}

export default Blog