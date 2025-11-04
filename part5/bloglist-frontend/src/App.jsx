import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs';
import Login from './components/Login';

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [isLoggedOut, setIsLoggedOut] = useState(true);

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  return (
    <div>
      {isLoggedOut && <Login setIsLoggedOut={setIsLoggedOut} />}
      {!isLoggedOut && (
        <div>
          <h2>blogs</h2>
          {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} />
          )}
        </div>
      )}
    </div>
  )
}

export default App