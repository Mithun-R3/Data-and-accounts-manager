export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      persons: {
        Row: Person;
        Insert: PersonInsert;
        Update: Partial<PersonInsert>;
      };
      monthly_payments: {
        Row: MonthlyPayment;
        Insert: MonthlyPaymentInsert;
        Update: Partial<MonthlyPaymentInsert>;
      };
      users: {
        Row: AppUser;
        Insert: AppUserInsert;
        Update: Partial<AppUserInsert>;
      };
    };
  };
}

export interface Person {
  id: string;
  name: string;
  phone: string;
  number_of_plots: number;
  booking_date: string;
  referrer_id: string | null;
  level: number;
  created_at: string;
}

export interface PersonInsert {
  id?: string;
  name: string;
  phone: string;
  number_of_plots: number;
  booking_date: string;
  referrer_id?: string | null;
  level?: number;
  created_at?: string;
}

export interface MonthlyPayment {
  id: string;
  person_id: string;
  year: number;
  month: number;
  amount_paid: number | null;
  is_paid: boolean;
  paid_at: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface MonthlyPaymentInsert {
  id?: string;
  person_id: string;
  year: number;
  month: number;
  amount_paid?: number | null;
  is_paid?: boolean;
  paid_at?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
}

export interface AppUser {
  id: string;
  person_id: string | null;
  role: 'admin' | 'user';
  username: string;
  password_override: string | null;
  created_at: string;
}

export interface AppUserInsert {
  id: string;
  person_id?: string | null;
  role?: 'admin' | 'user';
  username: string;
  password_override?: string | null;
}

export type PersonWithReferrer = Person & { referrer?: Person | null };
