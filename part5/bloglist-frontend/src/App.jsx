import { useState, useEffect } from 'react'
import Blog from './components/Blog';
import blogService from './services/blogs';
import Login from './components/Login';
import CreateNew from './components/CreateNew';
import Togglable from './components/Togglable';

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [name, setName] = useState('');
  const [isLoggedOut, setIsLoggedOut] = useState(true);
  const [notification, setNotification] = useState(null);
  const [blogsVisible, setBlogsVisible] = useState(true);


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )  
  }, [blogs])

 useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)

      return () => clearTimeout(timer) // cleanup
    }
  }, [notification])
  
  const Blogs = () => {
    return (
      <div>
        {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} />
          )}
      </div>
    )
  }

  return (
    <div>
      {isLoggedOut ? <Login setIsLoggedOut={setIsLoggedOut} setName={setName} setNotification={setNotification}/>
       : (
        <div>
          <h2>blogs</h2>
          {notification && 
          <p style={{backgroundColor: 'silver', color: 'green', fontSize: '20px', width: 'auto', height: '45px', borderRadius: '5px', border: '3px solid green', paddingLeft: '10px', display: 'flex', alignItems: 'center'}}
            >{notification}</p> }
          <p>
            {name} is logged in 
            <button onClick={() => {
              setIsLoggedOut(true);
              localStorage.removeItem('token');
              }}>logout</button>
          </p>

          <Togglable buttonLabel='create new blog' blogsVisible={blogsVisible} setBlogsVisible={setBlogsVisible}>
            <CreateNew setNotification={setNotification} />
          </Togglable>
          {blogsVisible && <Blogs />}
        </div>
      )}
    </div>
  )
}

export default App