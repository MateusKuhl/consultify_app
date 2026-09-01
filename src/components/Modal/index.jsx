
import { FiX } from 'react-icons/fi'
import './modal.css';

export default function Modal({ conteudo, close }){
  return(
    <div className="modal">
      <div className="container">
        <button className="close" onClick={ close }>
          <FiX size={25} color="#FFF" />
          Voltar
        </button>

        <main>
          <h2>Detalhes do projeto</h2>

          <div className="row">
            <span>
              Cliente: <i>{conteudo.cliente}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Assunto: <i>{conteudo.assunto}</i>
            </span>
            <span>
              Cadastrado em: <i>{conteudo.createdFormat}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Status: 
              <i className="status-badge" style={{ backgroundColor:
                              conteudo.status === 'Aberto' ? '#d6f5bd' : 
                              conteudo.status === 'Progresso' ? '#f1d5ab' :
                              conteudo.status === 'Atendido' ? '#b8e8f9' : 
                              '#ffd6d6',
                              border: 
                              conteudo.status === 'Aberto' ? '2px solid #73ff00' : 
                              conteudo.status === 'Progresso' ? '2px solid #f6a935' :
                              conteudo.status === 'Atendido' ? '2px solid #35baf6' : 
                              '2px solid #ff4d4d',
                              color: 
                              conteudo.status === 'Aberto' ? '#0ab613' : 
                              conteudo.status === 'Progresso' ? '#c57804' :
                              conteudo.status === 'Atendido' ? '#0a7eb6' : 
                              '#b60a0a'
                              }}>
                {conteudo.status}
              </i>
            </span>
            
            <span>
              Valor: <i>{conteudo.valor}</i>
            </span>
          </div>

          {conteudo.complemento !== '' && (
          <>
            <h3>Complemento</h3>
            <p>
              {conteudo.complemento}
            </p>
          </>
          )}

        </main>
      </div>
    </div>
  )
}