import { parse } from 'papaparse';
import { Transaction } from '@/types/transaction';
import { parseCustomDate } from '@/utils/dateParser';

const headerMap: { [key: string]: string } = {
  'Type': 'type',
  'Product': 'product',
  'Started Date': 'started_date',
  'Completed Date': 'completed_date',
  'Description': 'description',
  'Amount': 'amount',
  'Fee': 'fee',
  'Currency': 'currency',
  'State': 'state',
  'Balance': 'balance',
};

// Rent transaction identification configuration
const RENT_DESCRIPTION = 'To Trading Places';
const RENT_AMOUNT = -2200;
const ADJUSTED_RENT_AMOUNT = -1000;

const isRentTransaction = (transaction: Transaction): boolean => {
  const description = transaction.description?.toLowerCase().trim() || '';
  return description === RENT_DESCRIPTION.toLowerCase() && transaction.amount === RENT_AMOUNT;
};

const adjustRentTransaction = (transaction: Transaction): Transaction => {
  if (isRentTransaction(transaction)) {
    console.log('Adjusting rent transaction:', transaction);
    return {
      ...transaction,
      amount: ADJUSTED_RENT_AMOUNT,
      description: `⚡${transaction.description} (adjusted)`,
    };
  }
  return transaction;
};

export const parseCSV = (text: string): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const transformedHeader = headerMap[header] || header;
        console.log('Transforming header:', header, 'to:', transformedHeader);
        return transformedHeader;
      },
      transform: (value, field) => {
        console.log(`Raw value for field ${field}:`, value);
        if (['amount', 'fee', 'balance'].includes(field)) {
          const numericValue = parseFloat(value.replace(/,/g, ''));
          console.log(`Parsed numeric value for field ${field}:`, numericValue);
          return isNaN(numericValue) ? null : numericValue; // Handle NaN cases
        }
        if (['completed_date', 'started_date'].includes(field)) {
          const parsedDate = parseCustomDate(value);
          console.log(`Parsed date for field ${field}:`, parsedDate);
          if (!parsedDate) {
            console.error('Failed to parse date:', value);
            return null;
          }
          return parsedDate;
        }
        return value;
      },
      complete: (results) => {
        const transactions = (results.data as any[]) // Using any[] to handle type conflicts
          .filter(row => row.state === 'COMPLETED' && row.completed_date && row.started_date)
          .map((row: { [key: string]: any }): Transaction => {
            const transaction: Transaction = {
              id: row.id,
              user_id: row.user_id,
              type: row.type,
              product: row.product,
              started_date: row.started_date,
              completed_date: row.completed_date,
              description: row.description,
              amount: row.amount,
              fee: row.fee,
              currency: row.currency,
              state: row.state,
              balance: row.balance,
            };

            const adjustedTransaction = adjustRentTransaction(transaction);
            console.log('Transaction after adjustment:', adjustedTransaction);
            return adjustedTransaction;
          });

        console.log('Filtered completed transactions count:', transactions.length);
        resolve(transactions);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      },
    });
  });
};
