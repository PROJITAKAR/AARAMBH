document.addEventListener('DOMContentLoaded', function () {
    const skillsSelect = new Choices('#skills', {
        removeItemButton: true,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'Select your skills',
        noChoicesText: 'No choices to choose from',
        minItemCount: 1,
    });

    const disabilitySelect = new Choices('#disability', {
        removeItemButton: true,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'Select Disabilities',
        noChoicesText: 'No choices to choose from',
        minItemCount: 1,
    });

    const accessibilitySelect = new Choices('#accessibilityFeatures', {
        removeItemButton: true,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'Select Accessibility Features',
        noChoicesText: 'No choices to choose from',
        minItemCount: 1,
    });
});