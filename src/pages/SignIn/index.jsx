import { useState, useContext } from "react"
import "./signin.css"

import logo from "../../assets/logo.png"
import { Link } from "react-router-dom"
import { AuthContext } from "../../contexts/auth"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { signIn, loadingAuth } = useContext(AuthContext)

  async function handleSignIn(e) {
    e.preventDefault()

    if (email !== "" && password !== "") {
      await signIn(email, password)
    }
  }

  return (
    <div className="signin-container-center">
      <div className="signin-login">
        <div className="signin-login-area">
          <img src={logo || "/placeholder.svg"} alt="Logo do sistema consultify" className="signin-logo" />
        </div>

        <form onSubmit={handleSignIn} className="signin-form">
          <h1 className="signin-title">Entrar</h1>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signin-input"
            required
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signin-input"
            required
          />

          <button type="submit" disabled={loadingAuth} className="signin-button">
            {loadingAuth ? (
              <>
                <span className="signin-loading-spinner"></span>
                Carregando...
              </>
            ) : (
              "Acessar"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
