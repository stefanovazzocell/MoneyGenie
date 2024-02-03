'use strict';

// https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/canada-caregiver-amount.html
const partner_caregiver_amount_by_year = {
    "2024": 2499,
    "2023": 2350,
}

// The maximum RRSP increase suggestion in percentage points
const max_rrsp_increase = 12

// The maximum RRSP overall in percentage points
const max_rrsp_value = 15

// A generous estimate of what cost of living is in Canada;
// used to display some insights
const cost_of_living = 50000

// A generous estimate of what cost of (comfortable) living is
// in Canada; used to display some insights
const comfortable_living = 70000

// A generous estimate of what cost of living is in Canada
// while being able to pay for a house in the future
const afford_house = 150000

/**
 * Draws the graphs
 * 
 * @param {Number} base_pay the base pay received
 * @param {Number} bonus the bonus pay received
 * @param {Number} stock_grant the stock grant
 * @param {Number} espp_taxable_benefit the espp taxable benefits (difference between contribution and award)
 * @param {Number} additional_income the additional taxable income
 * @param {Number} rrsp_contribution the rrsp contribution
 * @param {Number} federal_taxes the federal taxes
 * @param {Number} provincial_taxes the provincial taxes
 * @param {Number} cpp_contributions the CPP contributions
 * @param {Number} ei_contributions the EI contributions
 * @param {Number} net_income the net income
 */
function update_graphs(base_pay, bonus=0, stock_grant=0, espp_taxable_benefit=0, additional_income=0, rrsp_contribution=0, federal_taxes=0, provincial_taxes=0, cpp_contributions=0, ei_contributions=0, net_income=0) {
    const inflow_max = base_pay + bonus + stock_grant + espp_taxable_benefit + additional_income
    set_graph_bar('base_pay', base_pay, base_pay*100/inflow_max)
    set_graph_bar('bonus', bonus, bonus*100/inflow_max)
    set_graph_bar('stock_grant', stock_grant, stock_grant*100/inflow_max)
    set_graph_bar('espp_taxable_benefit', espp_taxable_benefit, espp_taxable_benefit*100/inflow_max)
    set_graph_bar('additional_income', additional_income, additional_income*100/inflow_max)
    const outflow_max = rrsp_contribution + federal_taxes + provincial_taxes + cpp_contributions + ei_contributions + net_income
    set_graph_bar('rrsp_contribution', rrsp_contribution, rrsp_contribution*100/outflow_max)
    set_graph_bar('federal_taxes', federal_taxes, federal_taxes*100/outflow_max)
    set_graph_bar('provincial_taxes', provincial_taxes, provincial_taxes*100/outflow_max)
    set_graph_bar('cpp_contributions', cpp_contributions, cpp_contributions*100/outflow_max)
    set_graph_bar('ei_contributions', ei_contributions, ei_contributions*100/outflow_max)
    set_graph_bar('net_income', net_income, net_income*100/outflow_max)
}

/**
 * Estimates the net income with the given parameters (minus the tax credits)
 * 
 * @param {String} province the province postal code (ex: "BC")
 * @param {String} year the tax year (ex: "2024")
 * @param {Number} base_pay the base pay
 * @param {Number} bonus_percentage the bonus percentage
 * @param {Number} stock_grant the stock grant received
 * @param {Number} rrsp_contribution_percentage the rrsp contribution percentage
 * @param {Number} rrsp_matching_percentage the rrsp employer matching percentage
 * @param {Number} espp_contribution_percentage the espp contribution percentage
 * @param {Number} espp_fmv the espp price/fmv percentage
 * @param {Number} additional_income the additional taxable income
 * @returns 
 */
