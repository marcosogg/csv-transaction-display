import { Transaction } from '@/types/transaction';
import { Category } from '@/types/categorization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CreditCard, PiggyBank, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatEuroDate, formatEuroAmount, formatTransactionCount } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface TransactionStatsProps {
  transactions: Transaction[];
  categories?: Category[];
  isLoading?: boolean;
}

const TransactionStats = ({ transactions, categories = [], isLoading = false }: TransactionStatsProps) => {
  const navigate = useNavigate();
  
  const roundedTransactions = transactions.map(transaction => ({
    ...transaction,
    amount: parseFloat(transaction.amount.toFixed(1)),
  }));

  // Debug logs for all transactions
  console.log('All Transactions:', roundedTransactions);

  const payments = roundedTransactions.filter(t => t.amount < 0 && t.type === 'CARD_PAYMENT');
  console.log('Card Payments:', payments);

  const transfers = roundedTransactions.filter(t => t.type === 'TRANSFER' && t.description === 'Credit card repayment');
  console.log('Credit Card Repayments:', transfers);
  console.log('All Transfers:', roundedTransactions.filter(t => t.type === 'TRANSFER'));
  console.log('Transfers with "card" in description:', roundedTransactions.filter(t => 
    t.type === 'TRANSFER' && t.description?.toLowerCase().includes('card')
  ));

  const savings = roundedTransactions.filter(t => t.product === 'Savings' && t.amount > 0);
  console.log('Savings Transactions:', savings);
  console.log('All transactions with Savings product:', roundedTransactions.filter(t => t.product === 'Savings'));

  const stats = {
    cardPayments: {
      amount: payments.reduce((acc, curr) => acc + Math.abs(curr.amount), 0),
      count: payments.length,
    },
    savingsTotal: {
      amount: savings.reduce((acc, curr) => acc + curr.amount, 0),
      count: savings.length,
    },
    creditCardRepayments: {
      amount: transfers.reduce((acc, curr) => acc + Math.abs(curr.amount), 0),
      count: transfers.length,
    },
  };

  console.log('Calculated Stats:', stats);

  const dates = transactions
    .map(t => new Date(t.completed_date || '').getTime())
    .sort((a, b) => a - b);

  const firstTransactionDate = dates.length > 0 ? new Date(dates[0]) : null;
  const lastTransactionDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : null;

  const handleCountClick = (filterType: string, filterValue?: string) => {
    let queryParams = new URLSearchParams();
    
    if (filterType === 'CARD_PAYMENT') {
      queryParams.set('type', filterType);
    } else if (filterType === 'product') {
      queryParams.set('product', filterValue || '');
    } else if (filterType === 'TRANSFER') {
      queryParams.set('type', filterType);
      queryParams.set('description', filterValue || '');
    }
    
    console.log('Navigation params:', queryParams.toString());
    navigate(`/transactions?${queryParams.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Transaction Dates Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Financial Overview</h1>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">First Transaction</span>
            <span className="font-medium">
              {firstTransactionDate ? formatEuroDate(firstTransactionDate.toISOString()) : 'No transactions'}
            </span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Last Transaction</span>
            <span className="font-medium">
              {lastTransactionDate ? formatEuroDate(lastTransactionDate.toISOString()) : 'No transactions'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Card Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold tracking-tight">
                {formatEuroAmount(stats.cardPayments.amount)}
              </div>
              <button
                onClick={() => handleCountClick('CARD_PAYMENT')}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                {formatTransactionCount(stats.cardPayments.count)} transactions
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-green-500/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold tracking-tight">
                {formatEuroAmount(stats.savingsTotal.amount)}
              </div>
              <button
                onClick={() => handleCountClick('product', 'Savings')}
                className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500 transition-colors hover:bg-green-500/20 cursor-pointer"
              >
                {formatTransactionCount(stats.savingsTotal.count)} transactions
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credit Card Repayment
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold tracking-tight">
                {formatEuroAmount(stats.creditCardRepayments.amount)}
              </div>
              <button
                onClick={() => handleCountClick('TRANSFER', 'Credit card repayment')}
                className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-500/20 cursor-pointer"
              >
                {formatTransactionCount(stats.creditCardRepayments.count)} transactions
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionStats;
