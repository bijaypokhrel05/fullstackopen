import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import CreateNew from './CreateNew'

vi.mock('axios')

describe('CreateNew', () => {
  const mockSetNotification = vi.fn()
  const mockSetNewBlog = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Set a mock token in localStorage
    localStorage.setItem('token', 'mock-token-123')
    // Mock window.alert
    window.alert = vi.fn()
  })

  it('calls setNewBlog with the right details when a new blog is created', async () => {
    const user = userEvent.setup()
    const mockBlogResponse = {
      id: '123',
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://test-url.com',
      likes: 0,
      user: {
        name: 'Test User',
        id: 'user123'
      }
    }

    axios.post = vi.fn().mockResolvedValue({ data: mockBlogResponse })

    render(<CreateNew setNotification={mockSetNotification} setNewBlog={mockSetNewBlog} />)

    // Fill in the form fields - inputs don't have labels, so we find them by their position
    const inputs = screen.getAllByRole('textbox')
    const titleInput = inputs[0]
    const authorInput = inputs[1]
    const urlInput = inputs[2]

    await user.type(titleInput, 'Test Blog Title')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'https://test-url.com')

    // Submit the form
    const submitButton = screen.getByText('create')
    await user.click(submitButton)

    // Verify that axios.post was called with the correct data
    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      '/api/blogs',
      {
        title: 'Test Blog Title',
        author: 'Test Author',
        url: 'https://test-url.com'
      },
      {
        headers: {
          Authorization: 'Bearer mock-token-123'
        }
      }
    )

    // Verify that setNewBlog was called with the response data
    expect(mockSetNewBlog).toHaveBeenCalledTimes(1)
    expect(mockSetNewBlog).toHaveBeenCalledWith(mockBlogResponse)

    // Verify that setNotification was also called
    expect(mockSetNotification).toHaveBeenCalledTimes(1)
    expect(mockSetNotification).toHaveBeenCalledWith('a new blog Test Blog Title by Test Author added')
  })
})

