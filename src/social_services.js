'use strict';

// https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html

const cpp_rates = {
    "2024": [
        {
            'name': "CPP Basic Exception",
            'rate': 0,
            'ceiling': 3500,
        },
        {
            'name': "CPP",
            'rate': 5.95,
            'ceiling': 68500,
        },
        {
            'name': "CPP2",
            'rate': 4,
            'ceiling': 73200,
        },
    ],
    "2023": [
        {
            'name': "CPP Basic Exception",
            'rate': 0,
            'ceiling': 3500,
        },
        {
            'name': "CPP",
            'rate': 5.95,
            'ceiling': 66600,
        },
    ]
}

// https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html

const ei_rates = {
    "2024":  {
        'employee_rate': 1.66,
        'max_employee_contribution': 1049.12,
    },
    "2023":  {
        'employee_rate': 1.63,
        'max_employee_contribution': 1002.45,
    }
}

/**
 * Contributions (CPP + EI) calculator
 */
class Contributions {
    contributions_table = document.querySelector("#contributions_table")
    contributions_table_header = document.querySelector("#contributions_header")
    contributions_table_footer = document.querySelector("#contributions_footer")
    table_row_template = document.getElementById("contributions_table_row").content

    /**
     * Calculates the contributions for the given year on a taxable_income
     * and constructs a Contributions object
     * 
     * @param {Number} taxable_income the total taxable income to consider
     * @param {String} year the tax year (ex: "2024")
     */
    constructor(taxable_income, year) {
        // Fetch the bucket
        const cpp_rate = cpp_rates[year]
        if (!cpp_rate) {
            throw `Can't calculate cpp contributions for the year "${year}"`
        }
        const ei_rate_requested = ei_rates[year]
        if (!ei_rate_requested) {
            throw `Can't calculate ei contributions for the year "${year}"`
        }
        const [ei_rate, ei_max_contribution] = [ei_rate_requested["employee_rate"], ei_rate_requested["max_employee_contribution"]]

        // Calculate EI contributions
        this.ei_total = Math.min((taxable_income * ei_rate / 100), ei_max_contribution) // Total EI contributions
        this.ei_income = Math.min(taxable_income, (ei_max_contribution * 100 / ei_rate))
        this.maxed_ei = (ei_max_contribution * 100 / ei_rate) <= taxable_income

        // Calculate CPP contributions
        this.cpp_total = 0 // Total CPP contributions
        this.item = [] // The item added/subtracted
        this.income = [] // The income in a given bracket
        this.percentage = [] // The percentages applied in a given bracket
        this.contributions = [] // The taxes for a given bracket

        let last_cpp_ceiling = 0
        for (let i = 0; i < cpp_rate.length; i++) {
            // Calculate CPP
            const cpp_ceiling = cpp_rate[i]["ceiling"]
            const cpp_rate_percentage = cpp_rate[i]["rate"]
            const bracket_size = cpp_ceiling - last_cpp_ceiling
            const contributed_income = Math.min(bracket_size, taxable_income)
            const contribution = contributed_income * cpp_rate_percentage / 100
            // Store results
            this.cpp_total += contribution
            this.item.push(cpp_rate[i]["name"])
            this.income.push(format_money(contributed_income))
            this.percentage.push(`${cpp_rate_percentage}%`)
            this.contributions.push(format_money(contribution))
            // Update for next iteration
            taxable_income -= contributed_income
            if (taxable_income <= 0) break
            last_cpp_ceiling = cpp_ceiling
        }
        
        // Check if we're over the max CPP contribution
        this.maxed_cpp = taxable_income > 0

        // Add EI
        this.item.push("EI (Employment Insurance)")
        this.income.push(format_money(this.ei_income))
        this.percentage.push(`${ei_rate}%`)
        this.contributions.push(format_money(this.ei_total))

        // Formatting
        this.cpp_total_fmt = format_money(this.cpp_total)
        this.ei_total_fmt = format_money(this.ei_total)
        this.total_fmt = format_money(this.cpp_total+this.ei_total)
    }

    /**
     * 
     * @returns total contributions to be paid
     */
    get_total() {
        return this.cpp_total + this.ei_total
    }

    /**
     * 
     * @returns total CPP contributions to be paid
     */
    get_total_cpp() {
        return this.cpp_total
    }

    /**
     * 
     * @returns total EI contributions to be paid
     */
    get_total_ei() {
        return this.ei_total
    }

    /**
     * Returns the table rows for this contributions
     * 
     * @returns an array of html element
     */
    get_table_rows() {
        const table_rows = []
        for (let i = 0; i < this.item.length; i++) {
            const row_element = this.table_row_template.cloneNode(true).querySelector("tr");
            row_element.childNodes
            row_element.querySelector(".item").textContent = this.item[i]
            row_element.querySelector(".amount").textContent = this.income[i]
            row_element.querySelector(".bracket").textContent = this.percentage[i]
            row_element.querySelector(".tax").textContent = this.contributions[i]
            table_rows.push(row_element)
        }
        return table_rows
    }

    /**
     * Updates the UI to show the contributions
     */
    update_table() {
        // Update table
        this.contributions_table.replaceChildren(this.contributions_table_header, ...this.get_table_rows(), this.contributions_table_footer)
        // Update totals
        set_elements_text(".contributions_total", this.total_fmt)
        set_elements_text(".cpp_total", this.cpp_total_fmt)
        set_elements_text(".ei_total", this.ei_total_fmt)
    }
}
