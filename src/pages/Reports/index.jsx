import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Header from '../../components/Header';
import './reports.css';

export default function Reports() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    async function loadData() {
      const paymentsQuery = query(collection(db, "payments"));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(paymentsData);

      const projectsQuery = query(collection(db, "projetos"));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);

      const clientsQuery = query(collection(db, "customers"));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);

      setLoading(false);
    }

    loadData();
  }, []);

  function filterData() {
    let filteredPayments = [...payments];
    let filteredProjects = [...projects];

    const now = new Date();
    let startDate, endDate;

    switch(timeRange) {
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'last3Months':
        startDate = startOfMonth(subMonths(now, 3));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    filteredPayments = filteredPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    if(selectedClient) {
      filteredPayments = filteredPayments.filter(payment => payment.clientId === selectedClient);
      filteredProjects = filteredProjects.filter(project => project.clienteId === selectedClient);
    }

    if(selectedProject) {
      filteredPayments = filteredPayments.filter(payment => payment.projectId === selectedProject);
    }

    return { filteredPayments, filteredProjects };
  }

  function calculateTotals(paymentsList) {
  const totals = {
    income: 0,
    expense: 0,
    profit: 0,
    projects: 0,
    activeClients: 0,
    inactiveClients: 0
  };

  const activeClientIds = new Set();
  const allClientIds = new Set(clients.map(client => client.id));

  paymentsList.forEach(payment => {
    let amount = 0;
    
    if (payment.amount) {
      if (typeof payment.amount === 'string') {
        amount = parseFloat(payment.amount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      } else {
        amount = parseFloat(payment.amount) || 0;
      }
    }

    if(payment.type === 'receita') {
      totals.income += amount;
    } else {
      totals.expense += amount;
    }

    if(payment.clientId) {
      activeClientIds.add(payment.clientId);
    }
  });

    totals.profit = totals.income - totals.expense;
    totals.activeClients = activeClientIds.size;
    totals.inactiveClients = clients.length - activeClientIds.size;

    return totals;
    }

  function getClientName(clientId) {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nomeFantasia : 'N/A';
  }

  function getProjectName(projectId) {
    const project = projects.find(p => p.id === projectId);
    return project ? project.assunto : 'N/A';
  }

  function calculateTotals(paymentsList) {
    const totals = {
      income: 0,
      expense: 0,
      profit: 0,
      projects: 0,
      activeClients: 0,
      inactiveClients: 0
    };

    const activeClientIds = new Set();
    const allClientIds = new Set(clients.map(client => client.id));

    paymentsList.forEach(payment => {
      if(payment.type === 'receita') {
        totals.income += parseFloat(payment.amount);
      } else {
        totals.expense += parseFloat(payment.amount);
      }

      if(payment.clientId) {
        activeClientIds.add(payment.clientId);
      }
    });

    totals.profit = totals.income - totals.expense;
    totals.activeClients = activeClientIds.size;
    totals.inactiveClients = clients.length - activeClientIds.size;

    return totals;
  }

  const { filteredPayments, filteredProjects } = filterData();
  const totals = calculateTotals(filteredPayments);

  return (
    <div>
      <Header />
      
      <div className="content">
        <h1>Relatórios</h1>
        <p className='subtitle'>Análise completa dos seus dados.</p>
        
        <div className="containerReports">
          <div className="filters-section">
            <div className="filter-group">
              <label>Período</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="thisMonth">Este Mês</option>
                <option value="lastMonth">Mês Anterior</option>
                <option value="last3Months">Últimos 3 Meses</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Cliente</label>
              <select 
                value={selectedClient} 
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedProject('');
                }}
              >
                <option value="">Todos</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.nomeFantasia}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Projeto</label>
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={!selectedClient}
              >
                <option value="">Todos</option>
                {projects
                  .filter(project => project.clienteId === selectedClient)
                  .map(project => (
                    <option key={project.id} value={project.id}>{project.assunto}</option>
                  ))}
              </select>
            </div>
          </div>
          
          <div className="summary-section">
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Receitas</h3>
                <span className="value positive">
                  {totals.income.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
              
              <div className="summary-card">
                <h3>Despesas</h3>
                <span className="value negative">
                  {totals.expense.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
              
              <div className="summary-card">
                <h3>Lucro</h3>
                <span className="value">
                  {totals.profit.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
              
              <div className="summary-card">
                <h3>Projetos</h3>
                <span className="value">{filteredProjects.length}</span>
              </div>
              
              <div className="summary-card">
                <h3>Clientes Ativos</h3>
                <span className="value positive">{totals.activeClients}</span>
              </div>
              
              <div className="summary-card">
                <h3>Clientes Inativos</h3>
                <span className="value negative">{totals.inactiveClients}</span>
              </div>
            </div>
          </div>
          
          <div className="tables-section">
            <div className="table-container">
              <h2>Pagamentos</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th>Projeto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(payment => (
                    <tr key={payment.id}>
                      <td>{format(new Date(payment.date), 'dd/MM/yyyy')}</td>
                      <td>{payment.description}</td>
                      <td className={payment.type === 'receita' ? 'positive' : 'negative'}>
                        {parseFloat(payment.amount).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td>
                        <span className={`badge ${payment.type}`}>
                          {payment.type === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td>{payment.clientId ? getClientName(payment.clientId) : 'N/A'}</td>
                      <td>{payment.projectId ? getProjectName(payment.projectId) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="table-container">
              <h2>Projetos</h2>
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Assunto</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredProjects.map(project => {
                        let valor = 0;
                        
                        // Validação do valor do projeto
                        if (project.valor) {
                        if (typeof project.valor === 'string') {
                            valor = parseFloat(project.valor.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
                        } else {
                            valor = parseFloat(project.valor) || 0;
                        }
                        }

                        return (
                        <tr key={project.id}>
                            <td>{getClientName(project.clienteId)}</td>
                            <td>{project.assunto}</td>
                            <td>
                            {valor.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}
                            </td>
                            <td>
                            <span className="badge" style={{ 
                                borderRadius: '20px',
                                backgroundColor: 
                                project.status === 'Aberto' ? '#d6f5bd' : 
                                project.status === 'Em progresso' ? '#f1d5ab' :
                                project.status === 'Atendido' ? '#b8e8f9' : 
                                '#ffd6d6',
                                border: 
                                project.status === 'Aberto' ? '2px solid #73ff00' : 
                                project.status === 'Em progresso' ? '2px solid #f6a935' :
                                project.status === 'Atendido' ? '2px solid #35baf6' : 
                                '2px solid #ff4d4d',
                                color: 
                                project.status === 'Aberto' ? '#0ab613' : 
                                project.status === 'Em progresso' ? '#c57804' :
                                project.status === 'Atendido' ? '#0a7eb6' : 
                                '#b60a0a'
                            }}>
                                {project.status}
                            </span>
                            </td>
                            <td>{format(new Date(project.created.toDate()), 'dd/MM/yyyy')}</td>
                        </tr>
                        )
                    })}
                    </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}