const Modal = {
    openClose() {
        let modal = document.querySelector('.modal-overlay')
        let classes = modal.classList
        classes.toggle("active")
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
    },

    set(transaction) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transaction))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction)

        App.reload()
    },

    remove(index) {
        this.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // somar as entradas
        let income = 0
        
        this.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },

    expenses() {
        // somas as saídas
        let expenses = 0
        
        this.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expenses += transaction.amount
            }
        })

        return expenses
    },

    total() {
        // entradas - saídas   
        return this.incomes() + this.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    incomeDisplay: document.querySelector('#incomeDisplay'),
    expenseDisplay: document.querySelector('#expenseDisplay'),
    totalDisplay: document.querySelector('#totalDisplay'),
    cardTotal: document.querySelector('.card.total'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover Transação">
            </td>
        </tr>
        `

        return html
    },

    updateBalance() {
        this.incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes())
        this.expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses())
        this.totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total())

        const negativeValue = this.totalDisplay.textContent.search(/-/g) != -1

        if (negativeValue) {
            this.cardTotal.style.background = 'var(--red)'
        } else {
            this.cardTotal.style.background = 'var(--green)'
        }
    },

    clearTransactions() {
        this.transactionsContainer.innerHTML = ""
    },
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return `${signal} ${value}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValuesOfForm() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    validateFields() {
        const {description, amount, date} = this.getValuesOfForm()
        
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let {description, amount, date} = this.getValuesOfForm()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFilds() {
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },

    submit(event) {
        event.preventDefault() // Remove o padrão de envio do formulário

        try {
            this.validateFields()

            // Formatar valores para salvar
            const transaction = this.formatValues()

            // Adicionar nova transação
            Transaction.add(transaction)

            // Limpando inputs
            this.clearFilds()

            // Fechando modal
            Modal.openClose()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
    
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        this.init()
    }
}

App.init()