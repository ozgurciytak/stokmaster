import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();
const STORAGE_KEY = '@stockmaster_state_v5';

const initialState = {
  currentUser: null,
  superAdmins: [
    { id: 'sa1', name: 'Sistem Yöneticisi', username: 'admin', password: '123' }
  ],
  systemSettings: {
    bankIban: 'TR00 0000 0000 0000 0000 0000 00',
    bankName: 'Ziraat Bankası',
    bankAccountHolder: 'StockMaster Yazılım A.Ş.',
    posApiKey: 'sk_test_12345',
    posSecretKey: 'ss_test_67890',
  },
  companies: [
    { id: 'comp1', name: 'Demir Teknoloji A.Ş.', taxOffice: 'Ataşehir', taxNumber: '1234567890', plan: 'monthly', planExpiry: '2026-05-10', status: 'active', ownerEmail: 'ozgur@test.com', ownerPassword: '123' }
  ],
  paymentRequests: [],
  units: [],
  personnel: [],
  products: [],
  stockMovements: [],
  systemLogs: [],
  notifications: [],
  supportTickets: [],
};

function appReducer(state, action) {
  let newState;
  switch (action.type) {
    case 'RESTORE_STATE':
      return { 
        ...initialState, 
        ...action.payload,
        currentUser: null 
      };

    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    
    case 'LOGOUT':
      return { ...state, currentUser: null };

    // SUPER ADMIN ACTIONS
    case 'ADD_SUPER_ADMIN':
      newState = { ...state, superAdmins: [...state.superAdmins, { id: Date.now().toString(), ...action.payload }] };
      break;

    case 'UPDATE_SUPER_ADMIN':
      newState = { ...state, superAdmins: state.superAdmins.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) };
      break;

    case 'UPDATE_SYSTEM_SETTINGS':
      newState = { ...state, systemSettings: { ...state.systemSettings, ...action.payload } };
      break;

    case 'ADD_COMPANY':
      newState = {
        ...state,
        companies: [...state.companies, { id: Date.now().toString(), status: 'active', ...action.payload }],
      };
      break;

    case 'UPDATE_COMPANY':
      newState = { ...state, companies: state.companies.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
      break;

    case 'APPROVE_PAYMENT': {
      const request = state.paymentRequests.find(r => r.id === action.payload);
      if (!request) return state;
      
      const company = state.companies.find(c => c.id === request.companyId);
      const currentExpiry = company ? new Date(company.planExpiry) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + (request.plan === 'yearly1' ? 365 : 30));
      
      newState = {
        ...state,
        companies: state.companies.map(c => c.id === request.companyId ? { ...c, plan: request.plan, planExpiry: newExpiry.toISOString().split('T')[0] } : c),
        paymentRequests: state.paymentRequests.filter(r => r.id !== action.payload),
      };
      break;
    }

    // CLIENT ACTIONS
    case 'CREATE_PAYMENT_REQUEST':
      newState = { ...state, paymentRequests: [...state.paymentRequests, { id: Date.now(), ...action.payload, status: 'pending', date: new Date().toISOString().split('T')[0] }] };
      break;

    case 'DIRECT_PAYMENT_SUCCESS': {
      const company = state.companies.find(c => c.id === action.payload.companyId);
      const currentExpiry = company ? new Date(company.planExpiry) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      
      const newExp = new Date(baseDate);
      newExp.setDate(newExp.getDate() + (action.payload.plan === 'yearly1' ? 365 : 30));
      
      newState = {
        ...state,
        companies: state.companies.map(c => c.id === action.payload.companyId ? { ...c, plan: action.payload.plan, planExpiry: newExp.toISOString().split('T')[0] } : c),
      };
      break;
    }

    case 'ADD_UNIT':
      newState = { ...state, units: [...state.units, { id: Date.now(), ...action.payload }] };
      break;

    case 'ADD_PERSONNEL':
      newState = { ...state, personnel: [...state.personnel, { id: Date.now().toString(), status: 'active', ...action.payload }] };
      break;

    case 'DELETE_PERSONNEL':
      newState = { ...state, personnel: state.personnel.filter(p => p.id !== action.payload) };
      break;

    case 'RESET_PERSONNEL_PASSWORD':
      newState = { ...state, personnel: state.personnel.map(p => p.id === action.payload ? { ...p, password: '123' } : p) };
      break;

    case 'UPDATE_UNIT_MANAGER':
      newState = {
        ...state,
        units: state.units.map(u => u.id === action.payload.unitId ? { ...u, managerId: action.payload.managerId } : u)
      };
      break;

    case 'UPDATE_USER_PASSWORD': {
      const { role, id, newPassword } = action.payload;
      if (role === 'owner') {
        newState = { ...state, companies: state.companies.map(c => c.id === id ? { ...c, ownerPassword: newPassword } : c) };
      } else {
        newState = { ...state, personnel: state.personnel.map(p => p.id === id ? { ...p, password: newPassword } : p) };
      }
      break;
    }

    case 'ADD_PRODUCT':
      newState = { ...state, products: [...state.products, { id: Date.now(), ...action.payload }] };
      break;

    case 'CREATE_TICKET':
      newState = { ...state, supportTickets: [{ id: Date.now(), status: 'open', messages: [], ...action.payload }, ...state.supportTickets] };
      break;
    
    case 'REPLY_TICKET':
      newState = {
        ...state,
        supportTickets: state.supportTickets.map(t => t.id === action.payload.ticketId ? { 
          ...t, 
          messages: [...t.messages, { id: Date.now(), ...action.payload.message }] 
        } : t)
      };
      break;

    case 'CLOSE_TICKET':
      newState = { ...state, supportTickets: state.supportTickets.map(t => t.id === action.payload ? { ...t, status: 'closed' } : t) };
      break;

    case 'ADJUST_STOCK': {
      const { productId, quantity, type, personnelId } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (!product) return state;

      const newStock = Math.max(0, type === 'in' ? product.stock + Math.abs(quantity) : product.stock - Math.abs(quantity));
      const unit = state.units.find(u => u.id === product.unitId);
      const managerId = unit?.managerId || null; // Default to null if no manager assigned (Owner sees all)

      let newNotifs = [...state.notifications];
      if (newStock <= product.minStock && type === 'out') {
        newNotifs = [{
          id: Date.now(),
          title: '🚨 Kritik Stok Uyarısı',
          body: `${product.name} stoğu ${newStock} adete düştü! Lütfen temin edin.`,
          productId: product.id,
          userId: managerId, // Targeted notification
          read: false,
          date: new Date().toISOString().split('T')[0]
        }, ...newNotifs];
      }

      newState = {
        ...state,
        products: state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p),
        stockMovements: [{ id: Date.now(), productId, type, quantity: Math.abs(quantity), personnelId, date: new Date().toISOString().split('T')[0] }, ...state.stockMovements],
        notifications: newNotifs
      };
      break;
    }

    default:
      return state;
  }
  
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(err => console.error('Save error', err));
  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isReady, setIsReady] = useState(false);

  // Helper to get current company
  const company = state.currentUser?.role === 'superadmin' 
    ? null 
    : state.companies.find(c => c.ownerEmail === state.currentUser?.ownerEmail || c.id === state.currentUser?.companyId) || state.companies[0];

  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(saved) });
      } catch (err) { console.error('Load error', err); } finally { setIsReady(true); }
    };
    loadState();
  }, []);

  if (!isReady) return null;

  return (
    <AppContext.Provider value={{ state, dispatch, company }}>
      {children}
    </AppContext.Provider>
  );
}

export const validatePassword = (pass) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d.@$!%*?&]{6,}$/;
  return regex.test(pass);
};

export const PASSWORD_HINT = "En az 6 karakter, büyük/küçük harf, rakam ve özel karakter (. @ $ ! % * ? &) içermelidir.";

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const ROLE_LABELS = { superadmin: 'Sistem Yöneticisi', owner: 'Firma Sahibi', manager: 'Birim Sorumlusu', personnel: 'Personel' };

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  } catch (e) {
    return dateStr;
  }
};
