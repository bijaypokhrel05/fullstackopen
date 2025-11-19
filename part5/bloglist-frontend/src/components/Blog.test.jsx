import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('Blog', () => {
  const mockBlog = {
    id: '123',
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'https://test-url.com',
    likes: 5,
    user: {
      name: 'Test User',
      id: 'user123'
    }
  }

  const mockSetRefresh = vi.fn()

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders blog title and author by default', () => {
    const { container } = render(<Blog blog={mockBlog} setRefresh={mockSetRefresh} />)
    // Title and author are rendered together in the same text node
    // Check that both are present in the rendered content
    expect(container).toHaveTextContent('Test Blog Title')
    expect(container).toHaveTextContent('Test Author')
  })

  it('does not render URL or likes by default', () => {
    render(<Blog blog={mockBlog} setRefresh={mockSetRefresh} />)
    const urlElement = screen.queryByText('https://test-url.com')
    const likesElement = screen.queryByText(/likes/)
    expect(urlElement).toBeNull()
    expect(likesElement).toBeNull()
  })

  it('renders URL and likes when view button is clicked', async () => {
    const user = userEvent.setup()
    render(<Blog blog={mockBlog} setRefresh={mockSetRefresh} />)

    // URL and likes should not be visible initially
    expect(screen.queryByText('https://test-url.com')).toBeNull()
    expect(screen.queryByText(/likes/)).toBeNull()

    // Click the view button
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    // URL and likes should now be visible
    expect(screen.getByText('https://test-url.com')).toBeInTheDocument()
    expect(screen.getByText(/likes 5/)).toBeInTheDocument()
  })
})

