import { useState } from "react";
import axios from 'axios';

const Blog = ({ blog, setRefresh }) => {
  const [isDetails, setIsDetails] = useState(false);
  const [likes, setLikes] = useState(blog.likes);

  const handleDetails = () => {
    setIsDetails(prev => !prev);
  }

  // Helper function to decode JWT token and get user ID
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).id;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const confirmDelete = window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`);
      if (!confirmDelete) return;
      await axios.delete(`/api/blogs/${id}`, config);
      setRefresh(prev => prev + 1);
    } catch(err) {
      console.error('Error deleting blog:', err);
      if (err.response && err.response.status === 401) {
        alert('You are not authorized to delete this blog');
      } else if (err.response && err.response.status === 404) {
        alert('Blog not found');
      } else {
        alert('Error deleting blog. Please try again.');
      }
    }
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

  const currentUserId = getUserIdFromToken();
  const blogUserId = blog.user?.id || blog.user?._id;
  const showDeleteButton = blog.user && currentUserId && blogUserId && String(blogUserId) === String(currentUserId);

  return (
    <div style={{height: 'auto', width: '100%', border: '1px solid black', marginBottom: '5px', paddingLeft: '2px', paddingTop: '10px'}}>
    {blog.title} {blog.author} {' '}
    <button onClick={handleDetails}>{isDetails ? 'hide' : 'view'}</button>
    {isDetails && (
      <>
        <div>{blog.url}</div>
        <div>likes {likes} <button onClick={() => handleLikes(blog.id)}>likes</button></div>
        <div>{blog.user.name}</div>
        {showDeleteButton && (
          <button style={{backgroundColor: 'blue', border: '1px solid white', borderRadius: '8px', padding: '2px 2px'}}
          onClick={() => handleDelete(blog.id)}>remove</button>
        )}
      </>
  )}
  </div>  
  )
}

export default Blog