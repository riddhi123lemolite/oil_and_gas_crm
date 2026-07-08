# Data Understanding, Analytics & Mock-Data Reasoning — Assistant Spec

This is the full source specification for the analytics / data-reasoning behaviour
of the CRM AI assistant. A distilled version is embedded in the LLM system prompt
(`src/lib/ai/prompt.ts` → `buildSystemPrompt`, the `DATA ANALYSIS`, `ANALYTICS
CAPABILITIES`, `DASHBOARD & KPI INTERPRETATION` and `DATA HONESTY` blocks). The
grounded rule engine (`src/lib/ai/assistant.ts`) implements the parts that map to
data actually present in this CRM.

> **Scope note (important):** This is an oil & gas *trading* CRM. The datasets it
> holds are: leads, customers, products/items, quotations (proposals), sales
> orders, invoices, payments, dispatches/shipments, vehicles, drivers, routes,
> inventory, tasks, activities, staff/users, notifications, documents, the audit
> log and live market prices. It does **not** contain vendors, purchase orders,
> projects, tickets, field engineers, assets/equipment or opportunities — for
> those the assistant states the data is unavailable rather than fabricating it.

---

# DATA UNDERSTANDING, ANALYTICS & MOCK DATA REASONING

The AI assistant must not only understand the CRM features but must also intelligently analyze and reason over the data available within the application.

Treat the mock/demo data exactly as if it were production data. Users should feel like they are interacting with a real CRM assistant capable of understanding business information, not just navigating the application.

## Data Awareness

Analyze every dataset available in the application, including but not limited to:

* Customers
* Companies
* Contacts
* Leads
* Opportunities
* Quotations
* Sales Orders
* Purchase Orders
* Invoices
* Payments
* Vendors
* Suppliers
* Products
* Inventory
* Assets
* Equipment
* Projects
* Tickets
* Tasks
* Engineers
* Field Service Records
* Reports
* Dashboards
* Analytics
* Charts
* Graphs
* KPIs
* Tables
* Custom Modules
* Any additional business data present in the application.

Learn the relationships between different modules and use them while answering questions.

---

# DATA ANALYSIS QUESTIONS

Generate and train the assistant to answer every possible analytical question based on the available mock data.

Examples include but are not limited to:

### Rankings

Who is the top buyer?

Who purchased the most?

Which customer generated the highest revenue?

Which vendor has supplied the most products?

Who has the highest number of quotations?

Which salesperson closed the most deals?

Which project has the highest budget?

Which customer has the highest outstanding amount?

Who has placed the most purchase orders?

Who generated the maximum profit?

Which engineer handled the most tickets?

Which asset has the highest maintenance cost?

Which region generated the most sales?

Which product sells the most?

Which service is most requested?

---

### Highest / Lowest

Which was the highest purchase?

Which was the largest quotation?

Which invoice has the highest value?

Which customer owes the most money?

Which vendor supplied the highest quantity?

Which product has the lowest stock?

Which customer has the least activity?

Which project has the highest expenses?

Which quotation has the maximum discount?

Which month recorded the highest sales?

Which week had the maximum revenue?

Which engineer resolved the most issues?

Which customer generated the least revenue?

---

### Comparisons

Compare Customer A and Customer B.

Compare this month with last month.

Compare sales by region.

Compare vendors.

Compare quotations.

Compare projects.

Compare engineers.

Compare inventory.

Compare products.

Compare yearly performance.

Compare quarterly revenue.

Compare monthly purchases.

Compare asset utilization.

Compare maintenance costs.

---

### Trends

Show sales trends.

Show revenue growth.

Show purchase trends.

Show quotation trends.

Show customer acquisition trends.

Show inventory trends.

Show payment trends.

Show monthly comparisons.

Show yearly comparisons.

Identify seasonal trends.

Explain fluctuations.

Explain growth.

Explain decline.

---

### Filtering

Show only pending quotations.

Show only approved invoices.

Show only overdue payments.

Show customers from Gujarat.

Show vendors from Mumbai.

Show invoices above ₹1,00,000.

Show quotations below ₹50,000.

Show inactive customers.

Show high-value customers.

Show completed projects.

Show rejected quotations.

Show cancelled orders.

Show products below reorder level.

Show overdue tasks.

Show assets under maintenance.

Generate hundreds of similar filtering questions for every module.

---

### Sorting

Sort by revenue.

Sort by purchase amount.

Sort alphabetically.

Sort by latest.

Sort by oldest.

Sort by highest value.

Sort by lowest value.

Sort by due date.

Sort by customer name.

Sort by project size.

Sort by inventory quantity.

Sort by quotation amount.

Generate every possible sorting variation.

---

### Aggregation

How many quotations were created?

How many invoices are pending?

How many customers are active?

How many projects are ongoing?

How many vendors are registered?

How many engineers are assigned?

How many products are in stock?

What is the total revenue?

What is the total purchase amount?

What is the average order value?

What is the average quotation amount?

What is the total outstanding balance?

Calculate totals, averages, maximums, minimums, percentages, counts, ratios, medians, and other meaningful business metrics wherever applicable.

---

### Business Intelligence

Who are our best customers?

Which customers should we follow up with?

Which quotations need attention?

Which invoices are overdue?

Which projects are at risk?

Which products require restocking?

Which vendors perform best?

Which salesperson needs improvement?

What should management focus on this month?

Which department is performing best?

Which customers are becoming inactive?

Predict the next logical action based on available data whenever possible.

---

### Natural Language Queries

The assistant should understand conversational questions such as:

Who bought the most?

Top customer?

Highest sale?

Biggest invoice?

Largest quotation?

Best-performing customer?

Top vendor?

Most profitable customer?

Highest paying client?

Biggest order?

Lowest stock?

Most active customer?

Pending payments?

Late invoices?

Show top 10 customers.

Show top five quotations.

Who purchased valves?

Show chemical orders.

Largest refinery project.

Biggest pipeline contract.

Highest revenue month.

Worst performing month.

Highest maintenance cost.

Largest inventory item.

Top-selling product.

Most frequently ordered item.

The assistant should recognize these naturally without requiring formal wording.

---

### Follow-up Analytics

The assistant must maintain conversational context.

Example:

Who is the top buyer?

How much did they purchase?

Show all their quotations.

Export them.

Who is second?

Compare them with the first customer.

Show this year's purchases only.

Now show last year's.

Generate a chart.

Email the report.

The assistant should remember the previous conversation without asking the user to repeat information unnecessarily.

---

### Dashboard Interpretation

Train the assistant to explain every KPI, chart, graph, statistic, metric, dashboard card, gauge, progress bar, heat map, trend line, pie chart, bar graph, line graph, area chart, table, and report present in the CRM.

It should explain:

* What the metric means.
* Why the value is high or low.
* Possible business reasons.
* Business impact.
* Recommended actions.
* Related records.
* Trends over time.
* Comparisons with previous periods.
* Any anomalies or outliers.

---

### Intelligent Reasoning

When users ask analytical questions, the assistant should intelligently query the available mock/demo data, apply filters, sorting, grouping, calculations, aggregations, and comparisons as required, and return accurate answers based only on the data available in the CRM.

The assistant must never fabricate values or invent records. If the requested information is unavailable, it should clearly communicate that and, where appropriate, suggest the closest relevant information or guide the user to the appropriate module or report.
