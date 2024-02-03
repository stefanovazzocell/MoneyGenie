'use strict';

/**
 * The Income class provides a set of tools such as taxable income calculation, bonus calculation, and more 
 */
class Income {
    /**
     * Runs the calculations and sets up the Income class
     * 
     * @param {Number} base_pay the base pay
     * @param {Number} bonus_percentage the bonus percentage
     * @param {Number} stock_grant the stock grant received
     * @param {Number} rrsp_contribution_percentage the rrsp contribution percentage
     * @param {Number} rrsp_matching_percentage the rrsp employer matching percentage
     * @param {Number} espp_contribution_percentage the espp contribution percentage
     * @param {Number} espp_fmv the espp price/fmv percentage
     * @param {Number} additional_income the additional taxable income
     */
    constructor(base_pay, bonus_percentage=0, stock_grant=0, rrsp_contribution_percentage=0, rrsp_matching_percentage=0, espp_contribution_percentage=0, espp_fmv=0, additional_income=0) {
        this.stock_grant = stock_grant
        this.bonus = base_pay*bonus_percentage/100
        this.base_pay = base_pay
        this.salary = base_pay + this.bonus
        // Calculate the RRSP deduction
        this.rrsp_contribution = this.salary*rrsp_contribution_percentage/100
        this.rrsp_matching = this.salary*rrsp_matching_percentage/100
        this.rrsp_total_contribution = this.rrsp_contribution + this.rrsp_matching
        // Calculate the ESPP contribution
        this.espp_contribution = this.salary*espp_contribution_percentage/100
        this.espp_value = this.espp_contribution*100/espp_fmv
        this.espp_taxable_benefit = this.espp_value - this.espp_contribution
        // Calculate the taxable income
        this.taxable_income = this.salary - this.rrsp_contribution + this.stock_grant + this.espp_taxable_benefit + additional_income
        // Calculate the gross income
        this.gross_income_cash = this.salary - this.rrsp_contribution - this.espp_contribution + additional_income
        this.gross_income_stock = this.stock_grant + this.espp_value
        this.gross_income_total = this.gross_income_cash + this.gross_income_stock
    }

    /**
     * Updates the UI components
     */
    update_ui() {
        set_elements_text(".base_pay", format_money(this.base_pay))
        set_elements_text(".bonus", format_money(this.bonus))
        set_elements_text(".rrsp_contribution", format_money(this.rrsp_contribution))
        set_elements_text(".rrsp_matching", format_money(this.rrsp_matching))
        set_elements_text(".rrsp_total_contribution", format_money(this.rrsp_total_contribution))
        set_elements_text(".espp_contribution", format_money(this.espp_contribution))
        set_elements_text(".espp_value", format_money(this.espp_value))
        set_elements_text(".stock_grant", format_money(this.stock_grant))
        set_elements_text(".gross_income_cash", format_money(this.gross_income_cash))
        set_elements_text(".gross_income_stock", format_money(this.gross_income_stock))
    }
}