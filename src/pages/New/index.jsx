import { useState, useEffect, useContext } from 'react'
import Header from '../../components/Header'
import { FiPlusCircle, FiSave } from 'react-icons/fi'
import CurrencyInput from 'react-currency-input-field'
import { AuthContext } from '../../contexts/auth'
import { db } from '../../services/firebaseConnection'
import { collection, getDocs, doc, addDoc, updateDoc, getDoc } from 'firebase/firestore'
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
  const [customerSelected, setCustomerSelected] = useState('')
  const [complemento, setComplemento] = useState('')
  const [assunto, setAssunto] = useState('Consultoria')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Aberto')
  const [idCustomer, setIdCustomer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const customersQuery = await getDocs(listRef)
        const customersList = customersQuery.docs.map(doc => ({
          id: doc.id,
          nomeFantasia: doc.data().nomeFantasia
        }))
        
        const finalCustomers = customersList.length ? 
          customersList : 
          [{ id: '1', nomeFantasia: 'FREELA' }]
        
        setCustomers(finalCustomers)
        
        if(id) {
          await loadProjectData(id, finalCustomers)
        } else {
          setCustomerSelected(finalCustomers[0]?.id || '')
        }
        
      } catch(error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar dados")
        setCustomers([{ id: '1', nomeFantasia: 'FREELA' }])
      } finally {
        setLoadCustomer(false)
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  async function loadProjectData(projectId, customersList) {
    try {
      const docRef = doc(db, "projetos", projectId)
      const docSnap = await getDoc(docRef)
      
      if(docSnap.exists()) {
        const data = docSnap.data()
        
        const customerIndex = customersList.findIndex(
          item => item.id === data.clienteId
        )
        
        const selectedCustomerId = customerIndex >= 0 ? 
          customersList[customerIndex].id : 
          customersList[0]?.id || ''
        
        setAssunto(data.assunto || 'Consultoria')
        setValor(formatCurrencyForInput(data.valor))
        setStatus(data.status || 'Aberto')
        setComplemento(data.complemento || '')
        setCustomerSelected(selectedCustomerId)
        setIdCustomer(true)
      } else {
        toast.error("Projeto não encontrado")
        navigate('/dashboard')
      }
    } catch(error) {
      console.error("Erro ao carregar projeto:", error)
      toast.error("Erro ao carregar projeto")
      navigate('/dashboard')
    }
  }

  function formatCurrencyForInput(value) {
    if (!value) return ''
    
    const numericValue = String(value).replace(/[^\d,.-]/g, '')
    return numericValue
  }

  function handleOptionChange(e) {
    setStatus(e.target.value)
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value)
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value)
  }

  async function handleRegister(e) {
  e.preventDefault()

  if(!customerSelected || !assunto || !valor || !status) {
    toast.error("Preencha todos os campos obrigatórios!")
    return
  }

  const selectedCustomer = customers.find(c => c.id === customerSelected)
  
    if (!selectedCustomer) {
      toast.error("Cliente inválido selecionado")
      return
    }

    const projectData = {
      cliente: selectedCustomer.nomeFantasia,
      clienteId: selectedCustomer.id,
      assunto: assunto,
      valor: valor,
      complemento: complemento,
      status: status,
      userId: user.uid
    }

    if(!idCustomer) {
      projectData.created = new Date()
    }

    try {
      if(idCustomer) {
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

  if(loading) {
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
                <select 
                  value={customerSelected} 
                  onChange={handleChangeCustomer}
                  required
                >
                  {customers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nomeFantasia}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Assunto*</label>
              <select 
                value={assunto} 
                onChange={handleChangeSelect}
                required
              >
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
                required
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