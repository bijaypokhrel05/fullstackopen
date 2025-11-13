import { useState, useEffect } from 'react'
import Blog from './components/Blog';
import blogService from './services/blogs';
import Login from './components/Login';
import CreateNew from './components/CreateNew';

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [name, setName] = useState('');
  const [isLoggedOut, setIsLoggedOut] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  setTimeout(() => {
    setNotification(null);
  }, 5000);

  return (
    <div>
      {isLoggedOut ? <Login setIsLoggedOut={setIsLoggedOut} setName={setName} setNotification={setNotification}/>
       : (
        <div>
          <h2>blogs</h2>
          {notification && <p style={{backgroundColor: 'silver', color: 'green', fontSize: '20px', width: 'auto', height: '45px', borderRadius: '5px', border: '3px solid green', paddingLeft: '10px', display: 'flex', alignItems: 'center'}}>{notification}</p> }
          <p>
            {name} is logged in 
            <button onClick={() => {
              setIsLoggedOut(true);
              localStorage.removeItem('token');
              }}>logout</button>
          </p>
          <CreateNew setNotification={setNotification} />
          {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} />
          )}
        </div>
      )}
    </div>
  )
}

export default App