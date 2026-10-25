# Banking & ATM Transaction Processing: OS Algorithm Visualizer

Operating Systems, 5th Sem CSE. Assignment No. 3 and Practical No. 09 (Problem 5).

A browser-based visualizer that connects four OS concepts through one banking scenario.

| Module | Algorithm | Banking role |
|---|---|---|
| CPU Scheduling | FCFS, SJF, Priority | Orders balance inquiries, withdrawals, deposits and transfers; shows waiting and turnaround time |
| Producer-Consumer | Bounded buffer, mutex, empty/full semaphores | ATMs, mobile app and branches produce requests; processors consume them |
| Memory Management | First Fit, Best Fit, Worst Fit | Gives each transaction a memory block; shows internal and external fragmentation |
| Deadlock Avoidance | Banker's algorithm | Checks that granting DB connections, transaction service and cash module keeps the system safe |

The **Integrated Flow** tab runs: request, buffer, scheduler, memory allocation, Banker's check, execute.

## Run it
No installation needed.
1. Open the folder in VS Code.
2. Open `index.html` in a browser, or right-click it and choose **Open with Live Server**.

## Structure
```
index.html
css/style.css
js/data.js                shared transaction data
js/scheduling.js
js/producer_consumer.js
js/memory.js
js/bankers.js
js/integration.js
js/app.js
```

## Sample data
Transactions T1 to T5 are defined in `js/data.js`. The Banker's example uses 3 resource types (10, 5, 7 instances) and gives the safe sequence T2, T4, T5, T1, T3.

## Authors
Name 1, Name 2 (Class 5th Sem, Section B)
