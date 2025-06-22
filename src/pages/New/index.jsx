import { useState, useEffect, useContext } from 'react'
import Header from '../../components/Header'
import { FiPlusCircle, FiSave } from 'react-icons/fi'
import CurrencyInput from 'react-currency-input-field'
import { AuthContext } from '../../contexts/auth'
import { db } from '../../services/firebaseConnection'
import { collection, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './new.css'

const listRef = collection(db, "customers")

export default function New(){
  const { user } = useContext(AuthContext)
  const { id } = useParams()
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [loadCustomer, setLoadCustomer] = useState(true)
  const [customerSelected, setCustomerSelected] = useState(0)
  const [complemento, setComplemento] = useState('')
  const [assunto, setAssunto] = useState('Consultoria')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Aberto')
  const [idCustomer, setIdCustomer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCustomers(){
      try {
        const querySnapshot = await getDocs(listRef)
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nomeFantasia: doc.data().nomeFantasia
        }))
        
        setCustomers(lista.length ? lista : [{ id: '1', nomeFantasia: 'FREELA' }])
        
        if(id) await loadId(lista)
        
        setLoadCustomer(false)
      } catch(error) {
        console.error("Erro ao buscar clientes:", error)
        setCustomers([{ id: '1', nomeFantasia: 'FREELA' }])
        setLoadCustomer(false)
      }
      setLoading(false)
    }

    loadCustomers()
  }, [id])

  async function loadId(lista){
    try {
      const docRef = doc(db, "projetos", id)
      const docSnap = await getDoc(docRef)
      
      if(docSnap.exists()){
        const data = docSnap.data()
        setAssunto(data.assunto)
        setValor(data.valor)
        setStatus(data.status)
        setComplemento(data.complemento)
        
        const index = lista.findIndex(item => item.id === data.clienteId)
        setCustomerSelected(index)
        setIdCustomer(true)
      }
    } catch(error) {
      console.error("Erro ao carregar projeto:", error)
      setIdCustomer(false)
    }
  }

  function handleOptionChange(e){
    setStatus(e.target.value)
  }

  function handleChangeSelect(e){
    setAssunto(e.target.value)
  }

  function handleChangeCustomer(e){
    setCustomerSelected(e.target.value)
  }

  async function handleRegister(e){
    e.preventDefault()

    if(!customers[customerSelected]?.id || !assunto || !valor || !status){
      toast.error("Preencha todos os campos obrigatórios!")
      return
    }

    const projectData = {
      cliente: customers[customerSelected].nomeFantasia,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      valor: valor,
      complemento: complemento,
      status: status,
      userId: user.uid,
      created: idCustomer ? undefined : new Date()
    }

    try {
      if(idCustomer){
        await updateDoc(doc(db, "projetos", id), projectData)
        toast.success("Projeto atualizado com sucesso!")
      } else {
        await addDoc(collection(db, "projetos"), projectData)
        toast.success("Projeto cadastrado com sucesso!")
      }
      navigate('/dashboard')
    } catch(error) {
      console.error("Erro ao salvar projeto:", error)
      toast.error(`Erro ao ${idCustomer ? 'atualizar' : 'cadastrar'} projeto`)
    }
  }

  if(loading){
    return (
      <div>
        <Header/>
        <div className="content">
          <h1>Novo Projeto</h1>
          <p className='subtitle'>Carregando...</p>
        </div>
      </div>
    )
  }

  return(
    <div>
      <Header/>
      <div className="content">
        <h1>{idCustomer ? 'Editar Projeto' : 'Novo Projeto'}</h1>
        <p className='subtitle'>{idCustomer ? 'Atualize os dados do projeto.' : 'Crie seu novo projeto.'}</p>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Cliente*</label>
              {loadCustomer ? (
                <input type="text" disabled value="Carregando..." />
              ) : (
                <select value={customerSelected} onChange={handleChangeCustomer}>
                  {customers.map((item, index) => (
                    <option key={index} value={index}>{item.nomeFantasia}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Assunto*</label>
              <select value={assunto} onChange={handleChangeSelect}>
                <option value="Consultoria">Consultoria</option>
                <option value="Projeto">Projeto</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valor*</label>
              <CurrencyInput
                name="valor"
                value={valor}
                onValueChange={(value) => setValor(value)}
                intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                decimalSeparator=","
                groupSeparator="."
                prefix="R$ "
                placeholder="R$0,00"
              />
            </div>

            <div className="form-group">
              <label>Status*</label>
              <div className="projectStatus">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="radio"
                    value="Aberto"
                    checked={status === 'Aberto'}
                    onChange={handleOptionChange}
                  />
                  <span>Em aberto</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="radio"
                    value="Progresso"
                    checked={status === 'Progresso'}
                    onChange={handleOptionChange}
                  />
                  <span>Progresso</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="radio"
                    value="Atendido"
                    checked={status === 'Atendido'}
                    onChange={handleOptionChange}
                  />
                  <span>Atendido</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="radio"
                    value="Cancelado"
                    checked={status === 'Cancelado'}
                    onChange={handleOptionChange}
                  />
                  <span>Cancelado</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Complemento</label>
              <textarea
                placeholder="Descreva seu problema (opcional)."
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>

            <button type="submit">
              {idCustomer ? 'Atualizar Projeto' : 'Cadastrar Projeto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}