'use strict';

// https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html

const cpp_rates = {
    "2023": {
        'basic_exception': 3500,
        'employee_rate': 5.95,
        'max_employee_contribution': 3754.45
    }
}

// Return CPP rates
function cpp_contributions(income, year) {
    return Math.min(Math.max(0, income - cpp_rates[year]['basic_exception']) * (cpp_rates[year]['employee_rate']/100.0), cpp_rates[year]['max_employee_contribution'])
}

// Returns true if the user maxed out CPP contributions
function is_cpp_maxed_out(income, year) {
    return cpp_contributions(income, year) >= cpp_rates[year]['max_employee_contribution']
}

// https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html

const ei_rates = {
    "2023": {
        'employee_rate': 1.63,
        'max_employee_contribution': 1002.45,
    }
}

// Return EI rates
function ei_contributions(income, year) {
    return Math.min(income * (ei_rates[year]['employee_rate']/100.0), ei_rates[year]['max_employee_contribution'])
}

// Returns true if the user maxed out EI contributions
function is_ei_maxed_out(income, year) {
    return ei_contributions(income, year) >= ei_rates[year]['max_employee_contribution']
}