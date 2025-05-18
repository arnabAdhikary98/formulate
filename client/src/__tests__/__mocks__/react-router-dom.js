// This is a mock file for react-router-dom, not a test file
module.exports = {
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(() => ({})),
  useLocation: jest.fn(() => ({ pathname: '/' })),
  Link: jest.fn(({ children, to }) => <a href={to}>{children}</a>),
  Outlet: jest.fn(() => null),
  Routes: jest.fn(({ children }) => children),
  Route: jest.fn(() => null),
  Navigate: jest.fn(() => null)
}; 