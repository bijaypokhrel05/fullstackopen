// Exercise 6.20-6.22: Store timeout ID to clear previous timeouts
let timeoutId = null

const notificationReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return action.data.message
    case 'CLEAR_NOTIFICATION':
      return null
    default:
      return state
  }
}

export const setNotification = (message) => {
  return {
    type: 'SET_NOTIFICATION',
    data: { message }
  }
}

export const clearNotification = () => {
  return {
    type: 'CLEAR_NOTIFICATION'
  }
}

// Exercise 6.19-6.22: Helper function that sets and auto-clears notification
// Exercise 6.20: Clear previous timeout when new notification is set
export const showNotification = (message, seconds = 5) => {
  return dispatch => {
    // Exercise 6.20: Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    dispatch(setNotification(message))
    
    // Exercise 6.20: Store the new timeout ID
    timeoutId = setTimeout(() => {
      dispatch(clearNotification())
      timeoutId = null
    }, seconds * 1000)
  }
}

export default notificationReducer

