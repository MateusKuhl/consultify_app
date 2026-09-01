import { useState, useEffect } from 'react'
import { FiUser, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { db } from '../../services/firebaseConnection'
import { collection, getDocs, doc, deleteDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { toast } from 'react-toastify'
import './customers.css'

const listRef = collection(db, "customers")

export default function Customers(){
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [lastDocs, setLastDocs] = useState()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadClientes(){
      const q = query(listRef, orderBy('nomeFantasia'), limit(5))

      const querySnapshot = await getDocs(q)
      setClientes([])

      await updateState(querySnapshot)
      setLoading(false)
    }

    loadClientes()
  }, [])

  async function updateState(querySnapshot){
    const isCollectionEmpty = querySnapshot.size === 0

    if(!isCollectionEmpty){
      let lista = []

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          nomeFantasia: doc.data().nomeFantasia,
          cnpj: doc.data().cnpj,
          email: doc.data().email,
          contato: doc.data().contato,
          endereco: doc.data().endereco
        })
      })

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      setClientes(clientes => [...clientes, ...lista])
      setLastDocs(lastDoc)
    } else {
      setIsEmpty(true)
    }

    setLoadingMore(false)
  }

  async function handleMore(){
    setLoadingMore(true)
    const q = query(listRef, orderBy('nomeFantasia'), startAfter(lastDocs), limit(5))
    const querySnapshot = await getDocs(q)
    await updateState(querySnapshot)
  }

  async function handleDelete(id){
    const projetosQuery = query(collection(db, "projetos"), where("clienteId", "==", id))
    const projetosSnapshot = await getDocs(projetosQuery)
    
    if(projetosSnapshot.size > 0){
      toast.error("Este cliente possui projetos ativos e não pode ser excluído!")
      return
    }

    if(window.confirm("Tem certeza que deseja excluir este cliente?")){
      await deleteDoc(doc(db, "customers", id))
      .then(() => {
        toast.success("Cliente excluído com sucesso!")
        setClientes(clientes.filter(cliente => cliente.id !== id))
      })
      .catch(error => {
        console.log(error)
        toast.error("Erro ao excluir cliente")
      })
    }
  }

  if(loading){
    return(
      <div>
        <Header/>
        <div className="content">
          <h1>Clientes</h1>
          <p className='subtitle'>Gerencie todos os seus clientes.</p>
          <div className="container dashboard">
            <span>Buscando clientes...</span>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div>
      <Header/>
      <div className="content">
        <h1>Clientes</h1>
        <p className='subtitle'>Gerencie todos os seus clientes.</p>

        {clientes.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum cliente encontrado...</span>
            <Link to="/newCustomers" className="new" style={{ backgroundColor: '#181c2e', borderRadius: '8px', padding: '15px' }}>
              <FiPlus color="#FFF" size={25} />
              Novo Cliente
            </Link>  
          </div>
        ) : (
          <div className='mainTable'>
            <Link to="/newCustomers" className="new" style={{ backgroundColor: '#181c2e', borderRadius: '8px', padding: '15px' }}>
              <FiPlus color="#FFF" size={18} />
              Novo Cliente
            </Link>  

            <table className="mainTable">
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #686868', borderLeft: '1px solid #686868' }}>Nome</th>
                  <th>CNPJ</th>
                  <th>Email</th>
                  <th>Contato</th>
                  <th style={{ borderRight: '1px solid #686868' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td style={{ borderLeft: '1px solid #686868' }}>{cliente.nomeFantasia}</td>
                    <td>{cliente.cnpj}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.contato}</td>
                    <td style={{ borderRight: '1px solid #686868' }} >
                      <Link to={`/newCustomers/${cliente.id}`} className="action edit" style={{ backgroundColor: '#f6a935' }}>
                        <FiEdit2 size={16} />
                      </Link>
                      <button 
                        className="action delete"
                        onClick={() => handleDelete(cliente.id)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loadingMore && <h3>Buscando mais clientes...</h3>}    
            {!loadingMore && !isEmpty && <button className="btn-more" onClick={handleMore}>Buscar mais</button>}  
          </div>
        )}
      </div>
    </div>
  )
}