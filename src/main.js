'use strict';

// Update display
function update_screen(info) {
    const is_string = ['tax_year', 'province']
    const is_bool = ['is_cpp_maxed', 'is_ei_maxed', 'has_federal_overflow', 'has_provincial_overflow']
    // Inject HTML
    const html_update = document.querySelectorAll('[data-html]')
    html_update.forEach(element => {
        if (is_string.indexOf(element.dataset['html']) != -1 || is_bool.indexOf(element.dataset['html']) != -1) {
            element.innerHTML = info[element.dataset['html']]
        } else {
            element.innerHTML = parseFloat(Math.round(info[element.dataset['html']]*100)/100).toFixed(2).toLocaleString()
        }
    });
    // Hide/Show
    const showif_update = document.querySelectorAll('[data-showif]')
    showif_update.forEach(element => {
        if (is_bool.indexOf(element.dataset['showif']) != -1) {
            element.style.display = (info[element.dataset['showif']] ? '' : 'none')
        }
    })
}

// Update graphs
function update_graphs(info) {
    const income_sources_data = {
        labels: [
            'Base Salary',
            'Bonus',
            'Stock (CAD)',
            'ESPP Bonus',
            'Additional Earnings'
        ],
        datasets: [{
            label: 'Income Sources',
            data: [
                info['yearly_base_salary'],
                info['yearly_bonus'],
                info['yearly_stock'],
                info['yearly_espp_bonus'],
                info['yearly_add_earnings'],
            ],
            hoverOffset: 4
        }]
    }
    const outflow_data = {
        labels: [
            'RRSP Contributions',
            'Federal Taxes',
            'Provincial Taxes',
            'CPP Contributions',
            'EI Contributions',
            'Net Income'
        ],
        datasets: [{
            label: 'Income Sources',
            data: [
                info['yearly_rrsp_contribution_employee'],
                info['yearly_federal_taxes'],
                info['yearly_provincial_taxes'],
                info['yearly_cpp_contributions'],
                info['yearly_ei_contributions'],
                info['yearly_net_income']
            ],
            hoverOffset: 4
        }]
    }
    new Chart(
        document.getElementById('sources_graph'),
        {
            type: 'pie',
            data: income_sources_data,
        }
    )
    new Chart(
        document.getElementById('outflow_graph'),
        {
            type: 'pie',
            data: outflow_data,
        }
    )
}

// Run calculation
function run_calculation(inputs) {
    const info = JSON.parse(JSON.stringify(inputs))
    // Run calculations (Bonus, Taxes, RRSP, ESPP, ...)
    info['yearly_bonus'] = info['yearly_base_salary'] * (info['bonus'] / 100.0)
    info['yearly_rrsp_counted_income'] = info['yearly_bonus'] + info['yearly_base_salary']
    info['yearly_rrsp_contribution_employee'] = info['yearly_rrsp_counted_income'] * (info['rrsp_contribution'] / 100.0)
    info['yearly_rrsp_contribution_employer'] = info['yearly_rrsp_counted_income'] * (info['rrsp_matching'] / 100.0)
    info['yearly_rrsp_contribution_total'] = info['yearly_rrsp_contribution_employee'] + info['yearly_rrsp_contribution_employer']
    info['yearly_espp_contribution'] = info['yearly_base_salary'] * (info['espp_contribution'] / 100.0)
    info['yearly_espp_total'] = info['yearly_espp_contribution'] / (info['espp_price'] / 100.0)
    info['yearly_espp_bonus'] = info['yearly_espp_total'] - info['yearly_espp_contribution']
    info['yearly_gross_income'] = info['yearly_base_salary'] + info['yearly_stock'] + info['yearly_bonus'] + info['yearly_espp_bonus'] + info['yearly_add_earnings']
    info['yearly_taxable_income'] = info['yearly_gross_income'] - info['yearly_rrsp_contribution_employee']
    info['yearly_federal_taxes'] = federal_taxes(info['yearly_taxable_income'], info['tax_year'])
    info['yearly_federal_effective_tax_rate'] = 100.0 * (info['yearly_federal_taxes'] / info['yearly_taxable_income'])
    info['yearly_provincial_taxes'] = provincial_taxes(info['yearly_taxable_income'], info['tax_year'], info['province'])
    info['yearly_provincial_effective_tax_rate'] = 100.0 * (info['yearly_provincial_taxes'] / info['yearly_taxable_income'])
    info['yearly_taxes'] = info['yearly_federal_taxes'] + info['yearly_provincial_taxes']
    info['yearly_effective_tax_rate'] = 100.0 * (info['yearly_taxes'] / info['yearly_taxable_income'])
    info['yearly_cpp_contributions'] = cpp_contributions(info['yearly_gross_income'], info['tax_year'])
    info['yearly_cpp_effective_rate'] = 100.0 * (info['yearly_cpp_contributions'] / info['yearly_gross_income'])
    info['yearly_ei_contributions'] = ei_contributions(info['yearly_gross_income'], info['tax_year'])
    info['yearly_ei_effective_rate'] = 100.0 * (info['yearly_ei_contributions'] / info['yearly_gross_income'])
    info['yearly_net_income'] = info['yearly_taxable_income'] - info['yearly_taxes'] - info['yearly_cpp_contributions'] - info['yearly_ei_contributions']
    info['yearly_stock_totals'] = info['yearly_espp_total'] + info['yearly_stock']
    info['monthly_net_income'] = info['yearly_net_income'] / 12
    info['biweekly_net_income'] = info['yearly_net_income'] * 2 / 52
    info['yearly_net_base_income'] = info['yearly_net_income'] - info['yearly_stock_totals']
    info['monthly_net_base_income'] = info['yearly_net_base_income'] / 12
    info['biweekly_net_base_income'] = info['yearly_net_base_income'] * 2 / 52
    // Insights
    info['is_cpp_maxed'] = is_cpp_maxed_out(info['yearly_gross_income'], info['tax_year'])
    info['is_ei_maxed'] = is_ei_maxed_out(info['yearly_gross_income'], info['tax_year'])
    const federal_report = federal_taxes_report(info['yearly_taxable_income'], info['tax_year'])
    const provincial_report = provincial_taxes_report(info['yearly_taxable_income'], info['tax_year'], info['province'])
    info['has_federal_overflow'] = federal_report['can_optimize']
    info['federal_overflow_current'] = federal_report['bracket']
    info['federal_overflow_previous'] = federal_report['last_bracket']
    info['federal_overflow'] = federal_report['overflow']
    info['federal_overflow_rrsp_change'] = federal_report['overflow'] / info['yearly_rrsp_counted_income'] * 100
    info['has_provincial_overflow'] = provincial_report['can_optimize']
    info['provincial_overflow_current'] = provincial_report['bracket']
    info['provincial_overflow_previous'] = provincial_report['last_bracket']
    info['provincial_overflow'] = provincial_report['overflow']
    info['provincial_overflow_rrsp_change'] = provincial_report['overflow'] / info['yearly_rrsp_counted_income'] * 100
    return info
}

