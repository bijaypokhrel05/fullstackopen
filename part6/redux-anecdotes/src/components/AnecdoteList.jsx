import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { initializeAnecdotes, voteAnecdote } from '../reducers/anecdoteReducer'

const AnecdoteList = () => {
  const anecdotes = useSelector(state => state.anecdotes)
  const filter = useSelector(state => state.filter)
  const dispatch = useDispatch()

  // Exercise 6.14: Initialize anecdotes from server
  useEffect(() => {
    dispatch(initializeAnecdotes())
  }, [dispatch])

  // Filter anecdotes based on filter text
  const filteredAnecdotes = anecdotes.filter(anecdote =>
    anecdote.content.toLowerCase().includes(filter.toLowerCase())
  )

  // Exercise 6.5: Sort anecdotes by votes in descending order
  const sortedAnecdotes = [...filteredAnecdotes].sort((a, b) => b.votes - a.votes)

  // Exercise 6.16: Notification logic moved to action creator
  const vote = (id) => {
    dispatch(voteAnecdote(id))
  }

  return (
    <div>
      {sortedAnecdotes.map(anecdote => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnecdoteList

