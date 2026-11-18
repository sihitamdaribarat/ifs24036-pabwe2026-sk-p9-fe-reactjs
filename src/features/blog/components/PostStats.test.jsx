import { render, screen } from '@testing-library/react'
import PostStats from './PostStats.jsx'

describe('PostStats', () => {
  it('menampilkan 3 kartu statistik', () => {
    render(<PostStats stats={{ total: 7, published: 4, draft: 3 }} />)
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('Total Selesai / Terbit')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai / Draf')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('7')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('4')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('3')
  })
})
