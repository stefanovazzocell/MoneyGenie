'use strict';

// https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html

const federal_rates = {
    "2023": [
        [53359, 15.00],
        [53358, 20.50],
        [58713, 26.00],
        [70245, 29.32],
        [Infinity, 33.00],
    ]
}

const provincial_rates = {
    "BC": {
        "2023": [
            [45654, 5.06],
            [45656, 7.7],
            [13525, 10.5],
            [22464, 12.29],
            [45303, 14.7],
            [68114, 16.8],
            [Infinity, 20.5]
        ]
    },
    "ON": {
        "2023": [
            [49231, 5.05],
            [49232, 9.15],
            [51537, 11.16],
            [70000, 12.16],
            [Infinity, 13.16]
        ]
    },
    "AB": {
        "2023": [
            [142292, 10],
            [28459, 12],
            [56917, 13],
            [113834, 14],
            [Infinity, 15]
        ]
    }
}

// Calculate taxes based on brackets
function calculate_tax_by_bracket(taxable_income, brackets) {
    let taxes = 0.0
    for (let i = 0; i < brackets.length; i++) {
        const value = brackets[i][0]
        const percentage = brackets[i][1]/100.0
        if (taxable_income <= value) {
            taxes += taxable_income * percentage
            return taxes
        } else {
            taxable_income -= value
            taxes += value * percentage
        }
    }
    return taxes
}

// Calculate federal taxes per given year
function federal_taxes(taxable_income, year) {
    return calculate_tax_by_bracket(taxable_income, federal_rates[year])
}

// Calculate provincial taxes per given year and province
function provincial_taxes(taxable_income, year, province) {
    return calculate_tax_by_bracket(taxable_income, provincial_rates[province][year])
}

// Return a report on potential optimizations
// Will report a potential optimizations if the following two conditions are met:
// - We're not in the lowest bracket already
// - We're less than halfway through the current bracket
function tax_bracket_report(taxable_income, brackets) {
    let last_bracket = brackets[0][1]
    for (let i = 0; i < brackets.length; i++) {
        const value = brackets[i][0]
        const percentage = brackets[i][1]
        if (taxable_income <= value) {
            const is_not_base = percentage!=last_bracket
            const under_half = taxable_income < (value / 2)
            return {
                'overflow': taxable_income,
                'bracket': percentage,
                'last_bracket': last_bracket,
                'can_optimize': is_not_base && under_half
            }
        } else {
            taxable_income -= value
            last_bracket = percentage
        }
    }
    return taxes
}

// Return a report on federal taxes per given year
function federal_taxes_report(taxable_income, year) {
    return tax_bracket_report(taxable_income, federal_rates[year])
}

// Return a report on provincial taxes per given year and province
function provincial_taxes_report(taxable_income, year, province) {
    return tax_bracket_report(taxable_income, provincial_rates[province][year])
}