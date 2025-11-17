import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import Login from './components/Login'
import CreateNew from './components/CreateNew'
import Togglable from './components/Togglable'

// Separate component for displaying list of blogs
const Blogs = ({ blogs }) => (
  <div>
    {blogs.map(blog => (
      <Blog key={blog.id} blog={blog} />
    ))}
  </div>
)

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [name, setName] = useState('')
  const [isLoggedOut, setIsLoggedOut] = useState(true)
  const [notification, setNotification] = useState(null)
  const [blogsVisible, setBlogsVisible] = useState(true)

  // Fetch blogs once on initial render
  useEffect(() => {
    blogService.getAll().then(allBlogs => {
      setBlogs(allBlogs)
    })
  }, [])

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
            <CreateNew setNotification={setNotification} />
          </Togglable>

          {blogsVisible && <Blogs blogs={blogs} />}
        </div>
      )}
    </div>
  )
}

export default App
