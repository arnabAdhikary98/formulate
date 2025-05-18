// Mock React Router DOM
const reactRouterDom = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: () => null,
  Navigate: () => null,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useParams: jest.fn().mockReturnValue({}),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
  Outlet: () => null
};

module.exports = reactRouterDom;

// Add a test to prevent the "no test found" error
describe('React Router DOM Mock', () => {
  test('dummy test to avoid empty test suite error', () => {
    expect(true).toBe(true);
  });
}); 