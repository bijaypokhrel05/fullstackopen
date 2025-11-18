import { useState } from "react"

const Blog = ({ blog }) => {
  const [isDetails, setIsDetails] = useState(false);

  const handleDetails = () => {
    setIsDetails(prev => !prev);
  }
  return (
    <div style={{height: 'auto', width: '100%', border: '1px solid black', marginBottom: '5px', paddingLeft: '2px', paddingTop: '10px'}}>
    {blog.title} {blog.author} {' '}
    <button onClick={handleDetails}>{isDetails ? 'hide' : 'view'}</button>
    {isDetails && (
      <>
        <div>{blog.url}</div>
        <div>likes {blog.likes} <button>likes</button></div>
        <div>{blog.user.name}</div>
      </>
  )}
  </div>  
  )
}

export default Blog