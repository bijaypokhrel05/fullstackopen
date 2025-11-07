import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { createAnecdote } from '../reducers/anecdoteReducer'

const AnecdoteForm = () => {
  const dispatch = useDispatch()
  const [newAnecdote, setNewAnecdote] = useState('')

  const handleInputChange = (event) => {
    setNewAnecdote(event.target.value)
  }

  // Exercise 6.16: Notification logic moved to action creator
  const createAnecdoteHandler = (event) => {
    event.preventDefault()
    dispatch(createAnecdote(newAnecdote))
    setNewAnecdote('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={createAnecdoteHandler}>
        <div>
          <input onChange={handleInputChange} value={newAnecdote}/>
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm

