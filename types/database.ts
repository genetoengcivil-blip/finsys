export type Profile = {
  id: string;
  full_name: string | null;
  subscription_status: 'free' | 'pro' | 'active';
  stripe_customer_id: string | null;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
};