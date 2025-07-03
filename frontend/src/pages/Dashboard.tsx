import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type UserPayload = {
  id: number;
  email: string;
  name?: string;
};

type Summary = {
  income: number;
  expense: number;
  balance: number;
};

type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description?: string;
  date: string;
};

type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
};

type Budget = {
  id: number;
  category_id?: number;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ name: '', type: 'expense' });
  const [catError, setCatError] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetForm, setBudgetForm] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    start_date: '',
    end_date: ''
  });
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: UserPayload = jwtDecode(token);
      setUser(decoded);
      fetchSummary(token);
      fetchTransactions(token);
      fetchCategories(token);
      fetchBudgets(token);
    }
  }, []);

  const fetchSummary = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (token: string) => {
    setTxLoading(true);
    try {
      const res = await fetch('http://localhost:3000/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!form.amount || !form.date) {
      setFormError('Tutar ve tarih zorunlu!');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          description: form.description,
          date: form.date
        })
      });
      if (res.ok) {
        setForm({ type: 'expense', amount: '', category: '', description: '', date: '' });
        fetchSummary(token);
        fetchTransactions(token);
      } else {
        const data = await res.json();
        setFormError(data.error || 'İşlem eklenemedi');
      }
    } catch (err) {
      setFormError('Sunucu hatası');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchCategories = async (token: string) => {
    try {
      const res = await fetch('http://localhost:3000/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const handleCatFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCatForm({ ...catForm, [e.target.name]: e.target.value });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!catForm.name) {
      setCatError('Kategori adı zorunlu!');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(catForm)
      });
      if (res.ok) {
        setCatForm({ name: '', type: 'expense' });
        fetchCategories(token);
      } else {
        const data = await res.json();
        setCatError(data.error || 'Kategori eklenemedi');
      }
    } catch {
      setCatError('Sunucu hatası');
    }
  };

  const fetchBudgets = async (token: string) => {
    try {
      const res = await fetch('http://localhost:3000/budgets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBudgets(data);
    } catch {
      setBudgets([]);
    }
  };

  const handleBudgetFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBudgetForm({ ...budgetForm, [e.target.name]: e.target.value });
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetError('');
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!budgetForm.amount || !budgetForm.start_date || !budgetForm.end_date) {
      setBudgetError('Tutar ve tarih zorunlu!');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...budgetForm,
          amount: Number(budgetForm.amount),
          category_id: budgetForm.category_id ? Number(budgetForm.category_id) : undefined
        })
      });
      if (res.ok) {
        setBudgetForm({ category_id: '', amount: '', period: 'monthly', start_date: '', end_date: '' });
        fetchBudgets(token);
      } else {
        const data = await res.json();
        setBudgetError(data.error || 'Bütçe eklenemedi');
      }
    } catch {
      setBudgetError('Sunucu hatası');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Hoşgeldin!</h2>
      {user && (
        <div style={{ marginBottom: 16 }}>
          <strong>{user.name || 'Kullanıcı'}</strong> <br />
          <span style={{ color: '#555' }}>{user.email}</span>
        </div>
      )}
      <button onClick={handleLogout} style={{ float: 'right' }}>Çıkış Yap</button>
      <h3>Finansal Özet</h3>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : summary ? (
        <ul>
          <li>Toplam Gelir: <b>{summary.income} ₺</b></li>
          <li>Toplam Gider: <b>{summary.expense} ₺</b></li>
          <li>Bakiye: <b>{summary.balance} ₺</b></li>
        </ul>
      ) : (
        <div>Veri alınamadı.</div>
      )}
      <h3>Gelir/Gider İşlemleri</h3>
      <form onSubmit={handleAddTransaction} style={{ marginBottom: 16 }}>
        <select name="type" value={form.type} onChange={handleFormChange} style={{ marginRight: 8 }}>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
        </select>
        <input
          type="number"
          name="amount"
          placeholder="Tutar"
          value={form.amount}
          onChange={handleFormChange}
          style={{ width: 100, marginRight: 8 }}
        />
        <input
          type="text"
          name="category"
          placeholder="Kategori"
          value={form.category}
          onChange={handleFormChange}
          style={{ width: 100, marginRight: 8 }}
        />
        <input
          type="text"
          name="description"
          placeholder="Açıklama"
          value={form.description}
          onChange={handleFormChange}
          style={{ width: 120, marginRight: 8 }}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleFormChange}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Ekle</button>
      </form>
      {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
      {txLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tür</th>
              <th>Tutar</th>
              <th>Kategori</th>
              <th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.type === 'income' ? 'Gelir' : 'Gider'}</td>
                <td>{tx.amount} ₺</td>
                <td>{tx.category}</td>
                <td>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Kategoriler</h3>
      <form onSubmit={handleAddCategory} style={{ marginBottom: 16 }}>
        <input
          type="text"
          name="name"
          placeholder="Kategori Adı"
          value={catForm.name}
          onChange={handleCatFormChange}
          style={{ marginRight: 8 }}
        />
        <select name="type" value={catForm.type} onChange={handleCatFormChange} style={{ marginRight: 8 }}>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
        </select>
        <button type="submit">Ekle</button>
      </form>
      {catError && <div style={{ color: 'red', marginBottom: 8 }}>{catError}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Tür</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.type === 'income' ? 'Gelir' : 'Gider'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Bütçeler</h3>
      <form onSubmit={handleAddBudget} style={{ marginBottom: 16 }}>
        <select name="category_id" value={budgetForm.category_id} onChange={handleBudgetFormChange} style={{ marginRight: 8 }}>
          <option value="">Genel Bütçe</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'income' ? 'Gelir' : 'Gider'})</option>
          ))}
        </select>
        <input
          type="number"
          name="amount"
          placeholder="Tutar"
          value={budgetForm.amount}
          onChange={handleBudgetFormChange}
          style={{ width: 100, marginRight: 8 }}
        />
        <select name="period" value={budgetForm.period} onChange={handleBudgetFormChange} style={{ marginRight: 8 }}>
          <option value="monthly">Aylık</option>
          <option value="yearly">Yıllık</option>
          <option value="custom">Özel</option>
        </select>
        <input
          type="date"
          name="start_date"
          value={budgetForm.start_date}
          onChange={handleBudgetFormChange}
          style={{ marginRight: 8 }}
        />
        <input
          type="date"
          name="end_date"
          value={budgetForm.end_date}
          onChange={handleBudgetFormChange}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Ekle</button>
      </form>
      {budgetError && <div style={{ color: 'red', marginBottom: 8 }}>{budgetError}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Tutar</th>
            <th>Dönem</th>
            <th>Başlangıç</th>
            <th>Bitiş</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map(b => (
            <tr key={b.id}>
              <td>{b.category_id ? (categories.find(c => c.id === b.category_id)?.name || '-') : 'Genel'}</td>
              <td>{b.amount} ₺</td>
              <td>{b.period === 'monthly' ? 'Aylık' : b.period === 'yearly' ? 'Yıllık' : 'Özel'}</td>
              <td>{b.start_date}</td>
              <td>{b.end_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 32, color: '#888' }}>
        (Buraya gelir/gider, analiz vs. eklenecek)
      </p>
    </div>
  );
};

export default Dashboard; 