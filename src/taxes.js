'use strict';

// https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html

// Federal tax brackets
const federal_brackets = {
    "2024": {
        "brackets": [
            [55867, 15],
            [111733, 20.5],
            [173205, 26],
            [246752, 29.32],
            [Infinity, 33],
        ],
        "basic_personal_amount": 15000,
    },
    "2023": {
        "brackets": [
            [53359, 15],
            [106717, 20.5],
            [165430, 26],
            [235675, 29.32],
            [Infinity, 33],
        ],
        "basic_personal_amount": 14398,
    }
}

// Provincial basic personal amounts
const provincial_basic_personal_amount = {
    "2024": {
        "NL": 10382,
        "PE": 12750,
        "NS": 8481,
        "NB": 12458,
        "ON": 11865,
        "MB": 15000,
        "SK": 17661,
        "AB": 21003,
        "BC": 11981,
        "YT": 15000,
        "NT": 16593,
        "NU": 17925,
    },
    "2023": {
        "NL": 9803,
        "PE": 11250,
        "NS": 8481,
        "NB": 11720,
        "ON": 11141,
        "MB": 10145,
        "SK": 16615,
        "AB": 19814,
        "BC": 11302,
        "YT": 14398,
        "NT": 15609,
        "NU": 16862,
    }
}

// Provincial tax brackets
const provincial_brackets = {
    "2024": {
        "NL": [
            [43198, 8.7],
            [86395, 14.5],
            [154244, 15.8],
            [215943, 17.8],
            [275870, 19.8],
            [551739, 20.8],
            [1103478, 21.3],
            [Infinity, 21.8]
        ],
        "PE": [
            [32656, 9.65],
            [64313, 13.63],
            [105000, 16.65],
            [140000, 18],
            [Infinity, 18.75],
        ],
        "NS": [
            [29590, 8.79],
            [59180, 14.95],
            [93000, 16.67],
            [150000, 17.5],
            [Infinity, 21]
        ],
        "NB": [
            [49958, 9.4],
            [99916, 14],
            [185064, 16],
            [Infinity, 19.5]
        ],
        "ON": [
            [51446, 5.05],
            [102894, 9.15],
            [150000, 11.16],
            [220000, 12.16],
            [Infinity, 13.16]
        ],
        "MB": [
            [47000, 10.8],
            [100000, 12.75],
            [Infinity, 17.4]
        ],
        "SK": [
            [52057, 10.5],
            [148734, 12.5],
            [Infinity, 14.5]
        ],
        "AB": [
            [148269, 10],
            [177922, 12],
            [237230, 13],
            [355845, 14],
            [Infinity, 15]
        ],
        "BC": [
            [47937, 5.06],
            [95875, 7.7],
            [110076, 10.5],
            [133664, 12.29],
            [181232, 14.7],
            [252752, 16.8],
            [Infinity, 20.5]
        ],
        "YT": [
            [55867, 6.4],
            [111733, 9],
            [173205, 10.9],
            [500000, 12.8],
            [Infinity, 15]
        ],
        "NT": [
            [50597, 5.9],
            [101198, 8.6],
            [164525, 12.2],
            [Infinity, 14.05]
        ],
        "NU": [
            [53268, 4],
            [106537, 7],
            [173205, 9],
            [Infinity, 11.5]
        ],
    },
    "2023": {
        "NL": [
            [41457, 8.7],
            [82913, 14.5],
            [148027, 15.8],
            [207239, 17.8],
            [264750, 19.8],
            [529500, 20.8],
            [1059000, 21.3],
            [Infinity, 21.8]
        ],
        "PE": [
            [31984, 9.8],
            [63969, 13.8],
            [Infinity, 16.7]
        ],
        "NS": [
            [29590, 8.79],
            [59180, 14.95],
            [93000, 16.67],
            [150000, 17.5],
            [Infinity, 21]
        ],
        "NB": [
            [47715, 9.4],
            [95431, 14],
            [176756, 16],
            [Infinity, 19.5]
        ],
        "ON": [
            [49231, 5.05],
            [98463, 9.15],
            [150000, 11.16],
            [220000, 12.16],
            [Infinity, 13.16]
        ],
        "MB": [
            [36842, 10.8],
            [79625, 12.75],
            [Infinity, 17.4]
        ],
        "SK": [
            [49720, 10.5],
            [142058, 12.5],
            [Infinity, 14.5]
        ],
        "AB": [
            [142292, 10],
            [170751, 12],
            [227668, 13],
            [341502, 14],
            [Infinity, 15]
        ],
        "BC": [
            [45654, 5.06],
            [91310, 7.7],
            [104835, 10.5],
            [127299, 12.29],
            [172602, 14.7],
            [240716, 16.8],
            [Infinity, 20.5]
        ],
        "YT": [
            [53359, 6.4],
            [106717, 9],
            [165430, 10.9],
            [500000, 12.8],
            [Infinity, 15]
        ],
        "NT": [
            [48326, 5.9],
            [96655, 8.6],
            [157139, 12.2],
            [Infinity, 14.05]
        ],
        "NU": [
            [50877, 4],
            [101754, 7],
            [165429, 9],
            [Infinity, 11.5]
        ],
    }
}

