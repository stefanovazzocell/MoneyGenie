'use strict';

/**
 * Updates the width of a graph bar to a given percentage
 * 
 * @param {String} name the name of the graph value to update
 * @param {Number} value
 * @param {Number} percentage
 */
function set_graph_bar(name, value, percentage) {
    document.querySelectorAll(`div[data-width="${name}"]`).forEach((el)=>{
        el.style.width = `calc(${percentage}% - 1px)`
    })
    document.querySelectorAll(`td[data-percentage="${name}"]`).forEach((el)=>{
        el.textContent = `${percentage.toFixed(1)}%`
    })
    document.querySelectorAll(`td[data-value="${name}"]`).forEach((el)=>{
        el.textContent = format_money(value)
    })
}

/**
 * Formats a value as "1'234'567.89"
 * 
 * @param {Number} value 
 * @returns 
 */
function format_money(value) {
    const formattedNumber = value.toFixed(2)
    const [integerPart, decimalPart] = formattedNumber.split(".")
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return `${formattedIntegerPart}.${decimalPart} $`
}

/**
 * Formats any JS value into a number (defaulting to default_value if not possible)
 * 
 * @param {*} value the value to turn into a number
 * @param {Number} default_value if value is not a number, default_value will be returned
 * @returns a Number
 */
function format_number(value, default_value=0) {
    if (isNaN(value)) return default_value
    return Number(value)
}

/**
 * Gets and converts an input value into a number
 * 
 * @param {String} id the element id
 * @returns the input value as a number or 0
 */
function get_input_number_value(id) {
    return format_number(document.getElementById(id).value, 0)
}

/**
 * Sets some elements' text value
 * 
 * @param {String} query to find all relevant elements
 * @param {*} text the value to set the element text to
 */
function set_elements_text(query, text) {
    document.querySelectorAll(query).forEach(el => {
        el.textContent = text
    });
}

/**
 * Show/hide elements
 * 
 * @param {String} query to find all relevant elements
 * @param {Boolean} show if true shows the element, otherwise hides it
 */
function show_hide(query, show) {
    document.querySelectorAll(query).forEach(el => {
        if (show) {
            el.classList.remove('hide')
        } else el.classList.add('hide')
    });
}