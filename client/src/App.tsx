import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import ExpertPage from './pages/ExpertPage'
import ExpertRegistrationPage from './pages/ExpertRegistrationPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/experts/:expertId', element: <ExpertPage /> },
      { path: '/book/:expertId', element: <BookingPage /> },
      { path: '/bookings', element: <BookingsPage /> },
      { path: '/register-expert', element: <ExpertRegistrationPage /> },
      { path: '/experts', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
