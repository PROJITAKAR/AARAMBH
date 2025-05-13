function toggleDropdown(event) {
    const dropdown = document.getElementById('dropdownMenu');
    const button = event.currentTarget;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    // Toggle the dropdown visibility
    button.setAttribute('aria-expanded', !isExpanded);
    dropdown.classList.toggle('hidden', isExpanded);

    // Close the dropdown if clicked outside
    document.addEventListener('click', function(event) {
        const isClickInside = dropdown.contains(event.target) || button.contains(event.target);
        if (!isClickInside) {
            button.setAttribute('aria-expanded', 'false');
            dropdown.classList.add('hidden');
        }
    });
}