// Parse the inputs, run the calculation, and print the results on screen
function calculate_and_display(params) {
    // Get input values
    const inputs = {
        'yearly_base_salary': parseFloat(document.getElementById('base_salary_input').value),
        'bonus': parseFloat(document.getElementById('avg_yearly_bonus_input').value),
        'yearly_stock': parseFloat(document.getElementById('stock_input').value),
        'rrsp_contribution': parseFloat(document.getElementById('rrsp_contribution_input').value),
        'rrsp_matching': parseFloat(document.getElementById('rrsp_matching_input').value),
        'espp_contribution': parseFloat(document.getElementById('espp_contribution_input').value),
        'espp_price': parseFloat(document.getElementById('espp_price_input').value),
        'yearly_add_earnings': parseFloat(document.getElementById('add_earnings_input').value),
        'tax_year': document.getElementById('tax_year_input').value,
        'province': document.getElementById('province_input').value,
    }
    // Adjust USD values
    if (document.getElementById('stock_currency_input').value == 'USD') {
        inputs['yearly_stock'] *= document.getElementById('cad_usd_input').value
    }
    // Run calculation
    const info = run_calculation(inputs)
    // Run supplemental simulations
    info['federal_overflow_rrsp_after_rrsp'] = 0
    info['federal_overflow_rrsp_after_net_income'] = 0
    if (info['has_federal_overflow']) {
        inputs['rrsp_contribution'] += info['federal_overflow_rrsp_change']
        const federal_correction = run_calculation(inputs)
        info['federal_overflow_rrsp_after_rrsp'] = federal_correction['yearly_rrsp_contribution_total'] - info['yearly_rrsp_contribution_total']
        info['federal_overflow_rrsp_after_net_income'] = -(federal_correction['yearly_net_income'] - info['yearly_net_income'])
        inputs['rrsp_contribution'] -= info['federal_overflow_rrsp_change']
    }
    info['provincial_overflow_rrsp_after_rrsp'] = 0
    info['provincial_overflow_rrsp_after_net_income'] = 0
    if (info['has_provincial_overflow']) {
        inputs['rrsp_contribution'] += info['provincial_overflow_rrsp_change']
        const provincial_correction = run_calculation(inputs)
        info['provincial_overflow_rrsp_after_rrsp'] = provincial_correction['yearly_rrsp_contribution_total'] - info['yearly_rrsp_contribution_total']
        info['provincial_overflow_rrsp_after_net_income'] = -(provincial_correction['yearly_net_income'] - info['yearly_net_income'])
        inputs['rrsp_contribution'] -= info['provincial_overflow_rrsp_change']
    }
    // Update screen
    update_screen(info)
    update_graphs(info)
    console.debug(info)
}

// Executes callback function when page is loaded
function on_ready(callback) {
    if(document.readyState === 'interactive' || document.readyState === 'complete') {
        callback(); // Callback
    } else document.addEventListener('DOMContentLoaded', callback);
}

on_ready(()=>{
    const showif_update = document.querySelectorAll('[data-showif]')
    showif_update.forEach(element=>{
        element.style.display = 'none'
    })
    Chart.defaults.color = '#fff';
    Chart.defaults.font.weight = 'bold';
    Chart.defaults.font.size = 20;
    document.getElementById('update_btn').onclick = calculate_and_display
})