/**
 * Federal taxes calculator
 */
class FederalTaxes {
    federal_taxes_table = document.querySelector("#federal_taxes_table")
    federal_taxes_table_header = document.querySelector("#federal_taxes_header")
    federal_taxes_table_footer = document.querySelector("#federal_taxes_footer")
    table_row_template = document.getElementById("taxes_table_row").content

    /**
     * Calculates the taxes for the given year on a taxable_income
     * and constructs a FederalTaxes object
     * 
     * @param {Number} taxable_income the total taxable income to consider
     * @param {String} year the tax year (ex: "2024")
     */
    constructor(taxable_income, year) {
        // Fetch the bucket
        const federal_info = federal_brackets[year]
        if (!federal_info) {
            throw `Can't calculate federal taxes for year "${year}"`
        }
        const [brackets, basic_personal_amount] = [federal_info["brackets"], federal_info["basic_personal_amount"]]

        // Calculate the tax credits
        this.basic_personal_amount = basic_personal_amount
        this.basic_personal_amount_applied = Math.min(basic_personal_amount, taxable_income)
        this.lowest_tax_bracket_percentage = brackets[0][1]
        this.basic_personal_amount_credit = this.basic_personal_amount_applied * this.lowest_tax_bracket_percentage / 100

        // Calculate the taxes
        this.total = 0 // The total taxes to be paid
        this.income = [] // The income in a given bracket
        this.percentage = [] // The percentages applied in a given bracket
        this.taxes = [] // The taxes for a given bracket
        
        let last_upper_limit = 0
        for (let i = 0; i < brackets.length; i++) {
            // Calculate taxes
            const bracket_upper_limit = brackets[i][0]
            const bracket_percentage = brackets[i][1]
            const bracket_size = bracket_upper_limit - last_upper_limit
            const taxed_income = Math.min(bracket_size, taxable_income)
            const tax = taxed_income * bracket_percentage / 100
            this.highest_tax_bracket_percentage = bracket_percentage
            this.highest_tax_bracket_taxed_income = taxed_income
            // Store results
            this.total += tax
            this.income.push(format_money(taxed_income))
            this.percentage.push(`${bracket_percentage}%`)
            this.taxes.push(format_money(tax))
            // Update for next iteration
            taxable_income -= taxed_income
            if (taxable_income <= 0) break
            last_upper_limit = bracket_upper_limit
        }

        this.total_str = format_money(this.total)
    }

    /**
     * 
     * @returns total federal taxes to be paid
     */
    total_taxes() {
        return this.total
    }

    /**
     * Returns the table row for this federal tax calculator
     * 
     * @returns an array of html element
     */
    get_table_rows() {
        const table_rows = []
        for (let i = 0; i < this.income.length; i++) {
            const row_element = this.table_row_template.cloneNode(true).querySelector("tr");
            row_element.childNodes
            row_element.querySelector(".amount").textContent = this.income[i]
            row_element.querySelector(".bracket").textContent = this.percentage[i]
            row_element.querySelector(".tax").textContent = this.taxes[i]
            table_rows.push(row_element)
        }
        return table_rows
    }

    /**
     * Updates the UI to show the federal taxes
     */
    update_table() {
        // Update table
        this.federal_taxes_table.replaceChildren(this.federal_taxes_table_header, ...this.get_table_rows(), this.federal_taxes_table_footer)
        // Update totals
        set_elements_text(".federal_taxes_total", this.total_str)
        set_elements_text(".federal_basic_personal_amount", format_money(this.basic_personal_amount))
        set_elements_text(".federal_basic_personal_amount_applied", format_money(this.basic_personal_amount_applied))
        set_elements_text(".federal_basic_personal_amount_credit", format_money(this.basic_personal_amount_credit))
        set_elements_text(".federal_highest_tax_bracket", this.highest_tax_bracket_percentage)
        set_elements_text(".federal_highest_tax_bracket_income", format_money(this.highest_tax_bracket_taxed_income))
    }
}

