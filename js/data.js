// Shared banking context used by every module.
// Lower priority number = more urgent.
var TX = [
  { id: 'T1', name: 'Balance Inquiry', at: 0, bt: 2, pr: 3, mem: 50  },
  { id: 'T2', name: 'Cash Withdrawal', at: 1, bt: 5, pr: 1, mem: 120 },
  { id: 'T3', name: 'Cash Deposit',    at: 2, bt: 4, pr: 2, mem: 100 },
  { id: 'T4', name: 'Fund Transfer',   at: 3, bt: 8, pr: 1, mem: 200 },
  { id: 'T5', name: 'Mini Statement',  at: 4, bt: 3, pr: 3, mem: 60  }
];
var $ = function (s) { return document.querySelector(s); };
