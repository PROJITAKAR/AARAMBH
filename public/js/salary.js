const MAX_OPTION_LIMIT = 100000000;
async function fetchSalaryRange() {
    try {
        const response = await fetch('/api/salary-range'); // Update with correct path if necessary
        const data = await response.json();
        

        if (response.ok) {
            const minSalary = data.minSalary;
            const maxSalary = data.maxSalary;

            const selectElement = document.getElementById('maxSalary');
            selectElement.innerHTML = '';
            const option = document.createElement('option');
            option.value = maxSalary;
            option.textContent = 'Max Salary';
            selectElement.appendChild(option);
            

            // Populate the dropdowns with salary ranges
            populateSalaryDropdown('minSalary', 'maxSalary', minSalary, maxSalary);
        } else {
            console.error('Error fetching salary range:', data.error);
        }
    } catch (error) {
        console.error('Error fetching salary range:', error);
    }
};

function populateSalaryDropdown(id1,id2, minSalary, maxSalary) {
    const selectElement1 = document.getElementById(id1);
    const selectElement2 = document.getElementById(id2);

    // Clear existing options
    
    const selectedSalary1=selectElement1.getAttribute('data-filter');
    const selectedSalary2=selectElement2.getAttribute('data-filter');

    // Populate options dynamically within the range
    for (let i = minSalary; i <= Math.min(maxSalary, MAX_OPTION_LIMIT); i += 100000) {
        const option1 = document.createElement('option');
        option1.value = i;
        option1.textContent = `$${i}`;
        if (i === parseInt(selectedSalary1)) {
            option1.selected = true;
        }
        selectElement1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = i;
        option2.textContent = `$${i}`;
        if (i === parseInt(selectedSalary2)) {
            option2.selected = true;
        }
        selectElement2.appendChild(option2);
    }

    if (maxSalary > MAX_OPTION_LIMIT) {
        const option1 = document.createElement('option');
        option1.value = Math.ceil(maxSalary / 100000) * 100000;
        option1.textContent = `$${option1.value}`;
        if (parseInt(option1.value) === parseInt(selectedSalary1)) {
            option1.selected = true;
        }
        selectElement1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = Math.ceil(maxSalary / 100000) * 100000;
        option2.textContent = `$${option2.value}`;
        if (parseInt(option2.value) === parseInt(selectedSalary2) && parseInt(option2.value)!==maxSalary) {
            option2.selected = true;
        }
        selectElement2.appendChild(option2);
    }
}

window.onload = async function () {
     fetchSalaryRange(); // Fetch salary range on page load
};