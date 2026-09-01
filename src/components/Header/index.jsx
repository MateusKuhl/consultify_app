import { useContext } from 'react'
import avatarImg from '../../assets/avatar.png'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/auth'
import { FiLayers, FiDollarSign, FiUser, FiSettings, FiBarChart2, FiLogOut } from 'react-icons/fi'
import './header.css'


export default function Header(){
  const { user, logout } = useContext(AuthContext);
  
  return(
    <div className="sidebar">
      <div className="sidebar-top">
        <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt="Foto do usuario" />
        <div className='bar'></div>
      </div>
      
      <div className='sidebar-content'>
        <div className='itens'>
          <Link to="/dashboard">
            <FiLayers color="#FFF" size={24} />
            <span>Projetos</span>
          </Link>

          <Link to="/payments">
            <FiDollarSign color="#FFF" size={24} />
            <span>Pagamentos</span>
          </Link>

          <Link to="/reports">
            <FiBarChart2 color="#FFF" size={24} />
            <span>Relatórios</span>
          </Link>

          <Link to="/customers">
            <FiUser color="#FFF" size={24} />
            <span>Clientes</span>
          </Link>

          <Link to="/profile">
            <FiSettings color="#FFF" size={24} />
            <span>Perfil</span>
          </Link>
        </div>
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={() => logout()}>
          <FiLogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}