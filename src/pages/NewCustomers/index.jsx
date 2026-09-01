import { useState, useEffect } from 'react'
import { FiUser, FiSave, FiMapPin } from 'react-icons/fi'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { validateCNPJ, formatCNPJ } from '../../helpers/CNPJMask'
import { db } from '../../services/firebaseConnection'
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import './newCustomers.css'

export default function NewCustomer(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditMode, setIsEditMode] = useState(false)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [contato, setContato] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingCep, setLoadingCep] = useState(false)

  useEffect(() => {
    async function loadData(){
      if(id){
        setIsEditMode(true)
        await loadCustomerData()
      }
      setLoading(false)
    }
    
    loadData()
  }, [id])

  async function loadCustomerData(){
    try {
      const docRef = doc(db, "customers", id)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()){
        const data = docSnap.data()
        setNome(data.nomeFantasia || '')
        setCnpj(data.cnpj || '')
        setEmail(data.email || '')
        setContato(data.contato || '')
        setCep(data.cep || '')
        setEndereco(data.endereco || '')
        setNumero(data.numero || '')
        setComplemento(data.complemento || '')
        setBairro(data.bairro || '')
        setCidade(data.cidade || '')
        setUf(data.uf || '')
      } else {
        toast.error("Cliente não encontrado!")
        navigate('/customers')
      }
    } catch(error) {
      console.error("Erro ao carregar cliente:", error)
      toast.error("Erro ao carregar dados do cliente")
      navigate('/customers')
    }
  }

  async function handleSubmit(e){
    e.preventDefault()

    if(!nome || !cnpj || !email || !contato || !cep || !endereco || !numero || !bairro || !cidade || !uf){
      toast.error("Preencha todos os campos obrigatórios!")
      return
    }

    const customerData = {
      nomeFantasia: nome,
      cnpj: cnpj,
      email: email,
      contato: contato,
      cep: cep,
      endereco: endereco,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cidade: cidade,
      uf: uf
    }

    if(isEditMode){
      try {
        await updateDoc(doc(db, "customers", id), customerData)
        toast.success("Cliente atualizado com sucesso!")
        navigate('/customers')
      } catch (error) {
        console.error(error)
        toast.error("Erro ao atualizar cliente")
      }
    } else {
      try {
        await addDoc(collection(db, "customers"), customerData)
        toast.success("Cliente cadastrado com sucesso!")
        navigate('/customers')
      } catch (error) {
        console.error(error)
        toast.error("Erro ao cadastrar cliente")
      }
    }
  }

  const handleChangeCNPJ = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    const formattedValue = formatCNPJ(e.target.value)
    setCnpj(formattedValue)
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    let formattedValue = ''
    
    if (value.length <= 11) {
      if (value.length <= 2) {
        formattedValue = value
      } else if (value.length <= 6) {
        formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`
      } else if (value.length <= 10) {
        formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
      } else {
        formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
      }
    }
    setContato(formattedValue)
  }

  const handleCepChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    const formattedValue = value.replace(/^(\d{5})(\d)/, '$1-$2')
    setCep(formattedValue)
    
    // Busca automática quando o CEP está completo
    if (value.length === 8) {
      fetchAddressByCep(value)
    }
  }

  const fetchAddressByCep = async (cep) => {
    const cleanedZipCode = cep.replace(/\D/g, '')
    if (cleanedZipCode.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedZipCode}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setEndereco(data.logradouro || '')
        setBairro(data.bairro || '')
        setCidade(data.localidade || '')
        setUf(data.uf || '')
      } else {
        toast.warn("CEP não encontrado. Preencha os dados manualmente.")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast.error("Erro ao consultar CEP. Preencha os dados manualmente.")
    } finally {
      setLoadingCep(false)
    }
  }

  if(loading){
    return (
      <div>
        <Header/>
        <div className="content">
          <h1>{isEditMode ? 'Editando Cliente' : 'Novo Cliente'}</h1>
          <p className='subtitle'>Carregando...</p>
        </div>
      </div>
    )
  }

  return(
  <div>
    <Header/>
    <div className="content">
      <h1>{isEditMode ? 'Editar Cliente' : 'Novo Cliente'}</h1>
      <p className='subtitle'>{isEditMode ? 'Atualize os dados do cliente.' : 'Cadastre um novo cliente para seus projetos.'}</p>

      <div className="container">
        <form onSubmit={handleSubmit} className="form-profile">
          <div className="form-row">
            <div className="form-group">
              <label>Nome Fantasia*</label>
              <input
                type="text"
                placeholder="Nome do cliente/empresa"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>CNPJ*</label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={handleChangeCNPJ}
                maxLength={18}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email*</label>
              <input
                type="email"
                placeholder="exemplo@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone*</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={contato}
                onChange={handlePhoneChange}
                maxLength={15}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>CEP*</label>
            <div className="cep-container">
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={handleCepChange}
                maxLength={9}
                required
              />
              {loadingCep && <span className="loading-cep">Buscando...</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Endereço*</label>
              <input
                type="text"
                placeholder="Rua, Avenida, etc."
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                required
              />
            </div>

            <div className="form-group small-group">
              <label>Número*</label>
              <input
                type="text"
                placeholder="Nº"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Complemento</label>
            <input
              type="text"
              placeholder="Apto, Bloco, etc."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Bairro*</label>
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
            </div>

            <div className="form-row" style={{ flex: 3, gap: '15px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Cidade*</label>
                <input
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                />
              </div>

              <div className="form-group small-group">
                <label>UF*</label>
                <input
                  type="text"
                  placeholder="UF"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>
          </div>

        <button type="submit" >
            {isEditMode ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </button>
        </form>
      </div>
    </div>
  </div>
)
}