/**
 * Provincial taxes calculator
 */
class ProvincialTaxes {
    provincial_taxes_table = document.querySelector("#provincial_taxes_table")
    provincial_taxes_table_header = document.querySelector("#provincial_taxes_header")
    provincial_taxes_table_footer = document.querySelector("#provincial_taxes_footer")
    table_row_template = document.getElementById("taxes_table_row").content

    /**
     * Calculates the taxes for the given year on a taxable_income
     * and constructs a ProvincialTaxes object
     * 
     * @param {Number} taxable_income the total taxable income to consider
     * @param {String} province the province postal code (ex: "BC")
     * @param {String} year the tax year (ex: "2024")
     */
    constructor(taxable_income, province, year) {
        // Fetch the bucket
        const year_brackets = provincial_brackets[year]
        if (!year_brackets) {
            throw `Can't calculate provincial taxes for year "${year}"`
        }
        const brackets = year_brackets[province]
        if (!brackets) {
            throw `Can't calculate provincial taxes for year "${year}" and province "${province}"`
        }
        // Fetch the provincial_basic_personal_amount
        const year_provincial_basic_personal_amount = provincial_basic_personal_amount[year]
        if (!year_provincial_basic_personal_amount) {
            throw `Can't calculate provincial basic personal amount for year "${year}"`
        }
        const basic_personal_amount = year_provincial_basic_personal_amount[province]
        if (!basic_personal_amount) {
            throw `Can't calculate provincial basic personal amount for year "${year}" and province "${province}"`
        }

        // Calculate the tax credits
        this.basic_personal_amount = basic_personal_amount
        this.basic_personal_amount_applied = Math.min(this.basic_personal_amount, taxable_income)
        this.lowest_tax_bracket_percentage = brackets[0][1]
        this.basic_personal_amount_credit = this.basic_personal_amount_applied * this.lowest_tax_bracket_percentage / 100

        // Calculate the taxes
        this.total = 0 // The total taxes to be paid
        this.income = [] // The income in a given bracket
        this.percentage = [] // The percentages applied in a given bracket
        this.taxes = [] // The taxes for a given bracket
        
        let last_upper_limit = 0
        for (let i = 0; i < brackets.length; i++) {
            // Calculate taxes
            const bracket_upper_limit = brackets[i][0]
            const bracket_percentage = brackets[i][1]
            const bracket_size = bracket_upper_limit - last_upper_limit
            const taxed_income = Math.min(bracket_size, taxable_income)
            const tax = taxed_income * bracket_percentage / 100
            this.highest_tax_bracket_percentage = bracket_percentage
            this.highest_tax_bracket_taxed_income = taxed_income
            // Store results
            this.total += tax
            this.income.push(format_money(taxed_income))
            this.percentage.push(`${bracket_percentage}%`)
            this.taxes.push(format_money(tax))
            // Update for next iteration
            taxable_income -= taxed_income
            if (taxable_income <= 0) break
            last_upper_limit = bracket_upper_limit
        }

        this.total_str = format_money(this.total)
    }

    /**
     * 
     * @returns total provincial taxes to be paid
     */
    total_taxes() {
        return this.total
    }

    /**
     * Returns the table row for this provincial tax calculator
     * 
     * @returns an array of html element
     */
    get_table_Rows() {
        const table_rows = []
        for (let i = 0; i < this.income.length; i++) {
            const row_element = this.table_row_template.cloneNode(true).querySelector("tr");
            row_element.childNodes
            row_element.querySelector(".amount").textContent = this.income[i]
            row_element.querySelector(".bracket").textContent = this.percentage[i]
            row_element.querySelector(".tax").textContent = this.taxes[i]
            table_rows.push(row_element)
        }
        return table_rows
    }

    /**
     * Updates the UI to show the provincial taxes
     */
    update_table() {
        // Update table
        this.provincial_taxes_table.replaceChildren(this.provincial_taxes_table_header, ...this.get_table_Rows(), this.provincial_taxes_table_footer)
        // Update totals
        set_elements_text(".provincial_taxes_total", this.total_str)
        set_elements_text(".provincial_basic_personal_amount", format_money(this.basic_personal_amount))
        set_elements_text(".provincial_basic_personal_amount_applied", format_money(this.basic_personal_amount_applied))
        set_elements_text(".provincial_basic_personal_amount_credit", format_money(this.basic_personal_amount_credit))
        set_elements_text(".provincial_highest_tax_bracket", this.highest_tax_bracket_percentage)
        set_elements_text(".provincial_highest_tax_bracket_income", format_money(this.highest_tax_bracket_taxed_income))
    }
}