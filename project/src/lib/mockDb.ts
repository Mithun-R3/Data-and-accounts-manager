import type { Person, MonthlyPayment, AppUser } from './types';
import { MOCK_PERSONS, MOCK_PAYMENTS, MOCK_USERS, generateId } from './mockData';

const STORAGE_KEY_PERSONS = 'mock_persons';
const STORAGE_KEY_PAYMENTS = 'mock_payments';
const STORAGE_KEY_USERS = 'mock_users';
const STORAGE_KEY_SESSION = 'mock_session';

function initializeMockData() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEY_PERSONS)) {
    localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(MOCK_PERSONS));
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(MOCK_PAYMENTS));
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(MOCK_USERS));
  }
}

initializeMockData();

function getPersons(): Person[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_PERSONS);
  return data ? JSON.parse(data) : [];
}

function getPayments(): MonthlyPayment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_PAYMENTS);
  return data ? JSON.parse(data) : [];
}

function getUsers(): AppUser[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
}

function savePersons(persons: Person[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(persons));
}

function savePayments(payments: MonthlyPayment[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
}

function saveUsers(users: AppUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

// Mock Auth functions
let authStateCallback: ((event: string, session: any) => void) | null = null;

export const mockAuth = {
  getSession: async () => {
    if (typeof window === 'undefined') return { data: { session: null }, error: null };
    const session = localStorage.getItem(STORAGE_KEY_SESSION);
    return Promise.resolve({
      data: { session: session ? JSON.parse(session) : null },
      error: null,
    });
  },

  signInWithPassword: async (credentials: { email: string; password: string }) => {
    const { email, password } = credentials;
    await new Promise(r => setTimeout(r, 300));
    const users = getUsers();

    if (email === 'admin@test.com' && password === 'admin123') {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        const session = {
          user: { id: adminUser.id, email },
          access_token: 'mock_token_admin',
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
        if (authStateCallback) authStateCallback('SIGNED_IN', session);
        return Promise.resolve({ data: { session }, error: null });
      }
    }

    const user = users.find(u => u.username === email && u.role === 'user');
    if (user) {
      const person = getPersons().find(p => p.id === user.person_id);
      if (person && person.phone === password) {
        const session = {
          user: { id: user.id, email: `${person.phone}@realestate.local` },
          access_token: 'mock_token_user',
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
        if (authStateCallback) authStateCallback('SIGNED_IN', session);
        return Promise.resolve({ data: { session }, error: null });
      }
    }

    // Also handle login by email pattern (phone@realestate.local) for user login flow
    if (email.endsWith('@realestate.local')) {
      const phoneFromEmail = email.replace('@realestate.local', '');
      const person = getPersons().find(p => p.phone === phoneFromEmail);
      if (person) {
        const userByEmail = users.find(u => u.person_id === person.id && u.role === 'user');
        if (userByEmail && person.phone === password) {
          const session = {
            user: { id: userByEmail.id, email },
            access_token: 'mock_token_user',
          };
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
          if (authStateCallback) authStateCallback('SIGNED_IN', session);
          return Promise.resolve({ data: { session }, error: null });
        }
      }
    }

    return Promise.resolve({
      data: { session: null },
      error: { message: 'Invalid credentials' },
    });
  },

  signOut: async () => {
    if (typeof window === 'undefined') return { error: null };
    localStorage.removeItem(STORAGE_KEY_SESSION);
    if (authStateCallback) authStateCallback('SIGNED_OUT', null);
    return Promise.resolve({ error: null });
  },

  updateUser: async (updates: { password?: string }) => {
    return Promise.resolve({ data: null, error: null });
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    authStateCallback = callback;
    return {
      data: {
        subscription: {
          unsubscribe: () => { authStateCallback = null; },
        },
      },
    };
  },
};

// Query builder helper
class QueryBuilder {
  private filters: Array<{ field: string; value: any }> = [];
  private insertData: any = null;
  private updateData: any = null;
  private isDelete = false;
  private table: string;
  private orderFields: string[] = [];
  private selectFields: string = '*';

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = '*'): QueryBuilder {
    this.selectFields = fields;
    return this;
  }

  eq(field: string, value: any): QueryBuilder {
    this.filters.push({ field, value });
    return this;
  }

  insert(data: any): QueryBuilder {
    this.insertData = data;
    return this;
  }

  update(data: any): QueryBuilder {
    this.updateData = data;
    return this;
  }

  delete(): QueryBuilder {
    this.isDelete = true;
    return this;
  }

  order(field: string, opts?: any): QueryBuilder {
    this.orderFields.push(field);
    return this;
  }

  ilike(field: string, value: string): QueryBuilder {
    const searchTerm = value.replace(/%/g, '').toLowerCase();
    this.filters.push({ field, value: { type: 'ilike', term: searchTerm } });
    return this;
  }

  limit(n: number): QueryBuilder {
    this.filters.push({ field: '__limit', value: n });
    return this;
  }

  async _executeSelect() {
    await new Promise(r => setTimeout(r, 50));

    if (this.table === 'persons') {
      let data = [...getPersons()] as any[];

      for (const filter of this.filters) {
        if (filter.field === '__limit') continue;
        if (typeof filter.value === 'object' && filter.value?.type === 'ilike') {
          data = data.filter(p => String(p[filter.field]).toLowerCase().includes(filter.value.term));
        } else {
          data = data.filter(p => p[filter.field] === filter.value);
        }
      }

      for (const field of this.orderFields) {
        data.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (aVal == null) return 1;
          if (bVal == null) return -1;
          return aVal > bVal ? 1 : -1;
        });
      }

      const limitFilter = this.filters.find(f => f.field === '__limit');
      if (limitFilter) {
        data = data.slice(0, limitFilter.value);
      }

      return { data, error: null };
    }

    if (this.table === 'monthly_payments') {
      let data = [...getPayments()] as any[];

      for (const filter of this.filters) {
        if (filter.field === '__limit') continue;
        data = data.filter(p => p[filter.field] === filter.value);
      }

      return { data, error: null };
    }

    if (this.table === 'users') {
      let data = [...getUsers()] as any[];

      for (const filter of this.filters) {
        if (filter.field === '__limit') continue;
        data = data.filter(u => u[filter.field] === filter.value);
      }

      // Handle join syntax like 'id, person_id, persons(phone)'
      if (this.selectFields && this.selectFields.includes('persons(')) {
        const persons = getPersons();
        data = data.map(u => {
          const person = persons.find(p => p.id === u.person_id);
          return { ...u, persons: person ? { phone: person.phone } : null };
        });
      }

      return { data, error: null };
    }

    return { data: [], error: null };
  }

  // Promise-like interface for when await is used
  async then(onFulfilled?: any, onRejected?: any) {
    let result;
    if (this.insertData || this.updateData || this.isDelete) {
      result = await this.execute();
    } else {
      result = await this._executeSelect();
    }
    if (onFulfilled) return onFulfilled(result);
    return result;
  }

  async catch(onRejected?: any) {
    return this;
  }

  async single() {
    if (this.insertData) {
      const result = await this.execute();
      return result;
    }
    const { data, error } = await this._executeSelect();
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Not found' } };
    }
    return { data: data[0], error: null };
  }

  async maybeSingle() {
    const { data } = await this._executeSelect();
    return { data: data && data.length > 0 ? data[0] : null, error: null };
  }

  async execute() {
    await new Promise(r => setTimeout(r, 50));

    if (this.insertData) {
      const newItem: any = {
        id: generateId(),
        ...this.insertData,
        created_at: new Date().toISOString(),
      };

      if (this.table === 'persons') {
        const persons = getPersons();
        persons.push(newItem);
        savePersons(persons);
      } else if (this.table === 'monthly_payments') {
        const payments = getPayments();
        payments.push(newItem);
        savePayments(payments);
      } else if (this.table === 'users') {
        const users = getUsers();
        users.push(newItem);
        saveUsers(users);
      }

      return { data: newItem, error: null };
    }

    if (this.updateData) {
      const { data: items } = await this._executeSelect();
      if (!items || items.length === 0) {
        return { data: null, error: { message: 'Not found' } };
      }

      const updatedItems = items.map(item => ({ ...item, ...this.updateData }));

      if (this.table === 'persons') {
        const persons = getPersons();
        for (const updated of updatedItems) {
          const idx = persons.findIndex(p => p.id === updated.id);
          if (idx >= 0) persons[idx] = updated;
        }
        savePersons(persons);
      } else if (this.table === 'monthly_payments') {
        const payments = getPayments();
        for (const updated of updatedItems) {
          const idx = payments.findIndex(p => p.id === updated.id);
          if (idx >= 0) payments[idx] = updated;
        }
        savePayments(payments);
      } else if (this.table === 'users') {
        const users = getUsers();
        for (const updated of updatedItems) {
          const idx = users.findIndex(u => u.id === updated.id);
          if (idx >= 0) users[idx] = updated;
        }
        saveUsers(users);
      }

      return { data: updatedItems[0], error: null };
    }

    if (this.isDelete) {
      const { data: items } = await this._executeSelect();
      if (!items || items.length === 0) {
        return { error: { message: 'Not found' } };
      }

      const item = items[0];

      if (this.table === 'persons') {
        const persons = getPersons();
        const idx = persons.findIndex(p => p.id === item.id);
        persons.splice(idx, 1);
        savePersons(persons);
      } else if (this.table === 'monthly_payments') {
        const payments = getPayments();
        const idx = payments.findIndex(p => p.id === item.id);
        payments.splice(idx, 1);
        savePayments(payments);
      }

      return { error: null };
    }

    return { error: null };
  }

  // Thenable interface for select chain
  static create(table: string) {
    return new QueryBuilder(table);
  }
}

export const mockDb = {
  from: (table: string) => new QueryBuilder(table),
};
