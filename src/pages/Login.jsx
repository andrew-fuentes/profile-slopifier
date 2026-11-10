export default function Login({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault();
    onLogin();
  }

  return (
    <section>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
      </form>
    </section>
  );
}
