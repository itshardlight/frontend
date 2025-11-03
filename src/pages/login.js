import React, { useEffect, useState } from 'react';

const LoginPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      /* global google */
      google.accounts.id.initialize({
        client_id: "838743403493-o2t5ivtistueoga8oi8i5t6brn070ipi.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" }
      );
    };

    return () => document.body.removeChild(script);
  }, []);

  const handleGoogleResponse = (response) => {
    // Decode the JWT to get user info
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(window.atob(base64));
    setUser({
      name: decodedPayload.name,
      email: decodedPayload.email,
      picture: decodedPayload.picture
    });
  };

  return (
    <div style={styles.container}>
      {user ? (
        <div style={styles.userCard}>
          <img src={user.picture} alt="profile" style={styles.avatar} />
          <h2>Welcome, {user.name}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
          <h2 style={styles.title}>Login</h2>
          <input type="email" placeholder="Email" style={styles.input} required />
          <input type="password" placeholder="Password" style={styles.input} required />
          <button type="submit" style={styles.button}>Login</button>
          <hr style={styles.hr} />
          <div id="googleSignInButton" style={{ display: 'flex', justifyContent: 'center' }}></div>
        </form>
      )}
    </div>
  );
};

// Inline CSS
const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5'
  },
  form: {
    display: 'flex', flexDirection: 'column', padding: '30px', borderRadius: '8px', background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  title: { marginBottom: '20px', textAlign: 'center', color: '#333' },
  input: { marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' },
  button: { padding: '10px', borderRadius: '4px', border: 'none', background: '#007BFF', color: '#fff', fontSize: '16px', cursor: 'pointer', marginBottom: '10px' },
  hr: { margin: '10px 0' },
  userCard: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  avatar: {
    width: '100px',
    borderRadius: '50%',
    marginBottom: '15px'
  }
};

export default LoginPage;
