// Toggle Category List
const categoryButton = document.querySelector('.category-button');
const categories = document.querySelector('.categories');

categoryButton.addEventListener('click', () => {
    categories.style.display = categories.style.display === 'none' || !categories.style.display ? 'flex' : 'none';
});



// Toggle Dropdown in Navbar for All Categories
const allCategoriesButton = document.querySelector('.navbar .category-dropdown-button');
const allCategoriesDropdown = document.querySelector('.navbar .category-dropdown');

document.addEventListener('click', (event) => {
    if (allCategoriesButton.contains(event.target)) {
        // Toggle dropdown visibility
        allCategoriesDropdown.style.display = 
            allCategoriesDropdown.style.display === 'none' || !allCategoriesDropdown.style.display ? 'block' : 'none';
    } else if (!allCategoriesDropdown.contains(event.target)) {
        // Close dropdown if clicked outside
        allCategoriesDropdown.style.display = 'none';
    }
});
