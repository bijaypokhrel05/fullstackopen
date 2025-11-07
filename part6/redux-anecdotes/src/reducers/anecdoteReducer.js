import anecdoteService from '../services/anecdotes'
import { showNotification } from './notificationReducer'

const reducer = (state = [], action) => {
  switch (action.type) {
    case 'INIT_ANECDOTES':
      return action.data
    case 'NEW_ANECDOTE':
      return [...state, action.data]
    case 'VOTE': {
      const id = action.data.id
      return state.map(anecdote =>
        anecdote.id !== id ? anecdote : action.data
      )
    }
    default:
      return state
  }
}

// Async action creators (Exercise 6.15)
// Exercise 6.23: Add error handling
export const initializeAnecdotes = () => {
  return async dispatch => {
    try {
      const anecdotes = await anecdoteService.getAll()
      dispatch({
        type: 'INIT_ANECDOTES',
        data: anecdotes
      })
    } catch (error) {
      // Exercise 6.24: Show error notification
      dispatch(showNotification(`Error fetching anecdotes: ${error.message}`, 5))
    }
  }
}

// Exercise 6.16: Move notification logic to action creator
// Exercise 6.23: Add error handling
export const createAnecdote = (content) => {
  return async dispatch => {
    try {
      const newAnecdote = await anecdoteService.createNew(content)
      dispatch({
        type: 'NEW_ANECDOTE',
        data: newAnecdote
      })
      // Exercise 6.16 & 6.19: Show notification in action creator
      dispatch(showNotification(`you created '${content}'`, 5))
    } catch (error) {
      // Exercise 6.24: Show error notification
      dispatch(showNotification(`Error creating anecdote: ${error.message}`, 5))
    }
  }
}

// Exercise 6.16: Move notification logic to action creator
// Exercise 6.23: Add error handling
export const voteAnecdote = (id) => {
  return async (dispatch, getState) => {
    try {
      const anecdotes = getState().anecdotes
      const anecdoteToVote = anecdotes.find(a => a.id === id)
      
      if (!anecdoteToVote) {
        throw new Error('Anecdote not found')
      }
      
      const votedAnecdote = {
        ...anecdoteToVote,
        votes: anecdoteToVote.votes + 1
      }
      const updatedAnecdote = await anecdoteService.update(id, votedAnecdote)
      dispatch({
        type: 'VOTE',
        data: updatedAnecdote
      })
      // Exercise 6.16 & 6.19: Show notification in action creator
      dispatch(showNotification(`you voted '${anecdoteToVote.content}'`, 5))
    } catch (error) {
      // Exercise 6.24: Show error notification
      dispatch(showNotification(`Error voting: ${error.message}`, 5))
    }
  }
}

export default reducer
