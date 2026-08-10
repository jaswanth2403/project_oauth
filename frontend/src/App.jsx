import './App.css';

function App() {

  const handleGoogleLogin = () => {
    // Send the browser to our backend.
    // The backend will redirect to Google.
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="app">
      <h1>OAuth / OIDC Demo</h1>

      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>
    </div>
  );
}

export default App;