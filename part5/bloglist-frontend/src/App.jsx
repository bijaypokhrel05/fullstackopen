import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import Login from './components/Login'
import CreateNew from './components/CreateNew'
import Togglable from './components/Togglable'

// Separate component for displaying list of blogs
const Blogs = ({ blogs, setRefresh }) => {
  const sortedBlogs = blogs.sort((a, b) => (b.likes - a.likes));
  return (
    <div>
      {sortedBlogs.map(blog => (
        <Blog key={blog.id} blog={blog} setRefresh={setRefresh} />
      ))}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState(null)
  const [name, setName] = useState('')
  const [isLoggedOut, setIsLoggedOut] = useState(true)
  const [notification, setNotification] = useState(null)
  const [blogsVisible, setBlogsVisible] = useState(true)
  const [refresh, setRefresh] = useState(0);


  // Fetch blogs once on initial render
  useEffect(() => {
    blogService.getAll().then(allBlogs => {
      setBlogs(allBlogs)
    })
  }, [refresh]);

  useEffect(() => {
    if (newBlog) {
      setBlogs(prevBlogs => [...prevBlogs, newBlog])
    }
  }, [newBlog])


  // Notification timeout
  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(() => {
      setNotification(null)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification])

  const handleLogout = () => {
    setIsLoggedOut(true)
    localStorage.removeItem('token')
  }

  return (
    <div>
      {isLoggedOut ? (
        <Login
          setIsLoggedOut={setIsLoggedOut}
          setName={setName}
          setNotification={setNotification}
        />
      ) : (
        <div>
          <h2>blogs</h2>

          {notification && (
            <p
              style={{
                backgroundColor: 'silver',
                color: 'green',
                fontSize: '20px',
                width: 'auto',
                height: '45px',
                borderRadius: '5px',
                border: '3px solid green',
                paddingLeft: '10px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {notification}
            </p>
          )}

          <p>
            {name} is logged in{' '}
            <button onClick={handleLogout}>logout</button>
          </p>

          <Togglable
            buttonLabel="create new blog"
            blogsVisible={blogsVisible}
            setBlogsVisible={setBlogsVisible}
          >
            <CreateNew setNotification={setNotification} setNewBlog={setNewBlog}/>
          </Togglable>

          {blogsVisible && <Blogs blogs={blogs} setRefresh={setRefresh} />}
        </div>
      )}
    </div>
  )
}

export default App