function estimate_net_income(province, year, base_pay, bonus_percentage, stock_grant, rrsp_contribution_percentage, rrsp_matching_percentage, espp_contribution_percentage, espp_fmv, additional_income) {
    // Run calculators
    const income = new Income(base_pay, bonus_percentage, stock_grant, rrsp_contribution_percentage, rrsp_matching_percentage, espp_contribution_percentage, espp_fmv, additional_income)
    const federal_taxes = new FederalTaxes(income.taxable_income, year)
    const provincial_taxes = new ProvincialTaxes(income.taxable_income, province, year)
    const contributions = new Contributions(income.taxable_income, year)

    // Calculate
    return income.gross_income_cash + income.gross_income_stock - federal_taxes.total_taxes() - provincial_taxes.total_taxes() - contributions.get_total()
}


/**
 * Re-calculates the taxes and refreshes all the displayed information.
 */
function update_screen() {
    // Retrieve inputs
    const base_pay = get_input_number_value("base_salary_input")
    const bonus_percentage = get_input_number_value("bonus_input")
    const stock_grant = get_input_number_value("stock_grant_input")
    const rrsp_contribution_percentage = get_input_number_value("rrsp_contribution_input")
    const rrsp_matching_percentage = get_input_number_value("rrsp_matching_input")
    const espp_contribution_percentage = get_input_number_value("espp_contribution_input")
    const espp_fmv = get_input_number_value("espp_fmv_input")
    const additional_income = get_input_number_value("additional_income_input")
    const has_partner = document.querySelector("#partner_status").value == "yes"
    const partner_net_income = (has_partner ? get_input_number_value("partner_net_income") : 0)
    const partner_caregiver = document.querySelector("#partner_caregiver").value == "yes"
    const year = document.querySelector("#settings_year_input").value
    const province = document.querySelector("#settings_province_input").value
    
    // Run calculators
    const income = new Income(base_pay, bonus_percentage, stock_grant, rrsp_contribution_percentage, rrsp_matching_percentage, espp_contribution_percentage, espp_fmv, additional_income)
    const federal_taxes = new FederalTaxes(income.taxable_income, year)
    const provincial_taxes = new ProvincialTaxes(income.taxable_income, province, year)
    const contributions = new Contributions(income.taxable_income, year)
    
    // More calculations...
    // - Partner tax credits
    const partner_caregiver_amount = partner_caregiver_amount_by_year[year]
    if (!partner_caregiver_amount) throw `Can't get the partner caregiver amount for the year "${year}"`
    let partner_credit_applied = Math.max(federal_taxes.basic_personal_amount_applied + (partner_caregiver ? partner_caregiver_amount : 0) - partner_net_income, 0)
    if (!has_partner) partner_credit_applied = 0
    const partner_credit = partner_credit_applied * federal_taxes.lowest_tax_bracket_percentage / 100
    // - Tax credits totals
    const total_tax_credits = federal_taxes.basic_personal_amount_credit + provincial_taxes.basic_personal_amount_credit + partner_credit
    // - Net income
    const net_income = income.gross_income_cash + income.gross_income_stock - federal_taxes.total_taxes() - provincial_taxes.total_taxes() - contributions.get_total() + total_tax_credits
    const net_income_cash = net_income - income.gross_income_stock
    const net_income_stock = net_income - net_income_cash
    // - Has potential to save?
    const might_save = cost_of_living <= (income.gross_income_cash + partner_net_income)
    const might_buy_house = afford_house <= (income.gross_income_total + partner_net_income)
    // - Federal rrsp increase tip
    const federal_rrsp_increase_suggestion = federal_taxes.highest_tax_bracket_taxed_income * 100 / net_income
    const federal_rrsp_estimated_income = total_tax_credits + estimate_net_income(province, year, base_pay, bonus_percentage, stock_grant, rrsp_contribution_percentage + federal_rrsp_increase_suggestion, rrsp_matching_percentage, espp_contribution_percentage, espp_fmv, additional_income)
    const federal_rrsp_new_percentage = federal_rrsp_increase_suggestion + rrsp_contribution_percentage
    const federal_rrsp_net_income_increase = net_income - federal_rrsp_estimated_income
    const federal_rrsp_worth_it = (
        federal_rrsp_increase_suggestion <= max_rrsp_increase && // We're not increasing the RRSP too much
        (federal_rrsp_estimated_income + partner_net_income) >= comfortable_living && // We're still providing a comfortable living
        federal_rrsp_new_percentage <= max_rrsp_value && // The RRSP is not too high
        federal_taxes.highest_tax_bracket_percentage > federal_taxes.lowest_tax_bracket_percentage // We're not at the lowest bracket
    )
    // - Provincial rrsp increase tip
    const provincial_rrsp_increase_suggestion = provincial_taxes.highest_tax_bracket_taxed_income * 100 / net_income
    const provincial_rrsp_estimated_income = total_tax_credits + estimate_net_income(province, year, base_pay, bonus_percentage, stock_grant, rrsp_contribution_percentage + provincial_rrsp_increase_suggestion, rrsp_matching_percentage, espp_contribution_percentage, espp_fmv, additional_income)
    const provincial_rrsp_new_percentage = provincial_rrsp_increase_suggestion + rrsp_contribution_percentage
    const provincial_rrsp_net_income_increase = net_income - provincial_rrsp_estimated_income
    const provincial_rrsp_worth_it = (
        provincial_rrsp_increase_suggestion <= max_rrsp_increase && // We're not increasing the RRSP too much
        (provincial_rrsp_estimated_income + partner_net_income) >= comfortable_living && // We're still providing a comfortable living
        provincial_rrsp_new_percentage <= max_rrsp_value && // The RRSP is not too high
        provincial_taxes.highest_tax_bracket_percentage > federal_taxes.lowest_tax_bracket_percentage // We're not at the lowest bracket
    )

    // Show/hide elements
    show_hide(".if_partner", has_partner)
    show_hide(".if_max_cpp", contributions.maxed_cpp)
    show_hide(".if_max_ei", contributions.maxed_ei)
    show_hide(".if_might_save", might_save)
    show_hide(".if_might_buy_house", might_buy_house)
    show_hide(".if_federal_rrsp_worth_it", federal_rrsp_worth_it)
    show_hide(".if_provincial_rrsp_worth_it", provincial_rrsp_worth_it)

    // Update ui via calculators
    income.update_ui()
    federal_taxes.update_table()
    provincial_taxes.update_table()
    contributions.update_table()

    // Update ui
    set_elements_text(".net_income", format_money(net_income))
    set_elements_text(".net_income_cash", format_money(net_income_cash))
    set_elements_text(".net_income_stock", format_money(net_income_stock))
    set_elements_text(".total_tax_credits", format_money(total_tax_credits))
    set_elements_text(".partner_credit_applied", format_money(partner_credit_applied))
    set_elements_text(".partner_credit", format_money(partner_credit))
    set_elements_text(".federal_rrsp_increase_suggestion", federal_rrsp_increase_suggestion.toFixed(2))
    set_elements_text(".federal_rrsp_net_income_increase", format_money(federal_rrsp_net_income_increase))
    set_elements_text(".provincial_rrsp_increase_suggestion", provincial_rrsp_increase_suggestion.toFixed(2))
    set_elements_text(".provincial_rrsp_net_income_increase", format_money(provincial_rrsp_net_income_increase))

    // Update graphs
    update_graphs(
        base_pay,
        income.bonus,
        stock_grant,
        income.espp_taxable_benefit,
        additional_income,
        income.rrsp_contribution,
        federal_taxes.total_taxes(),
        provincial_taxes.total_taxes(),
        contributions.get_total_cpp(),
        contributions.get_total_ei(),
        net_income
    )
}

/**
 * Executes callback function when page is loaded
 * 
 * @param {Function} callback 
 */
function on_ready(callback) {
    if(document.readyState === 'interactive' || document.readyState === 'complete') {
        callback(); // Callback
    } else document.addEventListener('DOMContentLoaded', callback);
}

on_ready(()=>{
    // Make sure we have a default tab open
    if (["#calculation", "#analysis"].indexOf(window.location.hash) == -1) window.location.hash = "#calculation";
    // Focus on salary input
    document.getElementById("base_salary_input").select()

    // Update the screen
    update_screen()
    // Automatically update on input
    document.body.oninput = update_screen
})
