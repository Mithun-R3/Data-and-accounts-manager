import type { Person, MonthlyPayment, AppUser } from './types';

export const generateId = () => Math.random().toString(36).slice(2, 11);

export const MOCK_PERSONS: Person[] = [
  {
    id: '550e8400-1',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    number_of_plots: 5,
    booking_date: '2024-01-15',
    referrer_id: null,
    level: 1,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '550e8400-2',
    name: 'Priya Sharma',
    phone: '9876543211',
    number_of_plots: 3,
    booking_date: '2024-02-20',
    referrer_id: '550e8400-1',
    level: 2,
    created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: '550e8400-3',
    name: 'Amit Patel',
    phone: '9876543212',
    number_of_plots: 2,
    booking_date: '2024-03-10',
    referrer_id: '550e8400-1',
    level: 2,
    created_at: '2024-03-10T10:00:00Z',
  },
  {
    id: '550e8400-4',
    name: 'Neha Singh',
    phone: '9876543213',
    number_of_plots: 4,
    booking_date: '2024-04-05',
    referrer_id: '550e8400-2',
    level: 3,
    created_at: '2024-04-05T10:00:00Z',
  },
  {
    id: '550e8400-5',
    name: 'Vikram Das',
    phone: '9876543214',
    number_of_plots: 1,
    booking_date: '2024-05-12',
    referrer_id: '550e8400-2',
    level: 3,
    created_at: '2024-05-12T10:00:00Z',
  },
  {
    id: '550e8400-6',
    name: 'Anjali Verma',
    phone: '9876543215',
    number_of_plots: 3,
    booking_date: '2024-06-08',
    referrer_id: '550e8400-3',
    level: 3,
    created_at: '2024-06-08T10:00:00Z',
  },
];

export const MOCK_PAYMENTS: MonthlyPayment[] = [
  // Rajesh Kumar (550e8400-1) - paid most months
  { id: '600e1-1', person_id: '550e8400-1', year: 2024, month: 1, amount_paid: 50000, is_paid: true, paid_at: '2024-01-20T00:00:00Z', razorpay_order_id: 'ord_1', razorpay_payment_id: 'pay_1', created_at: '2024-01-20T00:00:00Z' },
  { id: '600e1-2', person_id: '550e8400-1', year: 2024, month: 2, amount_paid: 50000, is_paid: true, paid_at: '2024-02-15T00:00:00Z', razorpay_order_id: 'ord_2', razorpay_payment_id: 'pay_2', created_at: '2024-02-15T00:00:00Z' },
  { id: '600e1-3', person_id: '550e8400-1', year: 2024, month: 3, amount_paid: null, is_paid: false, paid_at: null, razorpay_order_id: null, razorpay_payment_id: null, created_at: '2024-03-01T00:00:00Z' },
  { id: '600e1-4', person_id: '550e8400-1', year: 2024, month: 4, amount_paid: 50000, is_paid: true, paid_at: '2024-04-10T00:00:00Z', razorpay_order_id: 'ord_3', razorpay_payment_id: 'pay_3', created_at: '2024-04-10T00:00:00Z' },
  // Priya Sharma (550e8400-2)
  { id: '600e2-1', person_id: '550e8400-2', year: 2024, month: 2, amount_paid: 30000, is_paid: true, paid_at: '2024-02-25T00:00:00Z', razorpay_order_id: 'ord_4', razorpay_payment_id: 'pay_4', created_at: '2024-02-25T00:00:00Z' },
  { id: '600e2-2', person_id: '550e8400-2', year: 2024, month: 3, amount_paid: null, is_paid: false, paid_at: null, razorpay_order_id: null, razorpay_payment_id: null, created_at: '2024-03-01T00:00:00Z' },
  { id: '600e2-3', person_id: '550e8400-2', year: 2024, month: 4, amount_paid: 30000, is_paid: true, paid_at: '2024-04-15T00:00:00Z', razorpay_order_id: 'ord_5', razorpay_payment_id: 'pay_5', created_at: '2024-04-15T00:00:00Z' },
  // Amit Patel (550e8400-3)
  { id: '600e3-1', person_id: '550e8400-3', year: 2024, month: 3, amount_paid: 20000, is_paid: true, paid_at: '2024-03-20T00:00:00Z', razorpay_order_id: 'ord_6', razorpay_payment_id: 'pay_6', created_at: '2024-03-20T00:00:00Z' },
  { id: '600e3-2', person_id: '550e8400-3', year: 2024, month: 4, amount_paid: null, is_paid: false, paid_at: null, razorpay_order_id: null, razorpay_payment_id: null, created_at: '2024-04-01T00:00:00Z' },
  // Neha Singh (550e8400-4)
  { id: '600e4-1', person_id: '550e8400-4', year: 2024, month: 4, amount_paid: 40000, is_paid: true, paid_at: '2024-04-20T00:00:00Z', razorpay_order_id: 'ord_7', razorpay_payment_id: 'pay_7', created_at: '2024-04-20T00:00:00Z' },
  { id: '600e4-2', person_id: '550e8400-4', year: 2024, month: 5, amount_paid: null, is_paid: false, paid_at: null, razorpay_order_id: null, razorpay_payment_id: null, created_at: '2024-05-01T00:00:00Z' },
  // Vikram Das (550e8400-5)
  { id: '600e5-1', person_id: '550e8400-5', year: 2024, month: 5, amount_paid: 15000, is_paid: true, paid_at: '2024-05-18T00:00:00Z', razorpay_order_id: 'ord_8', razorpay_payment_id: 'pay_8', created_at: '2024-05-18T00:00:00Z' },
  // Anjali Verma (550e8400-6)
  { id: '600e6-1', person_id: '550e8400-6', year: 2024, month: 6, amount_paid: null, is_paid: false, paid_at: null, razorpay_order_id: null, razorpay_payment_id: null, created_at: '2024-06-01T00:00:00Z' },
];

export const MOCK_USERS: AppUser[] = [
  {
    id: 'admin-user-123',
    person_id: null,
    role: 'admin',
    username: 'admin',
    password_override: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-1',
    person_id: '550e8400-1',
    role: 'user',
    username: 'Rajesh Kumar',
    password_override: null,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-2',
    person_id: '550e8400-2',
    role: 'user',
    username: 'Priya Sharma',
    password_override: null,
    created_at: '2024-02-20T00:00:00Z',
  },
  {
    id: 'user-3',
    person_id: '550e8400-3',
    role: 'user',
    username: 'Amit Patel',
    password_override: null,
    created_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 'user-4',
    person_id: '550e8400-4',
    role: 'user',
    username: 'Neha Singh',
    password_override: null,
    created_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 'user-5',
    person_id: '550e8400-5',
    role: 'user',
    username: 'Vikram Das',
    password_override: null,
    created_at: '2024-05-12T00:00:00Z',
  },
  {
    id: 'user-6',
    person_id: '550e8400-6',
    role: 'user',
    username: 'Anjali Verma',
    password_override: null,
    created_at: '2024-06-08T00:00:00Z',
  },
];
