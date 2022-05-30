const { GoogleSpreadsheet } = require('google-spreadsheet');

class Sheet {
    constructor(id) {
        this.sheet = id || process.env.SHEET_ID;
        this.doc;
        this.expenseIdx = { start: 0, end: 0 };
        this.incomeIdx = { start: 0, end: 0 };
        this.termRow;
    }

    get page() {
        return this.doc.sheetsByTitle[process.env.NAME];
    }

    async init() {
        this.doc = await new GoogleSpreadsheet(this.sheet);
        await this.doc.useServiceAccountAuth({
            private_key_id: process.env.PRIV_KEY_ID.replace(new RegExp('\\\\n', 'g'), '\n'),
            client_email: process.env.EMAIL,
            private_key: process.env.PRIV_KEY,
        });

        await this.doc.loadInfo();
        await this.page.loadCells();
        let onExpenses = false;
        for (let i = 0; i < this.page.rowCount; i++) {
            const name = this.page.getCell(i, 0).value;
            if (name == "Expenses") { this.expenseIdx.start = i + 1; onExpenses = true; }
            if (name == "Incomes") { this.incomeIdx.start = i + 1; onExpenses = false; }
            if (name == "Term") { this.termRow = i; }
            if (name == "TOTAL") {
                if (onExpenses) {
                    this.expenseIdx.end = i;
                    onExpenses = false;
                } else {
                    this.incomeIdx.end = i;
                }
            }
        }
    }

    getTerm(term) {
        let expenses = [];
        let income = [];
        for (let i = 0; i < this.page.columnCount; i++) {
            if (this.page.getCell(this.termRow, i).value != term) continue;
            for (let row = this.expenseIdx.start; row < this.expenseIdx.end; row++) {
                const name = this.page.getCell(row, 0).value;
                const value = this.page.getCell(row, i).value || 0;
                expenses.push({ name, value });
            }
            for (let row = this.incomeIdx.start; row < this.incomeIdx.end; row++) {
                const name = this.page.getCell(row, 0).value;
                const value = this.page.getCell(row, i).value || 0;
                income.push({ name, value });
            }
            break;
        }
        return { term, expenses, income };
    }

    async updateVal(value, r, c, s, e) {
        let didUpdate = false;
        for (let i = 0; i < this.page.columnCount; i++) {
            if (this.page.getCell(this.termRow, i).value != c) continue;
            for (let row = s; row < e; row++) {
                if (this.page.getCell(row, 0).value != r) continue;
                didUpdate = true;
                this.page.getCell(row, i).value = value;
                break;
            }
            break;
        }
        if (!didUpdate) throw Error("No update done.")
        await this.page.saveUpdatedCells();
    }

    async saveExpense(expense, term, amount) {
        await this.updateVal(amount, expense, term, this.expenseIdx.start, this.expenseIdx.end);
    }

    async saveIncome(income, term, amount) {
        await this.updateVal(amount, income, term, this.incomeIdx.start, this.incomeIdx.end);
    }

    async getTerms() {
        let data = [];
        for (let i = 1; i < this.page.columnCount; i++) {
            let term = this.page.getCell(this.termRow, i).value
            let { expenses, income } = this.getTerm(term);
            data.push({ term, expenses, income });
        }
        return data;
    }
}

module.exports = Sheet;